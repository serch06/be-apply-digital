import { Test, TestingModule } from '@nestjs/testing';
import { ContentfulService } from './contentful.service';

describe('ContentfulService', () => {
  let service: ContentfulService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentfulService],
    }).compile();

    service = module.get<ContentfulService>(ContentfulService);

    jest.spyOn(service['client'], 'get').mockResolvedValue({
      data: {
        items: [
          {
            sys: {
              id: '123',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-02T00:00:00.000Z',
            },
            fields: {
              sku: 'ABC',
              name: 'Test Product',
              brand: 'BrandX',
              model: 'M1',
              category: 'CategoryY',
              color: 'Red',
              price: 100,
              currency: 'USD',
              stock: 10,
            },
          },
        ],
      },
    } as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return mapped products', async () => {
    const products = await service.fetchProducts();

    expect(products).toHaveLength(1);
    expect(products[0].externalId).toBe('123');
    expect(products[0].name).toBe('Test Product');
    expect(products[0].price).toBe(100);
    expect(products[0].currency).toBe('USD');
  });

  it('should handle empty items array', async () => {
    jest.spyOn(service['client'], 'get').mockResolvedValueOnce({
      data: { items: [] },
    } as any);

    const products = await service.fetchProducts();
    expect(products).toEqual([]);
  });
});
