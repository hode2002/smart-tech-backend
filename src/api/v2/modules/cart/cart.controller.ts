import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetUserId, ResponseMessage } from '@/common/decorators';
import { AtJwtGuard } from '@v2/modules/auth/guards';
import { CART_TOKENS } from '@v2/modules/cart/constants';
import {
    ChangeVariantDto,
    CreateCartDto,
    DeleteCartDto,
    UpdateCartDto,
} from '@v2/modules/cart/dto';
import { ICartCommandService, ICartQueryService } from '@v2/modules/cart/interfaces';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@Controller('cart')
export class CartController {
    constructor(
        @Inject(CART_TOKENS.SERVICES.QUERY)
        private readonly cartQueryService: ICartQueryService,
        @Inject(CART_TOKENS.SERVICES.COMMAND)
        private readonly cartCommandService: ICartCommandService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Add product to cart' })
    @ApiBody({ type: CreateCartDto })
    @ApiResponse({
        status: 201,
        description: 'Product added to cart successfully',
    })
    @ApiResponse({ status: 404, description: 'User or product not found' })
    @ResponseMessage('Add to cart success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.CREATED)
    async addItem(@GetUserId() userId: string, @Body() createCartDto: CreateCartDto) {
        return this.cartCommandService.addItem(userId, createCartDto);
    }

    @Post('change-variant')
    @ApiOperation({ summary: 'Change product variant in cart' })
    @ApiBody({ type: ChangeVariantDto })
    @ApiResponse({
        status: 200,
        description: 'Product variant changed successfully',
    })
    @ApiResponse({ status: 404, description: 'User, cart item, or product not found' })
    @ResponseMessage('Change variant success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.OK)
    async changeVariant(@GetUserId() userId: string, @Body() changeVariantDto: ChangeVariantDto) {
        return this.cartCommandService.changeVariant(userId, changeVariantDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products in user cart' })
    @ApiResponse({
        status: 200,
        description: 'Returns all products in the user cart',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ResponseMessage('Get products from cart success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.OK)
    async findItems(@GetUserId() userId: string) {
        return this.cartQueryService.findByUserId(userId);
    }

    @Patch()
    @ApiOperation({ summary: 'Update product quantity in cart' })
    @ApiBody({ type: UpdateCartDto })
    @ApiResponse({
        status: 200,
        description: 'Product quantity updated successfully',
    })
    @ApiResponse({ status: 404, description: 'User, cart item, or product not found' })
    @ResponseMessage('Update quantity success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.OK)
    async updateQuantity(@GetUserId() userId: string, @Body() updateCartDto: UpdateCartDto) {
        return this.cartCommandService.updateQuantity(userId, updateCartDto);
    }

    @Delete()
    @ApiOperation({ summary: 'Remove product from cart' })
    @ApiBody({ type: DeleteCartDto })
    @ApiResponse({
        status: 200,
        description: 'Product removed from cart successfully',
    })
    @ApiResponse({ status: 404, description: 'User, cart item, or product not found' })
    @ResponseMessage('Remove success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.OK)
    async deleteItem(@GetUserId() userId: string, @Body() deleteCartDto: DeleteCartDto) {
        return this.cartCommandService.deleteItem(userId, deleteCartDto);
    }
}
