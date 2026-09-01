import { test, expect } from '@playwright/test';

test.describe('Tier 3 E2E Test (Positive Case): Product Catalog Journey', () => {
  test('User can browse catalog, switch language, filter products, inspect details, and create a product', async ({ page }) => {
    
    await page.goto('/products');
    await expect(page).toHaveTitle(/Vite/i);

    
    await expect(page.getByTestId('product-filter-bar')).toBeVisible();
    await expect(page.getByTestId('stat-total-items')).toBeVisible();
    await expect(page.getByTestId('stat-total-value')).toBeVisible();

    
    await page.getByTestId('lang-btn-id').click();
    await page.getByTestId('lang-btn-en').click();

    
    await page.getByTestId('product-category-electronics').click();
    await expect(page).toHaveURL(/category=electronics/);

    
    const viewDetailButton = page.getByTestId('view-detail-btn-prod_2');
    await viewDetailButton.click();

    await expect(page).toHaveURL('/products/prod_2');
    await expect(page.getByTestId('product-detail-card')).toBeVisible();

    
    await page.getByTestId('detail-back-btn').click();
    await expect(page).toHaveURL('/products');

    
    await page.getByTestId('add-product-btn').click();
    await expect(page.getByTestId('product-form')).toBeVisible();

    
    await page.getByTestId('input-product-name').fill('Ultra-wide 4K Monitor');
    await page.getByTestId('input-product-description').fill('High quality IPS display with HDR600 and Type-C power delivery.');
    await page.getByTestId('input-product-price').fill('699');
    await page.getByTestId('input-product-stock').fill('15');
    await page.getByTestId('select-product-category').selectOption('electronics');

    
    await page.getByTestId('submit-product-btn').click();

    
    await expect(page.getByTestId('toast-container')).toBeVisible({ timeout: 5000 });

    
    await expect(page.getByRole('heading', { name: 'Ultra-wide 4K Monitor' })).toBeVisible({ timeout: 5000 });
  });
});
