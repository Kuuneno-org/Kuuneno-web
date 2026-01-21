import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Kuuneno/);
});

test('navigation buttons exist', async ({ page }) => {
  await page.goto('/');
  
  const prevBtn = page.getByRole('button', { name: 'Précédent' });
  const nextBtn = page.getByRole('button', { name: 'Suivant' });
  
  await expect(prevBtn).toBeVisible();
  await expect(nextBtn).toBeVisible();
});
