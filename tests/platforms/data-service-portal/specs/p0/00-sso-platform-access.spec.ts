import { test } from '@playwright/test';
import { environment } from '../../../../framework/core/environment.js';
import { PortalPage } from '../../pages/portal.page.js';
import { SsoLoginPage } from '../../../../shared/sso/pages/sso-login.page.js';

test.describe('P0：数据服务平台门户', () => {
  test.skip(!environment.isPortalConfigured, '请先根据 .env.example 配置门户与 SSO 测试环境。');

  test('P0-PORTAL-00：用户登录后可进入数据服务平台门户', async ({ page }) => {
    const loginPage = new SsoLoginPage(page);
    await loginPage.signIn(environment.credentials());

    const portalPage = new PortalPage(page);
    await portalPage.goto();
  });
});
