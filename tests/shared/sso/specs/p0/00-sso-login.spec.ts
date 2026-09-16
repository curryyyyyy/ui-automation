import { test, expect } from '@playwright/test';
import { environment } from '../../../../framework/core/environment.js';
import { SsoLoginPage } from '../../pages/sso-login.page.js';

test.describe('P0：SSO 单点登录', () => {
  test.skip(!environment.isSsoConfigured, '请先根据 .env.example 配置 SSO 测试环境。');

  test('P0-SSO-00：有效账号密码登录后离开登录页', async ({ page }) => {
    await new SsoLoginPage(page).signIn(environment.credentials());

    await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/i);
  });
});
