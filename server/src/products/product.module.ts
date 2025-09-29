import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSyncService } from './services/product-sync.service';
import { ContentfulService } from './services/contentful.service';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { Product } from './product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService, ProductSyncService, ContentfulService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
