import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiPropertyOptional({ example: 100 })
  totalFilteredProducts?: number;

  @ApiPropertyOptional({
    example: 12.5,
    description: 'Percentage of deleted products',
  })
  percentDeletedProducts?: number;

  @ApiPropertyOptional({
    example: 87.5,
    description: 'Percentage of non-deleted products',
  })
  percentNonDeletedProducts?: number;

  @ApiPropertyOptional({
    example: 70,
    description: 'Percentage of non-deleted products with price',
  })
  percentNonDeletedWithPrice?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Percentage of non-deleted products without price (NULL)',
  })
  percentNonDeletedWithoutPrice?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Percentage of non-deleted products with price = 0',
  })
  percentNonDeletedWithZeroPrice?: number;

  @ApiPropertyOptional({
    example: { from: '2025-09-01', to: '2025-09-26' },
    description: 'Date range applied to the report',
  })
  dateRange?: { from?: string; to?: string };
}
