import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from 'src/products/product.entity';
import { Repository } from 'typeorm';
import { ReportQueryDto } from '../dto/report-query.dto';
import { ProductsByFilterQueryDto } from '../dto/products-by-filter-query.dto';

describe('ReportService', () => {
  let service: ReportService;
  let repo: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    repo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  function mockQueryBuilder(result: any) {
    return {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(result),
      getRawMany: jest.fn().mockResolvedValue(result),
      getMany: jest.fn().mockResolvedValue(result),
    };
  }

  it('should return empty response if no raw results', async () => {
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockQueryBuilder(undefined),
    );

    const result = await service.getProductsReport({});
    expect(result).toEqual({});
  });

  it('should calculate deleted percentage', async () => {
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockQueryBuilder({
        total: '100',
        deletedCount: '20',
        nonDeletedCount: '80',
        withPriceCount: '70',
        withoutPriceCount: '10',
        zeroPriceCount: '5',
      }),
    );

    const query: ReportQueryDto = { includeDeleted: true };
    const result = await service.getProductsReport(query);

    expect(result.totalFilteredProducts).toBe(100);
    expect(result.percentDeletedProducts).toBe(20);
  });

  it('should calculate non-deleted stats with price details', async () => {
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockQueryBuilder({
        total: '50',
        deletedCount: '10',
        nonDeletedCount: '40',
        withPriceCount: '30',
        withoutPriceCount: '10',
        zeroPriceCount: '5',
      }),
    );

    const query: ReportQueryDto = {
      includeNonDeleted: true,
      includePriceStats: true,
    };
    const result = await service.getProductsReport(query);

    expect(result.percentNonDeletedProducts).toBe(80); // 40/50 * 100
    expect(result.percentNonDeletedWithPrice).toBe(75); // 30/40
    expect(result.percentNonDeletedWithoutPrice).toBe(25); // 10/40
    expect(result.percentNonDeletedWithZeroPrice).toBe(12.5); // 5/40
  });

  it('should include dateRange in response', async () => {
    (repo.createQueryBuilder as jest.Mock).mockReturnValue(
      mockQueryBuilder({
        total: '10',
        deletedCount: '2',
        nonDeletedCount: '8',
        withPriceCount: '5',
        withoutPriceCount: '3',
        zeroPriceCount: '1',
      }),
    );

    const query: ReportQueryDto = {
      includeDeleted: true,
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
    };
    const result = await service.getProductsReport(query);

    expect(result.dateRange).toEqual({
      from: '2025-01-01',
      to: '2025-01-31',
    });
  });

  it('should group products by category and brand', async () => {
    const mockData = [{ category: 'Smartphone', total: '2' }];
    const qb = mockQueryBuilder(mockData);

    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const result = await service.getProductCountsByCategoryAndBrand();

    expect(result.categories[0]).toEqual({
      category: 'Smartphone',
      total: 2,
    });
  });

  it('should filter products by category, brand and includeDeleted', async () => {
    const qb = mockQueryBuilder([{ id: '1', name: 'Product' }]);

    (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const query: ProductsByFilterQueryDto = {
      category: 'Smartphone',
      brand: 'Apple',
      includeDeleted: false,
    };
    const result = await service.getProductsByCategoryOrBrand(query);

    expect(result).toHaveLength(1);
    expect(qb.andWhere).toHaveBeenCalledWith('product.category = :category', {
      category: 'Smartphone',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('product.brand = :brand', {
      brand: 'Apple',
    });
    expect(qb.andWhere).toHaveBeenCalledWith('product.deleted = false');
  });
});
