import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, Between } from 'typeorm';
import { Product } from '../product.entity';
import { ProductQueryDto } from '../dto/product-query.dto';
import { PaginatedProductsResponseDto } from '../dto/product-response.dto';
import { DEFAULT_PAGE_SIZE } from '../../common/constants/pagination.constant';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(query: ProductQueryDto): Promise<PaginatedProductsResponseDto> {
    this.logger.debug(`Fetching products with query: ${JSON.stringify(query)}`);

    const take = DEFAULT_PAGE_SIZE;
    const page = query.page || 1;
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<Product> = { deleted: false };

    if (query.name) {
      where.name = ILike(`%${query.name}%`);
    }
    if (query.category) {
      where.category = ILike(`%${query.category}%`);
    }
    if (query.priceMin !== undefined && query.priceMax !== undefined) {
      where.price = Between(query.priceMin, query.priceMax);
    }

    const [items, total] = await this.productRepo.findAndCount({
      where,
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    this.logger.log(`Found ${items.length} products out of ${total}`);
    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / take),
    };
  }

  async softDelete(id: string): Promise<Product> {
    this.logger.warn(`Removing product with id ${id}`);

    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      this.logger.error(`Product with id ${id} not found`);
      throw new Error('Product not found');
    }

    product.deleted = true;
    return await this.productRepo.save(product);
  }
}
