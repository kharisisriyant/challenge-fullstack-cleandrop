import { test, expect } from '@playwright/test';
import { USERS, login, logout, uniqueName } from './helpers';

test.describe('Cleandrop e2e — services flow', () => {
  test('user can view + filter; admin can create, edit, delete', async ({ page }) => {
    // --- 1. Login as user
    await login(page, 'user');

    // --- 2. See services + test filters
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    const initialCount = await rows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Search filter (top-level input above table)
    const search = page.getByPlaceholder('Search services...').first();
    await search.fill('deep');
    await expect(page.locator('table tbody')).toContainText(/deep/i);
    await search.fill('');

    // Status filter (top-level select trigger showing "All Statuses")
    const statusTrigger = page.getByRole('combobox').filter({ hasText: 'All Statuses' });
    await statusTrigger.click();
    await page.getByRole('option', { name: 'Active', exact: true }).click();
    await expect(page.locator('table tbody')).toContainText(/active/i);

    // Reset status
    await page.getByRole('combobox').filter({ hasText: 'Active' }).click();
    await page.getByRole('option', { name: 'All Statuses', exact: true }).click();

    // Category filter
    const categoryTrigger = page.getByRole('combobox').filter({ hasText: 'All Categories' });
    await categoryTrigger.click();
    await page.getByRole('option', { name: 'Residential', exact: true }).click();
    await expect(page.locator('table tbody')).toContainText('Residential');

    // Reset category
    await page.getByRole('combobox').filter({ hasText: 'Residential' }).click();
    await page.getByRole('option', { name: 'All Categories', exact: true }).click();

    // --- 2b. Sort
    const nameCells = page.locator('table tbody tr td:nth-child(1) .font-medium');
    const durationCells = page.locator('table tbody tr td:nth-child(5)');

    const readNames = async () => await nameCells.allTextContents();
    const readDurations = async () =>
      (await durationCells.allTextContents()).map((s) => parseInt(s, 10));

    const sortHeader = (label: string) =>
      page.locator('thead th').filter({ hasText: label }).getByRole('button').first();

    const isAsc = <T>(arr: T[], cmp: (a: T, b: T) => number) =>
      arr.every((v, i) => i === 0 || cmp(arr[i - 1], v) <= 0);
    const isDesc = <T>(arr: T[], cmp: (a: T, b: T) => number) =>
      arr.every((v, i) => i === 0 || cmp(arr[i - 1], v) >= 0);
    const strCmp = (a: string, b: string) => a.localeCompare(b);
    const numCmp = (a: number, b: number) => a - b;

    // Default: name asc
    await expect.poll(async () => isAsc(await readNames(), strCmp)).toBe(true);

    // Toggle name → desc
    await sortHeader('Name').click();
    await expect.poll(async () => isDesc(await readNames(), strCmp)).toBe(true);

    // Switch to duration → asc
    await sortHeader('Duration').click();
    await expect.poll(async () => isAsc(await readDurations(), numCmp)).toBe(true);

    // Toggle duration → desc
    await sortHeader('Duration').click();
    await expect.poll(async () => isDesc(await readDurations(), numCmp)).toBe(true);

    // Reset to name asc for the rest of the flow
    await sortHeader('Name').click();
    await expect.poll(async () => isAsc(await readNames(), strCmp)).toBe(true);

    // User should NOT see Add button
    await expect(page.getByRole('button', { name: /^add$/i })).toHaveCount(0);

    // --- 3. Logout
    await logout(page);

    // --- 4. Login as admin
    await login(page, 'admin');
    await expect(page.getByRole('button', { name: /^add$/i })).toBeVisible();

    // --- 5. Create service
    const newName = uniqueName('E2E Test Service');
    await page.getByRole('button', { name: /^add$/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Add Service' })).toBeVisible();

    await dialog.getByLabel('Name').fill(newName);
    await dialog.getByLabel('Description').fill('Created from Playwright e2e.');

    // Category — already defaults to Residential. Keep default.
    // Status — change draft → active
    await dialog.locator('label:has-text("Status") + button').click();
    await page.getByRole('option', { name: 'Active', exact: true }).click();

    // Company — pick first existing
    await dialog.getByLabel('Company').click();
    const firstCompanyOption = page.getByRole('option').filter({ hasNotText: 'New company' }).first();
    await firstCompanyOption.click();

    await dialog.getByLabel('Duration (minutes)').fill('60');
    await dialog.getByLabel('Base Price (EUR)').fill('99');

    await dialog.getByRole('button', { name: /^create$/i }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(`Service "${newName}" created`)).toBeVisible();

    // Verify new row appears (search to scope)
    await page.getByPlaceholder('Search services...').first().fill(newName);
    const newRow = page.locator('table tbody tr').filter({ hasText: newName });
    await expect(newRow).toBeVisible();

    // --- 6. Edit service
    await newRow.getByRole('button').first().click(); // pencil
    const editDialog = page.getByRole('dialog');
    await expect(editDialog.getByRole('heading', { name: 'Edit Service' })).toBeVisible();

    const updatedName = `${newName} (edited)`;
    await editDialog.getByLabel('Name').fill(updatedName);
    await editDialog.getByLabel('Base Price (EUR)').fill('149');
    await editDialog.getByRole('button', { name: /^update$/i }).click();
    await expect(editDialog).toBeHidden();
    await expect(page.getByText(`Service "${updatedName}" updated`)).toBeVisible();

    await page.getByPlaceholder('Search services...').first().fill(updatedName);
    const updatedRow = page.locator('table tbody tr').filter({ hasText: updatedName });
    await expect(updatedRow).toBeVisible();

    // --- 7. Delete service
    await updatedRow.getByRole('button').nth(1).click(); // trash
    const deleteDialog = page.getByRole('dialog');
    await expect(deleteDialog.getByRole('heading', { name: 'Delete service?' })).toBeVisible();
    await expect(deleteDialog).toContainText(updatedName);

    await deleteDialog.getByRole('button', { name: /^delete$/i }).click();
    await expect(deleteDialog).toBeHidden();
    await expect(page.getByText(`Service "${updatedName}" deleted`)).toBeVisible();

    // Verify row gone
    await expect(page.locator('table tbody tr').filter({ hasText: updatedName })).toHaveCount(0);
  });
});
