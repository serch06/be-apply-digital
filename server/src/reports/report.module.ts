import { Module } from '@nestjs/common';
import { ReportService } from './services/report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportsModule {}
