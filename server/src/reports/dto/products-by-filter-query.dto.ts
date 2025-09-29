// server/src/reports/dto/products-by-filter-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductsByFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Category to filter',
    example: 'smartphones',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Brand to filter', example: 'Apple' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Include deleted products in the result set',
    example: true,
    type: Boolean,
  })
  @Transform(
    ({ value }) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === 'boolean') return value;

      const normalized = String(value).toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;

      return undefined;
    },
    { toClassOnly: true },
  )
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}
