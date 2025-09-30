import {
  Controller,
  Get,
  Query,
  Param,
  Delete,
  Logger,
  Post,
} from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { ProductSyncService } from './services/product-sync.service';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller({
  path: 'products',
  version: '1',
})
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly productService: ProductService,
    private readonly productSyncService: ProductSyncService,
  ) {}

  @Get()
  @ApiResponse({ type: PaginatedProductsResponseDto })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    this.logger.log('GET /products called');
    return this.productService.findAll(query);
  }

  @Delete(':id')
  @ApiResponse({ type: ProductResponseDto })
  async remove(@Param('id') id: string): Promise<ProductResponseDto> {
    this.logger.log(`DELETE /products/${id} called`);
    return this.productService.softDelete(id);
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Manual product sync with Contentful',
    description:
      'This endpoint is intended for **administrative purposes only**. ' +
      'It triggers a manual synchronization of products from Contentful. ' +
      'Normally, products are synced automatically on schedule, so use this only if an explicit refresh is needed.',
  })
  async syncManually() {
    this.logger.warn('Manual sync triggered');
    return this.productSyncService.handleCronFetch();
  }
}
