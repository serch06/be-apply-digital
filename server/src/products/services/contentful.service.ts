import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  IContentfulResponse,
  IContentfulItem,
  IProduct,
} from '../dto/product.interface';

const CONTENTFUL_TIMEOUT_MS = Number(process.env.CONTENTFUL_TIMEOUT_MS ?? 5000);
const CONTENTFUL_RETRY_MAX_ATTEMPTS = Number(
  process.env.CONTENTFUL_RETRY_MAX_ATTEMPTS ?? 3,
);
const CONTENTFUL_RETRY_BASE_DELAY_MS = Number(
  process.env.CONTENTFUL_RETRY_BASE_DELAY_MS ?? 500,
);

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private readonly baseUrl = process.env.CONTENTFUL_CONTENT_URL ?? '';
  private readonly client: AxiosInstance;

  constructor() {
    if (!this.baseUrl) {
      this.logger.warn('CONTENTFUL_CONTENT_URL is empty; requests will fail');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: CONTENTFUL_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      },
    });
  }

  // Retry only when getting error for timeouts, network errors or error >=500
  private async requestWithRetry<T>(
    fn: () => Promise<AxiosResponse<T>>,
    maxAttempts = CONTENTFUL_RETRY_MAX_ATTEMPTS,
  ): Promise<AxiosResponse<T>> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error;

        if (!axios.isAxiosError(error)) {
          throw error;
        }

        const status = error.response?.status;
        const isRetryable =
          error.code === 'ECONNABORTED' ||
          status === undefined ||
          status >= 500;

        if (!isRetryable || attempt === maxAttempts - 1) {
          throw error;
        }

        const backoff = CONTENTFUL_RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        this.logger.warn(
          `Contentful request failed (attempt ${attempt + 1}/${maxAttempts}). Retrying in ${backoff}ms`,
        );
        await new Promise<void>((resolve) => setTimeout(resolve, backoff));
      }
    }

    throw lastError;
  }

  async fetchProducts(): Promise<IProduct[]> {
    try {
      const response = await this.requestWithRetry(() =>
        this.client.get<IContentfulResponse>('', {
          params: { content_type: process.env.CONTENTFUL_CONTENT_TYPE },
        }),
      );

      const items = this.ensureItems(response.data?.items);
      const products = items.map((item) => this.mapToProduct(item));

      this.logger.log(`Fetched ${products.length} products from Contentful`);
      return products;
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error);
      this.logger.error(`Failed to fetch products from Contentful: ${message}`);
      return [];
    }
  }

  private ensureItems(items: IContentfulItem[] | undefined): IContentfulItem[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item): item is IContentfulItem =>
      this.isContentfulItem(item),
    );
  }

  private isContentfulItem(item: unknown): item is IContentfulItem {
    if (!item || typeof item !== 'object') return false;

    const candidate = item as {
      sys?: { id?: unknown; createdAt?: unknown; updatedAt?: unknown };
      fields?: Record<string, unknown>;
    };

    return (
      candidate.sys !== undefined &&
      typeof candidate.sys.id === 'string' &&
      candidate.fields !== undefined &&
      typeof candidate.fields === 'object'
    );
  }

  private mapToProduct(item: IContentfulItem): IProduct {
    const { sys, fields } = item;

    return {
      externalId: sys.id,
      sku: fields.sku ?? '',
      name: fields.name ?? '',
      brand: fields.brand ?? '',
      model: fields.model ?? '',
      category: fields.category ?? '',
      color: fields.color ?? '',
      price: fields.price ?? 0,
      currency: fields.currency ?? '',
      stock: fields.stock ?? 0,
      contentfulCreatedAt: sys.createdAt ? new Date(sys.createdAt) : new Date(),
      contentfulUpdatedAt: sys.updatedAt ? new Date(sys.updatedAt) : new Date(),
    };
  }

  private extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const data: unknown = error.response?.data;
      if (typeof data === 'string') return data;
      if (data && typeof data === 'object') return JSON.stringify(data);
      return error.message;
    }
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
