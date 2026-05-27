import { expect, type Page } from '@playwright/test';

export const USERS = {
  admin: { email: 'admin@cleandrop.io', password: 'admin123' },
  user: { email: 'user@cleandrop.io', password: 'user123' },
} as const;

export async function login(page: Page, role: keyof typeof USERS) {
  const { email, password } = USERS[role];
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export async function selectByPlaceholder(page: Page, placeholder: string, optionText: string) {
  await page.getByRole('combobox').filter({ hasText: placeholder }).click();
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

export async function selectInDialog(page: Page, labelText: string, optionText: string) {
  const dialog = page.getByRole('dialog');
  const label = dialog.getByText(labelText, { exact: true });
  const trigger = label.locator('xpath=following-sibling::button[1]');
  await trigger.click();
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()}`;
}
