import { describe, expect, it } from 'vitest';
import { productSchema } from './product.schema';

describe('Tier 1 Unit Test: productSchema', () => {
  it('should successfully validate valid product payload', () => {
    const validData = {
      name: 'Wireless Mechanical Keyboard',
      description: 'Compact 75% mechanical keyboard with Bluetooth and RGB.',
      price: 129.99,
      stock: 25,
      category: 'electronics',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301',
    };

    const result = productSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe(validData.name);
      expect(result.data.price).toBe(validData.price);
    }
  });

  it('should apply fallback image URL when imageUrl is empty string', () => {
    const dataWithEmptyImage = {
      name: 'Organic Cotton Shirt',
      description: 'Comfortable organic cotton daily shirt.',
      price: 49,
      stock: 10,
      category: 'clothing',
      imageUrl: '',
    };

    const result = productSchema.safeParse(dataWithEmptyImage);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.imageUrl).toContain('images.unsplash.com');
    }
  });

  it('should fail validation when name is shorter than 3 characters', () => {
    const invalidData = {
      name: 'AB',
      description: 'Valid product description for testing purposes.',
      price: 20,
      stock: 5,
      category: 'accessories',
    };

    const result = productSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('name');
      expect(result.error.errors[0].message).toContain('at least 3 characters');
    }
  });

  it('should fail validation when price is negative or zero', () => {
    const invalidData = {
      name: 'Invalid Price Item',
      description: 'Valid product description for testing purposes.',
      price: 0,
      stock: 10,
      category: 'food',
    };

    const result = productSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('price');
    }
  });

  it('should fail validation when stock is negative', () => {
    const invalidData = {
      name: 'Negative Stock Item',
      description: 'Valid product description for testing purposes.',
      price: 10,
      stock: -1,
      category: 'electronics',
    };

    const result = productSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('stock');
    }
  });
});
