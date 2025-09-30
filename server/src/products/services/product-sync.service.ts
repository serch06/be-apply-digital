import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { ContentfulService } from './contentful.service';
import { Product } from '../product.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductSyncService implements OnModuleInit {
  private readonly logger = new Logger(ProductSyncService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly contentfulService: ContentfulService,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  onModuleInit() {
    const disableCron = this.configService.get('DISABLE_CRON') === 'true';
    if (disableCron) {
      const exist = this.schedulerRegistry.doesExist('cron', 'product-sync');
      if (exist) {
        const job = this.schedulerRegistry.getCronJob('product-sync');
        if (job) job.stop();
        this.logger.warn('Product sync cron disabled via DISABLE_CRON');
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR, { name: 'product-sync' })
  async handleCronFetch() {
    if (this.configService.get('DISABLE_CRON') === 'true') {
      return;
    }

    this.logger.log('Running hourly sync products job with Contentful');
    const products = await this.contentfulService.fetchProducts();

    if (!products.length) {
      this.logger.warn('No products fetched, skipping sync.');
      return;
    }

    for (const p of products) {
      await this.productRepo.upsert(p, ['externalId']);
    }

    this.logger.log(`Synced ${products.length} products from Contentful`);
  }
}
