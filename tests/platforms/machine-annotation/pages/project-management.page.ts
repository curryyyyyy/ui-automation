import { expect, type Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/base.page.js';
import { projectManagementLocators } from '../locators/project-management.locator.js';

/** 机器标注平台项目管理首页，只承载机器标注平台的元素与断言。 */
export class ProjectManagementPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertReady(): Promise<void> {
    await expect(this.page).toHaveURL(/\/hawk\/project(?:[/?#]|$)/);
    await expect(this.actions.locator(projectManagementLocators.createProjectButton)).toBeVisible();
  }
}
