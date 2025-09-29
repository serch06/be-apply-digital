export interface IContentfulSys {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IContentfulFields {
  sku?: string;
  name?: string;
  brand?: string;
  model?: string;
  category?: string;
  color?: string;
  price?: number;
  currency: string;
  stock?: number;
}

export interface IContentfulItem {
  sys: IContentfulSys;
  fields: IContentfulFields;
}

export interface IContentfulResponse {
  sys: {
    type: string;
  };
  total: number;
  skip: number;
  limit: number;
  items: IContentfulItem[];
}

export interface IProduct {
  externalId: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
  contentfulCreatedAt: Date;
  contentfulUpdatedAt: Date;
}
