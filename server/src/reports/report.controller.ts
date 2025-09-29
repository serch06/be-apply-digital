import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportService } from './services/report.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { ProductsGroupedResponseDto } from './dto/products-grouped-response.dto';
import { Product } from 'src/products/product.entity';
import { ProductsByFilterQueryDto } from './dto/products-by-filter-query.dto';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller({
  path: 'reports',
  version: '1',
})
export class ReportController {
  private logger = new Logger(ReportController.name);

  constructor(private readonly reportsService: ReportService) {}

  @Get('products')
  async getProductReport(
    @Query() query: ReportQueryDto,
  ): Promise<ReportResponseDto> {
    this.logger.debug(`Raw query`, query);
    return this.reportsService.getProductsReport(query);
  }

  // server/src/reports/report.controller.ts
  @Get('products/grouped-by-category-brand')
  async getProductsGroupedByCategoryBrand(): Promise<ProductsGroupedResponseDto> {
    return this.reportsService.getProductCountsByCategoryAndBrand();
  }

  @Get('products/by-category-brand')
  async getProductsByCategoryOrBrand(
    @Query() query: ProductsByFilterQueryDto,
  ): Promise<Product[]> {
    return this.reportsService.getProductsByCategoryOrBrand(query);
  }
}
