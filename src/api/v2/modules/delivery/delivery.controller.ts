import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import {
    IDeliveryCommandService,
    IDeliveryQueryService,
} from '@/api/v2/modules/delivery/interfaces';
import { Permission, ResponseMessage } from '@/common/decorators';
import { PaginationDto } from '@/common/dtos';
import { RoleGuard } from '@/common/guards';
import { AtJwtGuard } from '@v2/modules/auth/guards';
import { CreateDeliveryDto, UpdateDeliveryDto } from '@v2/modules/delivery/dto';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
    constructor(
        private readonly queryService: IDeliveryQueryService,
        private readonly commandService: IDeliveryCommandService,
    ) {}

    @Post()
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Create new delivery method' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Delivery method has been created successfully',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
    })
    @ResponseMessage('Create success')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDeliveryDto: CreateDeliveryDto) {
        return await this.commandService.create(createDeliveryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all delivery methods with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return all delivery methods',
    })
    @ResponseMessage('Get all delivery success')
    @HttpCode(HttpStatus.OK)
    async findAll(@Query() pagination: PaginationDto) {
        return await this.queryService.findAll(pagination.page, pagination.limit);
    }

    @Get('admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Admin: Get all delivery methods including deleted ones' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return all delivery methods for admin',
    })
    @ResponseMessage('Get all delivery success')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.OK)
    async findAllManagement(@Query() pagination: PaginationDto) {
        return await this.queryService.findAllManagement(pagination.page, pagination.limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get delivery method by ID' })
    @ApiParam({ name: 'id', required: true, description: 'Delivery method ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return delivery method details',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Delivery method not found',
    })
    @ResponseMessage('Get delivery by id success')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string) {
        return await this.queryService.findById(id);
    }

    @Patch(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update delivery method' })
    @ApiParam({ name: 'id', required: true, description: 'Delivery method ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delivery method updated successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Delivery method not found',
    })
    @ResponseMessage('Update delivery success')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
        return await this.commandService.update(id, updateDeliveryDto);
    }

    @Patch(':id/restore')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Restore soft-deleted delivery method' })
    @ApiParam({ name: 'id', required: true, description: 'Delivery method ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delivery method restored successfully',
    })
    @ResponseMessage('Restore delivery successfully')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.OK)
    async restore(@Param('id') id: string) {
        return this.commandService.restore(id);
    }

    @Delete(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Soft delete delivery method' })
    @ApiParam({ name: 'id', required: true, description: 'Delivery method ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delivery method soft deleted successfully',
    })
    @ResponseMessage('Remove delivery success')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string) {
        return await this.commandService.softDelete(id);
    }

    @Delete('permanent/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Permanently delete delivery method' })
    @ApiParam({ name: 'id', required: true, description: 'Delivery method ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delivery method permanently deleted',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Delivery method not found',
    })
    @ResponseMessage('Remove delivery success')
    @Permission(UserRole.ADMIN)
    @UseGuards(AtJwtGuard, RoleGuard)
    @HttpCode(HttpStatus.OK)
    async permanentlyDelete(@Param('id') id: string) {
        return await this.commandService.permanentlyDelete(id);
    }
}
