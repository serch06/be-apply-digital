import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReportQueryDto {
  @ApiPropertyOptional({
    description: 'Include deleted percentage',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
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

  @ApiPropertyOptional({
    description: 'Include non-deleted percentage',
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
  includeNonDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Include price stats (only valid with includeNonDeleted)',
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
  includePriceStats?: boolean;

  @ApiPropertyOptional({
    description:
      'Start date (YYYY-MM-DD). Filters by product contentful created',
    example: '2025-09-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM-DD). Filters by product contentful created',
    example: '2025-09-26',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
