import { expect, type Page } from '@playwright/test';
import { environment, type PlatformDefinition } from '../../../framework/core/environment.js';
import { BasePage } from '../../../framework/pages/base.page.js';
import { portalLocators } from '../locators/portal.locator.js';

/** 数据服务平台门户入口。二级平台的业务操作不得写入此页面对象。 */
export class PortalPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    const portal = environment.portal();
    await this.visit(portal.url);
    await expect(this.actions.locator(portalLocators.homeReady(portal.readyText))).toBeVisible();
  }

  /** 从门户卡片进入已配置的二级平台，不按同名按钮的页面顺序定位。 */
  async openPlatform(platform: PlatformDefinition): Promise<void> {
    const expected = new URL(platform.url);
    await Promise.all([
      this.page.waitForURL((url) => url.origin === expected.origin && url.pathname === expected.pathname),
      this.actions.clickActionForHeading(
        portalLocators.platformHeading(platform.name),
        portalLocators.usePlatformButton,
      ),
    ]);
  }
}
