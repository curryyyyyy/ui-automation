import { expect, type Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/base.page.js';
import { resourceListLocators } from '../locators/resource-list.locator.js';

/** 资源管理平台资源列表首页，只承载资源管理平台的元素与断言。 */
export class ResourceListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertReady(): Promise<void> {
    await expect(this.page).toHaveURL(/\/resource-platform\/index(?:[/?#]|$)/);
    await expect(this.actions.locator(resourceListLocators.directoryTreeTitle)).toBeVisible();
  }
}
