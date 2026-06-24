import { expect, test } from '@playwright/test';

const teacherProfile = {
  id: 42,
  fullName: 'Nguyen Minh Anh',
  email: 'minh.anh@example.com',
  role: 'Teacher',
  subscriptionTier: 'Pro',
  premiumExpiresAt: '2026-12-31T00:00:00Z',
  documentsProcessed: 18,
  createdAt: '2026-01-15T10:30:00Z',
  isDeleted: false,
  avatarUrl: null,
};

async function mockAuthenticatedProfile(page, profile = teacherProfile) {
  await page.addInitScript(() => {
    window.localStorage.setItem('mascoteach_token', 'playwright-token');
  });

  await page.route('**/api/User/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(profile),
    });
  });
}

test('shows the current user profile details', async ({ page }) => {
  await mockAuthenticatedProfile(page);

  await page.goto('/teacher/profile');

  await expect(page.getByRole('heading', { name: 'Hồ sơ cá nhân' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nguyen Minh Anh' })).toBeVisible();
  await expect(page.getByText('minh.anh@example.com').first()).toBeVisible();
  await expect(page.getByText('Giáo viên').first()).toBeVisible();
  await expect(
    page.locator('article').filter({ hasText: 'Gói hiện tại' }).getByText('Pro')
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mở tùy chọn ảnh đại diện' })).toBeVisible();
});

test('edits profile basics and shows the updated values', async ({ page }) => {
  const currentProfile = { ...teacherProfile };

  await mockAuthenticatedProfile(page, currentProfile);

  await page.route('**/api/User/42', async (route) => {
    const payload = route.request().postDataJSON();
    currentProfile.fullName = payload.fullName;
    currentProfile.email = payload.email;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify('Update successfully.'),
    });
  });

  await page.goto('/teacher/profile');

  await page.getByRole('button', { name: 'Chỉnh sửa hồ sơ' }).click();
  await page.getByLabel('Tên hiển thị').fill('Le Thu Ha');
  await page.getByLabel('Email').fill('thu.ha@example.com');
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();

  await expect(page.getByText('Cập nhật hồ sơ thành công.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Le Thu Ha' })).toBeVisible();
  await expect(page.getByText('thu.ha@example.com').first()).toBeVisible();
});

test('reveals avatar actions only after clicking the avatar', async ({ page }) => {
  await mockAuthenticatedProfile(page);

  await page.goto('/teacher/profile');

  await expect(page.getByText('Tải ảnh đại diện')).toBeHidden();
  await page.getByRole('button', { name: 'Mở tùy chọn ảnh đại diện' }).click();
  await expect(page.getByText('Tải ảnh đại diện')).toBeVisible();
});

test('uploads a valid avatar and shows a success message', async ({ page }) => {
  let currentProfile = { ...teacherProfile };

  await mockAuthenticatedProfile(page, currentProfile);

  await page.route('**/api/User/avatar-upload-url', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        uploadUrl: 'https://s3.mock/avatar.png',
        s3Key: 'avatars/avatar.png',
        expiresAt: '2026-12-31T00:00:00Z',
      }),
    });
  });

  await page.route('https://s3.mock/avatar.png', async (route) => {
    await route.fulfill({ status: 200, body: '' });
  });

  await page.route('**/api/User/avatar', async (route) => {
    currentProfile.avatarUrl = 'https://cdn.example.com/avatar.png';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentProfile),
    });
  });

  await page.goto('/teacher/profile');

  await page.getByRole('button', { name: 'Mở tùy chọn ảnh đại diện' }).click();
  await page.getByLabel('Tải ảnh đại diện').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from([137, 80, 78, 71]),
  });

  await expect(page.getByText('Cập nhật ảnh đại diện thành công.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mở tùy chọn ảnh đại diện' })).toBeVisible();
});

test('rejects avatar files larger than 1MB', async ({ page }) => {
  await mockAuthenticatedProfile(page);

  await page.goto('/teacher/profile');

  const oversizedAvatar = {
    name: 'avatar-too-large.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(1024 * 1024 + 1, 1),
  };

  await page.getByRole('button', { name: 'Mở tùy chọn ảnh đại diện' }).click();
  await page.getByLabel('Tải ảnh đại diện').setInputFiles(oversizedAvatar);

  await expect(page.getByText(/ảnh đại diện phải nhỏ hơn hoặc bằng 1mb/i)).toBeVisible();
});
