import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OrderStatus, UserRole } from '@prisma/client';
import { Request } from 'express';

import { GetUserId, Permission, ResponseMessage } from '@/common/decorators';
import { PaginationDto } from '@/common/dtos';
import { RoleGuard } from '@/common/guards';
import { AtJwtGuard } from '@v2/modules/auth/guards';
import { ORDER_TOKENS } from '@v2/modules/order/constants';
import { CheckoutDto } from '@v2/modules/order/dtos';
import { IOrderCommandService, IOrderQueryService } from '@v2/modules/order/interfaces';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrderController {
    constructor(
        @Inject(ORDER_TOKENS.SERVICES.ORDER_COMMAND)
        private readonly orderCommandService: IOrderCommandService,
        @Inject(ORDER_TOKENS.SERVICES.ORDER_QUERY)
        private readonly orderQueryService: IOrderQueryService,
    ) {}

    @ApiOperation({ summary: 'Get all orders (Admin only)' })
    @ApiResponse({
        status: 200,
        description: 'Returns all orders in the system',
    })
    @Get()
    @ResponseMessage('Get all orders success')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.OK)
    async getAll(@Query() paginationDto: PaginationDto) {
        return this.orderQueryService.findAll(paginationDto.page, paginationDto.limit);
    }

    @ApiOperation({ summary: 'Get all orders for admin dashboard' })
    @ApiResponse({
        status: 200,
        description: 'Returns all orders with additional details for admin',
    })
    @Get('/admin')
    @ResponseMessage('Get all orders success')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.OK)
    async getAllByAdmin(@Query() paginationDto: PaginationDto) {
        return this.orderQueryService.findAllManagement(paginationDto.page, paginationDto.limit);
    }

    @ApiOperation({ summary: 'Checkout order' })
    @ApiBody({ type: CheckoutDto })
    @ApiResponse({
        status: 201,
        description: 'Checkout order successfully',
    })
    @Post('checkout')
    @ResponseMessage('Checkout order successfully')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.CREATED)
    async checkout(
        @Req() req: Request,
        @GetUserId() userId: string,
        @Body() checkoutDto: CheckoutDto,
    ) {
        return this.orderCommandService.checkout(req, userId, checkoutDto);
    }

    @ApiOperation({ summary: 'Cancel an order' })
    @ApiParam({ name: 'id', description: 'Order ID to cancel' })
    @ApiResponse({
        status: 200,
        description: 'Order cancelled successfully',
    })
    @Post('cancel/:id')
    @ResponseMessage('Cancel order success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.OK)
    async cancel(@GetUserId() userId: string, @Param('id') id: string) {
        return this.orderCommandService.cancel(userId, id);
    }

    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns order details',
    })
    @Get(':id')
    @ResponseMessage('Get order by id success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        return this.orderQueryService.findById(id);
    }

    @ApiOperation({ summary: 'Get orders by status' })
    @ApiParam({
        name: 'status',
        description: 'Order status',
        enum: OrderStatus,
    })
    @ApiResponse({
        status: 200,
        description: 'Returns orders with the specified status',
    })
    @Get('status/:status')
    @ResponseMessage('Get order by status success')
    @UseGuards(AtJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 50, ttl: 60000 } })
    async findByStatus(@Param('status') status: OrderStatus, @GetUserId() userId: string) {
        return this.orderQueryService.findByStatus(userId, status);
    }

    @ApiOperation({ summary: 'Update order status' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: 'Order status updated successfully by admin',
    })
    @Patch(':id/status/admin')
    @ResponseMessage('Update order status success')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.OK)
    async updateStatusByAdmin(@Param('id') id: string, @Body() orderStatus: OrderStatus) {
        return this.orderCommandService.updateStatus(id, orderStatus);
    }
}
