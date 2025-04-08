import { Prisma } from '@prisma/client';

export const PRODUCT_IMAGE_SELECT = {
    id: true,
    url: true,
    alt_text: true,
    position: true,
} as const;

export const PRODUCT_DESCRIPTION_SELECT = {
    id: true,
    content: true,
} as const;

export const PRODUCT_BRAND_SELECT = {
    id: true,
    name: true,
    logo_url: true,
    slug: true,
} as const;

export const PRODUCT_CATEGORY_SELECT = {
    id: true,
    name: true,
    slug: true,
} as const;

export const PRODUCT_PROMOTION_SELECT = {
    id: true,
    name: true,
    description: true,
    discount_type: true,
    discount_value: true,
} as const;

export const PRODUCT_WARRANTY_SELECT = {
    duration: true,
    unit: true,
    conditions: true,
} as const;

export const PRODUCT_TECHNICAL_SPECS_SELECT = {
    specs: {
        select: {
            key: true,
            value: true,
        },
    },
} as const;

export const PRODUCT_REVIEW_USER_SELECT = {
    id: true,
    email: true,
    name: true,
    avatar: true,
} as const;

export const PRODUCT_REVIEW_CHILD_SELECT = {
    id: true,
    user: {
        select: PRODUCT_REVIEW_USER_SELECT,
    },
    comment: true,
    created_at: true,
    updated_at: true,
} as const;

export const PRODUCT_REVIEW_SELECT = {
    id: true,
    user: {
        select: PRODUCT_REVIEW_USER_SELECT,
    },
    rating: true,
    comment: true,
    video_url: true,
    images: {
        select: PRODUCT_IMAGE_SELECT,
    },
    _count: true,
    children: {
        select: PRODUCT_REVIEW_CHILD_SELECT,
    },
    created_at: true,
    updated_at: true,
} as const;

export const ATTRIBUTE_SELECT = {
    id: true,
    name: true,
    slug: true,
} as const;

export const VARIANT_ATTRIBUTE_SELECT = {
    id: true,
    value: true,
    attributes: {
        select: ATTRIBUTE_SELECT,
    },
} as const;

export const PRODUCT_COMBO_SELECT = {
    id: true,
    name: true,
    slug: true,
    main_variant_id: true,
    price: true,
    original_price: true,
    discount: true,
    status: true,
    start_date: true,
    end_date: true,
} as const;

export const PRODUCT_BASIC_SELECT = {
    id: true,
    name: true,
    main_image: true,
    slug: true,
    short_description: true,
    is_featured: true,
    status: true,
    images: {
        select: PRODUCT_IMAGE_SELECT,
    },
} as const;

export type ProductBasic = Prisma.ProductGetPayload<{
    select: typeof PRODUCT_BASIC_SELECT;
}>;

export const PRODUCT_VARIANT_SELECT = {
    id: true,
    sku: true,
    thumbnail: true,
    price: true,
    compare_at_price: true,
    stock_quantity: true,
    weight: true,
    discount: true,
    is_featured: true,
    slug: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
    status: true,
    is_default: true,
    additional_specs: true,
    dimensions: true,
    images: {
        select: PRODUCT_IMAGE_SELECT,
    },
    technical_specs: {
        select: PRODUCT_TECHNICAL_SPECS_SELECT,
    },
    warranties: {
        select: PRODUCT_WARRANTY_SELECT,
    },
    variant_attributes: {
        select: VARIANT_ATTRIBUTE_SELECT,
    },
    reviews: {
        where: {
            parent_id: null,
        },
        select: PRODUCT_REVIEW_SELECT,
    },
    combos: {
        select: PRODUCT_COMBO_SELECT,
    },
    product: {
        select: PRODUCT_BASIC_SELECT,
    },
} as const;

export type ProductVariant = Prisma.ProductVariantGetPayload<{
    select: typeof PRODUCT_VARIANT_SELECT;
}>;

export const PRODUCT_DETAIL_SELECT = {
    ...PRODUCT_BASIC_SELECT,
    created_at: true,
    updated_at: true,
    deleted_at: true,
    descriptions: {
        select: PRODUCT_DESCRIPTION_SELECT,
    },
    brand: {
        select: PRODUCT_BRAND_SELECT,
    },
    category: {
        select: PRODUCT_CATEGORY_SELECT,
    },
    promotions: {
        select: PRODUCT_PROMOTION_SELECT,
    },
    warranties: {
        select: PRODUCT_WARRANTY_SELECT,
    },
    variants: {
        select: PRODUCT_VARIANT_SELECT,
    },
    technical_specs: {
        select: PRODUCT_TECHNICAL_SPECS_SELECT,
    },
} as const;

export type ProductDetail = Prisma.ProductGetPayload<{
    select: typeof PRODUCT_DETAIL_SELECT;
}>;

export type ProductWithVariant = {
    product: ProductDetail;
    variants: ProductVariant[];
};
