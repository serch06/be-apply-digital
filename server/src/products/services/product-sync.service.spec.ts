import { Test, TestingModule } from '@nestjs/testing';
import { ProductSyncService } from './product-sync.service';
import { ContentfulService } from './contentful.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../product.entity';
import { InsertResult, Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { IProduct } from '../dto/product.interface';

describe('ProductSyncService', () => {
  let service: ProductSyncService;
  let repo: Repository<Product>;
  let contentful: ContentfulService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSyncService,
        {
          provide: ContentfulService,
          useValue: { fetchProducts: jest.fn() },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { upsert: jest.fn() },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            doesExist: jest.fn().mockReturnValue(false),
            getCronJob: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'DISABLE_CRON' ? 'false' : undefined,
            ),
          },
        },
      ],
    }).compile();

    service = module.get<ProductSyncService>(ProductSyncService);
    repo = module.get<Repository<Product>>(getRepositoryToken(Product));
    contentful = module.get<ContentfulService>(ContentfulService);
    config = module.get<ConfigService>(ConfigService);
  });

  it('should skip if cron is disabled', async () => {
    jest.spyOn(config, 'get').mockReturnValue('true');
    const upsertSpy = jest.spyOn(repo, 'upsert');

    await service.handleCronFetch();

    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('should skip if no products fetched', async () => {
    jest.spyOn(contentful, 'fetchProducts').mockResolvedValue([]);
    const upsertSpy = jest.spyOn(repo, 'upsert');

    await service.handleCronFetch();

    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('should upsert fetched products', async () => {
    const fakeProduct: IProduct = {
      externalId: '1',
      sku: 'SKU123',
      name: 'Test Product',
      brand: 'Brand',
      model: 'Model',
      category: 'Category',
      color: 'Blue',
      price: 100,
      currency: 'USD',
      stock: 10,
      contentfulCreatedAt: new Date('2024-01-01T00:00:00.000Z'),
      contentfulUpdatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    jest.spyOn(contentful, 'fetchProducts').mockResolvedValue([fakeProduct]);
    const upsertSpy = jest
      .spyOn(repo, 'upsert')
      .mockResolvedValue({} as unknown as InsertResult);

    await service.handleCronFetch();

    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ externalId: '1', name: 'Test Product' }),
      ['externalId'],
    );
  });
});
