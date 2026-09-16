import { expect, type Page } from '@playwright/test';
import type { PlatformDefinition } from '../core/environment.js';
import { platformAccessLocators } from '../locators/platform-access.locator.js';
import { BasePage } from './base.page.js';

/** 二级平台访问层：只验证 SSO 会话与平台就绪态，不承载任何业务操作。 */
export class PlatformAccessPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(platform: PlatformDefinition): Promise<void> {
    await this.visit(platform.url);
    await expect(this.actions.locator(platformAccessLocators.readyText(platform.readyText))).toBeVisible();
  }
}
