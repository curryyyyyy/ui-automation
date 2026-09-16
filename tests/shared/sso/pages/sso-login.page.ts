import type { Page } from '@playwright/test';
import { environment, type Credentials } from '../../../framework/core/environment.js';
import { BasePage } from '../../../framework/pages/base.page.js';
import { ssoLoginLocators } from '../locators/sso-login.locator.js';

/** SSO 是唯一允许承载交互式登录流程的页面对象。 */
export class SsoLoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async signIn(credentials: Credentials): Promise<void> {
    const sso = environment.sso();
    const locators = ssoLoginLocators(sso.selectors);
    await this.visit(sso.loginUrl);
    await this.actions.fill(locators.username, credentials.username);
    await this.actions.fill(locators.password, credentials.password);
    await this.actions.click(locators.submit);
    await this.waitUntilAuthenticated();
  }

  async waitUntilAuthenticated(): Promise<void> {
    const pattern = new RegExp(environment.authUrlPattern);
    await this.page.waitForURL((url) => pattern.test(url.href));
  }
}
