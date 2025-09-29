import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product.entity';
import { ProductQueryDto } from '../dto/product-query.dto';

describe('ProductService', () => {
  let service: ProductService;
  let repo: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should paginate products', async () => {
    jest
      .spyOn(repo, 'findAndCount')
      .mockResolvedValue([[{ id: '1', name: 'Test' } as Product], 1]);

    const query: ProductQueryDto = { page: 1 };
    const result = await service.findAll(query);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should soft delete a product', async () => {
    const product = { id: '123', deleted: false } as Product;
    jest.spyOn(repo, 'findOne').mockResolvedValue(product);
    jest.spyOn(repo, 'save').mockResolvedValue({ ...product, deleted: true });

    const result = await service.softDelete('123');

    expect(result.deleted).toBe(true);
  });

  it('should throw if product not found when deleting', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(null);

    await expect(service.softDelete('999')).rejects.toThrow(
      'Product not found',
    );
  });
});
