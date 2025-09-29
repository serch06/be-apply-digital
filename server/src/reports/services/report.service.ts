import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/product.entity';
import { Repository } from 'typeorm';
import { ReportQueryDto } from '../dto/report-query.dto';
import { ReportResponseDto } from '../dto/report-response.dto';
import { ProductsByFilterQueryDto } from '../dto/products-by-filter-query.dto';
import { ProductsGroupedResponseDto } from '../dto/products-grouped-response.dto';

@Injectable()
export class ReportService {
  private logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getProductsReport(query: ReportQueryDto): Promise<ReportResponseDto> {
    const {
      includeDeleted,
      includeNonDeleted,
      includePriceStats,
      dateFrom,
      dateTo,
    } = query;

    this.logger.debug(
      `includeDeleted: ${query.includeDeleted}`,
      ReportService.name,
    );

    const response: ReportResponseDto = {};

    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .select('COUNT(*)', 'total')
      .addSelect(
        'SUM(CASE WHEN product."deleted" = true THEN 1 ELSE 0 END)',
        'deletedCount',
      )
      .addSelect(
        'SUM(CASE WHEN product."deleted" = false THEN 1 ELSE 0 END)',
        'nonDeletedCount',
      )
      .addSelect(
        'SUM(CASE WHEN product."deleted" = false AND product."price" IS NOT NULL THEN 1 ELSE 0 END)',
        'withPriceCount',
      )
      .addSelect(
        'SUM(CASE WHEN product."deleted" = false AND product."price" IS NULL THEN 1 ELSE 0 END)',
        'withoutPriceCount',
      )
      .addSelect(
        'SUM(CASE WHEN product."deleted" = false AND product."price" = 0 THEN 1 ELSE 0 END)',
        'zeroPriceCount',
      );

    if (dateFrom) {
      queryBuilder.andWhere(
        'product."contentfulCreatedAt" >= :dateFrom::DATE',
        {
          dateFrom,
        },
      );
    }

    if (dateTo) {
      queryBuilder.andWhere(
        'product."contentfulCreatedAt" < (:dateTo::DATE + INTERVAL \'1 day\')',
        { dateTo },
      );
    }

    const raw = await queryBuilder.getRawOne<{
      total: string;
      deletedCount: string;
      nonDeletedCount: string;
      withPriceCount: string;
      withoutPriceCount: string;
      zeroPriceCount: string;
    }>();

    if (!raw) {
      this.logger.warn('No results found for product reports');
      return response;
    }

    const total = parseInt(raw.total, 10) || 0;
    const deletedCount = parseInt(raw.deletedCount, 10) || 0;
    const nonDeletedCount = parseInt(raw.nonDeletedCount, 10) || 0;
    const withPriceCount = parseInt(raw.withPriceCount, 10) || 0;
    const withoutPriceCount = parseInt(raw.withoutPriceCount, 10) || 0;
    const zeroPriceCount = parseInt(raw.zeroPriceCount, 10) || 0;

    if (includeDeleted) {
      response.totalFilteredProducts = total;

      response.percentDeletedProducts =
        total > 0 ? (deletedCount / total) * 100 : 0;
    }

    if (includeNonDeleted) {
      response.percentNonDeletedProducts =
        total > 0 ? (nonDeletedCount / total) * 100 : 0;

      if (includePriceStats) {
        response.percentNonDeletedWithPrice = this.toPercent(
          withPriceCount,
          nonDeletedCount,
        );
        response.percentNonDeletedWithoutPrice = this.toPercent(
          withoutPriceCount,
          nonDeletedCount,
        );
        response.percentNonDeletedWithZeroPrice = this.toPercent(
          zeroPriceCount,
          nonDeletedCount,
        );
      }
    }

    if (dateFrom || dateTo) {
      response.dateRange = { from: dateFrom, to: dateTo };
    }

    return response;
  }

  toPercent(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 100 * 100) / 100;
  }

  async getProductCountsByCategoryAndBrand(): Promise<ProductsGroupedResponseDto> {
    const categoryRows = await this.productRepo
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(product.id)', 'total')
      .groupBy('product.category')
      .orderBy('product.category', 'ASC')
      .getRawMany<{ category: string | null; total: string }>();

    const brandRows = await this.productRepo
      .createQueryBuilder('product')
      .select('product.brand', 'brand')
      .addSelect('COUNT(product.id)', 'total')
      .groupBy('product.brand')
      .orderBy('product.brand', 'ASC')
      .getRawMany<{ brand: string | null; total: string }>();

    return {
      categories: categoryRows.map((row) => ({
        category: row.category ?? null,
        total: Number(row.total) || 0,
      })),
      brands: brandRows.map((row) => ({
        brand: row.brand ?? null,
        total: Number(row.total) || 0,
      })),
    };
  }

  async getProductsByCategoryOrBrand({
    category,
    brand,
    includeDeleted,
  }: ProductsByFilterQueryDto): Promise<Product[]> {
    const queryBuilder = this.productRepo.createQueryBuilder('product');

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    if (!includeDeleted) {
      queryBuilder.andWhere('product.deleted = false');
    }

    queryBuilder.orderBy('product.name', 'ASC');

    return queryBuilder.getMany();
  }
}
