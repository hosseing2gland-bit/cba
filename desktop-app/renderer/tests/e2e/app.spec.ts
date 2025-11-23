import { test, expect } from '@playwright/test';
import path from 'path';

const dist = path.join(__dirname, '../../dist/index.html');

const fileUrl = `file://${dist}`;

test('renders entry point', async ({ page }) => {
  await page.goto(fileUrl);
  await expect(page.getByText('مدیریت پروفایل مرورگر')).toBeVisible();
  await expect(page.getByText('پروفایل‌ها')).toBeVisible();
});
