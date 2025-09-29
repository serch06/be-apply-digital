import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() sku: string;
  @ApiProperty() name: string;
  @ApiProperty() brand: string;
  @ApiProperty() model: string;
  @ApiProperty() category: string;
  @ApiProperty() color: string;
  @ApiProperty() price: number;
  @ApiProperty() currency: string;
  @ApiProperty() stock: number;
  @ApiProperty() deleted: boolean;
  @ApiProperty() contentfulCreatedAt: Date;
  @ApiProperty() contentfulUpdatedAt: Date;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  items: ProductResponseDto[];

  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() totalPages: number;
}
