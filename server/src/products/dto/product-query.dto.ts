import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 'Apple' })
  name?: string;

  @ApiPropertyOptional({ example: 'Smartwatch' })
  category?: string;

  @ApiPropertyOptional({ example: 100 })
  priceMin?: number;

  @ApiPropertyOptional({ example: 500 })
  priceMax?: number;
}
