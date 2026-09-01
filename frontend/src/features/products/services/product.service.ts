import { env } from '@core/config/env';
import { apiClient } from '@core/http/api-client';
import type {
  CreateProductDTO,
  Product,
  ProductFilters,
  UpdateProductDTO,
} from '../types/product.types';

const STORAGE_KEY = 'mock_products_database';

const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Wireless Noise-Canceling Headphones',
    description:
      'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 299,
    stock: 15,
    category: 'electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'prod_2',
    name: 'Mechanical Gaming Keyboard',
    description:
      'Custom hot-swappable mechanical switches with RGB backlight and aluminum chassis.',
    price: 149,
    stock: 28,
    category: 'electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'prod_3',
    name: 'Organic Cotton Minimalist Hoodie',
    description:
      'Heavyweight organic cotton hoodie designed for comfort and relaxed streetwear fit.',
    price: 89,
    stock: 42,
    category: 'clothing',
    imageUrl:
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: 'prod_4',
    name: 'Artisan Pour-Over Coffee Dripper',
    description: 'Precision ceramic pour-over cone for extracting optimal coffee flavors at home.',
    price: 35,
    stock: 50,
    category: 'food',
    imageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
];

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function getLocalProducts(): Product[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_PRODUCTS));
    return INITIAL_MOCK_PRODUCTS;
  }
  try {
    return JSON.parse(saved) as Product[];
  } catch {
    return INITIAL_MOCK_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export const productService = {
  /**
   * Fetch all products with optional filtering & sorting
   */
  async getAll(filters?: ProductFilters): Promise<Product[]> {
    if (!env.VITE_ENABLE_MOCK_API && env.MODE !== 'test') {
      const response = await apiClient.get<Product[]>('/products', { params: filters });
      return response.data;
    }

    await delay(350);
    let items = getLocalProducts();

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    if (filters?.category && filters.category !== 'all') {
      items = items.filter((p) => p.category === filters.category);
    }

    if (filters?.sortBy) {
      const order = filters.sortOrder === 'desc' ? -1 : 1;
      items = [...items].sort((a, b) => {
        if (filters.sortBy === 'price') return (a.price - b.price) * order;
        if (filters.sortBy === 'name') return a.name.localeCompare(b.name) * order;
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
      });
    }

    return items;
  },

  /**
   * Fetch a single product by ID
   */
  async getById(id: string): Promise<Product> {
    if (!env.VITE_ENABLE_MOCK_API && env.MODE !== 'test') {
      const response = await apiClient.get<Product>(`/products/${id}`);
      return response.data;
    }

    await delay(250);
    const items = getLocalProducts();
    const product = items.find((p) => p.id === id);

    if (!product) {
      throw new Error(`Product with ID "${id}" not found.`);
    }

    return product;
  },

  /**
   * Create a new product
   */
  async create(dto: CreateProductDTO): Promise<Product> {
    if (!env.VITE_ENABLE_MOCK_API && env.MODE !== 'test') {
      const response = await apiClient.post<Product>('/products', dto);
      return response.data;
    }

    await delay(400);
    const newProduct: Product = {
      ...dto,
      id: `prod_${Date.now()}`,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    const items = getLocalProducts();
    saveLocalProducts([newProduct, ...items]);

    return newProduct;
  },

  /**
   * Update an existing product
   */
  async update(id: string, dto: UpdateProductDTO): Promise<Product> {
    if (!env.VITE_ENABLE_MOCK_API && env.MODE !== 'test') {
      const response = await apiClient.put<Product>(`/products/${id}`, dto);
      return response.data;
    }

    await delay(300);
    const items = getLocalProducts();
    const index = items.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Product with ID "${id}" not found.`);
    }

    const updated: Product = {
      ...items[index],
      ...dto,
    };

    items[index] = updated;
    saveLocalProducts(items);

    return updated;
  },

  /**
   * Delete a product
   */
  async delete(id: string): Promise<void> {
    if (!env.VITE_ENABLE_MOCK_API && env.MODE !== 'test') {
      await apiClient.delete(`/products/${id}`);
      return;
    }

    await delay(300);
    const items = getLocalProducts();
    const filtered = items.filter((p) => p.id !== id);
    saveLocalProducts(filtered);
  },
};
