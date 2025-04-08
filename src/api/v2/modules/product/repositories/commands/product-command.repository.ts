import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { generateSlug } from '@/common/utils';
import { PrismaService } from '@/prisma/prisma.service';
import {
    PRODUCT_BASIC_SELECT,
    PRODUCT_DETAIL_SELECT,
    ProductBasic,
    ProductWithVariant,
} from '@/prisma/selectors';
import { BRAND_TOKENS } from '@v2/modules/brand/constants';
import { IBrandQueryService } from '@v2/modules/brand/interfaces';
import { CATEGORY_TOKENS } from '@v2/modules/category/constants';
import { ICategoryQueryService } from '@v2/modules/category/interfaces';
import { PRODUCT_TOKENS } from '@v2/modules/product/constants';
import { CreateProductDto, UpdateProductDto } from '@v2/modules/product/dtos';
import {
    IProductCommandRepository,
    IProductMediaHandler,
    IVariantCommandRepository,
} from '@v2/modules/product/interfaces';

@Injectable()
export class ProductCommandRepository implements IProductCommandRepository {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(BRAND_TOKENS.SERVICES.QUERY)
        private readonly brandQueryService: IBrandQueryService,
        @Inject(CATEGORY_TOKENS.SERVICES.QUERY)
        private readonly categoryQueryService: ICategoryQueryService,
        @Inject(PRODUCT_TOKENS.HANDLERS.MEDIA)
        private readonly mediaHandler: IProductMediaHandler,
        @Inject(PRODUCT_TOKENS.REPOSITORIES.VARIANT_COMMAND)
        private readonly variantCommandRepository: IVariantCommandRepository,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<ProductWithVariant> {
        const { name, brand_id, category_id, ...productDto } = createProductDto;

        const [brand, category] = await Promise.all([
            this.brandQueryService.findById(brand_id),
            this.categoryQueryService.findById(category_id),
        ]);

        if (!brand) {
            throw new NotFoundException(`Brand with slug ${brand_id} not found`);
        }

        if (!category) {
            throw new NotFoundException(`Category with slug ${category_id} not found`);
        }

        const slug = generateSlug(name);

        return this.prisma.$transaction(async tx => {
            const images = {
                createMany: {
                    data: productDto.images,
                },
            };

            const descriptions = {
                createMany: {
                    data: productDto.descriptions,
                },
            };

            const product = await tx.product.create({
                data: {
                    name,
                    slug,
                    main_image: productDto.main_image,
                    short_description: productDto.short_description,
                    brand_id,
                    category_id,
                    status: productDto.status || 'DRAFT',
                    is_featured: productDto.is_featured || false,
                    images,
                    descriptions,
                },
                select: PRODUCT_DETAIL_SELECT,
            });

            const variants = await Promise.all(
                productDto.variants.map(variant => {
                    return this.variantCommandRepository.create(product.id, variant);
                }),
            );

            for (let i = 0; i < variants.length; i++) {
                const variant = variants[i];
                const variantAttributes = variant.variant_attributes;

                await Promise.all([
                    tx.variantAttribute.createMany({
                        data: variantAttributes.map(item => ({
                            variant_id: variant.id,
                            attribute_id: item.attributes.id,
                            value: item.value,
                        })),
                    }),
                    tx.inventory.create({
                        data: {
                            variant_id: variant.id,
                            quantity_change: variant.stock_quantity,
                            reason: 'INITIAL',
                        },
                    }),
                ]);
            }

            return { product, variants };
        });
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductBasic> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            select: {
                id: true,
                images: true,
                descriptions: true,
                warranties: true,
                technical_specs: true,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const {
            images: newImages,
            descriptions: newDescriptions,
            warranties: newWarranties,
            technical_specs: newTechnicalSpecs,
            ...productData
        } = updateProductDto;

        let images = {};
        if (newImages) {
            images = {
                deleteMany: {},
                createMany: {
                    data: newImages,
                },
            };

            await Promise.all(
                product.images.map(image => this.mediaHandler.deleteImage(image.url)),
            );
        } else {
            images = product.images;
        }

        let descriptions = {};
        if (newDescriptions) {
            descriptions = {
                createMany: {
                    data: newDescriptions,
                },
            };
        } else {
            descriptions = product.descriptions;
        }

        let warranties = {};
        if (newWarranties) {
            warranties = {
                createMany: {
                    data: newWarranties,
                },
            };
        } else {
            warranties = product.warranties;
        }

        let technical_specs = {};
        if (newTechnicalSpecs) {
            technical_specs = {
                create: {
                    specs: {
                        createMany: {
                            data: newTechnicalSpecs,
                        },
                    },
                },
            };
        } else {
            technical_specs = product.technical_specs;
        }

        return this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                images,
                descriptions,
                warranties,
                technical_specs,
            },
            select: PRODUCT_BASIC_SELECT,
        });
    }

    async softDelete(id: string): Promise<boolean> {
        return this.updateProductDeletedStatus(id, true);
    }

    async restore(id: string): Promise<boolean> {
        return this.updateProductDeletedStatus(id, false);
    }

    private async updateProductDeletedStatus(id: string, isDeleted: boolean): Promise<boolean> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        const result = await this.prisma.product.update({
            where: { id },
            data: { deleted_at: isDeleted ? new Date() : null },
            select: { id: true },
        });

        return result !== null;
    }
}
