import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { DataScope } from '../../../framework/data/data-scope.js';
import { environment } from '../../../framework/core/environment.js';
import { SessionManager } from '../../../framework/services/session-manager.js';
import { SsoLoginPage } from '../pages/sso-login.page.js';

type AuthenticatedFixtures = {
  authenticatedPage: Page;
  dataScope: DataScope;
};

/**
 * 二级平台业务用例使用此 Fixture。
 * 每条用例得到独立 context 和独立 DataScope；仅复用已验证的 storageState，不复用可变浏览器状态。
 */
export const test = base.extend<AuthenticatedFixtures>({
  dataScope: async ({}, use) => {
    const scope = new DataScope();
    try {
      await use(scope);
    } finally {
      await scope.dispose();
    }
  },
  authenticatedPage: async ({ browser }, use) => {
    const manager = new SessionManager(browser);
    let context: BrowserContext | undefined;
    try {
      context = await manager.createAuthenticatedContext('default', {
        async verify(page) {
          await page.goto(environment.portal().url, { waitUntil: 'domcontentloaded' });
          return new RegExp(environment.authUrlPattern).test(page.url());
        },
        async authenticate(page) {
          await new SsoLoginPage(page).signIn(environment.credentials());
        },
      });
      await use(await context.newPage());
    } finally {
      await context?.close();
    }
  },
});

export { expect } from '@playwright/test';
