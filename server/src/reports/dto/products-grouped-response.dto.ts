export class ProductsGroupedResponseDto {
  categories: { category: string | null; total: number }[];
  brands: { brand: string | null; total: number }[];
}
