import { test, expect } from '@playwright/test'

test.describe('Items CRUD', () => {
  test('should display items page', async ({ page }) => {
    await page.goto('/items')
    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible()
  })

  test('should create a new item', async ({ page }) => {
    await page.goto('/items/new')
    await page.getByLabel('Title').fill('Test Item')
    await page.getByLabel('Description').fill('A test description')
    await page.getByRole('button', { name: 'Create' }).click()

    await expect(page).toHaveURL('/items')
    await expect(page.getByText('Test Item')).toBeVisible()
  })

  test('should view item detail', async ({ page }) => {
    await page.goto('/items')
    await page.getByText('Test Item').click()
    await expect(page.getByText('A test description')).toBeVisible()
  })

  test('should delete an item', async ({ page }) => {
    await page.goto('/items')
    const deleteButton = page.getByRole('button', { name: 'Delete' }).first()
    await deleteButton.click()
    await expect(page.getByText('Item deleted')).toBeVisible()
  })
})
