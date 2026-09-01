import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  price: z
    .number({ invalid_type_error: 'Price must be a valid number' })
    .positive('Price must be greater than $0')
    .max(100000, 'Price cannot exceed $100,000'),
  stock: z
    .number({ invalid_type_error: 'Stock must be an integer' })
    .int('Stock must be an integer')
    .nonnegative('Stock cannot be negative'),
  category: z.enum(['electronics', 'clothing', 'food', 'accessories'] as const, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  imageUrl: z
    .string()
    .url('Please provide a valid image URL')
    .or(
      z
        .string()
        .length(0)
        .transform(() => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500')
    ),
});

export type ProductFormValues = z.infer<typeof productSchema>;
