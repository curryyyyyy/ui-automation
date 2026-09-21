import { expect, type Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/base.page.js';
import { batchFormLocators } from '../locators/batch-form.locator.js';
import { projectDetailLocators } from '../locators/project-detail.locator.js';

/** 机器标注项目详情页，承载项目详情与批次列表的 UI 验证。 */
export class ProjectDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertReady(projectName: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/hawk\/project\/detail\/\d+(?:[/?#]|$)/);
    await expect(this.actions.locator(projectDetailLocators.pageTitle).first()).toBeVisible();
    await expect(this.actions.locator(projectDetailLocators.newBatchButton)).toBeVisible();
    await expect(this.actions.locator(projectDetailLocators.batchName(projectName))).toBeVisible();
  }

  async assertBatchVisible(name: string): Promise<void> {
    await expect(this.actions.locator(projectDetailLocators.batchName(name))).toBeVisible();
  }

  /** 打开新增批次表单，不提交业务数据。 */
  async openNewBatchForm(): Promise<void> {
    await this.actions.click(projectDetailLocators.newBatchButton);
    await expect(this.actions.locator(batchFormLocators.dialog)).toBeVisible();
    await expect(this.actions.locatorWithin(batchFormLocators.dialog, batchFormLocators.batchNameInput)).toBeVisible();
    await expect(this.actions.locatorWithin(batchFormLocators.dialog, batchFormLocators.workflowInput)).toBeVisible();
    await expect(this.actions.locatorWithin(batchFormLocators.dialog, batchFormLocators.submitButton)).toBeVisible();
  }

  async assertNewBatchValidation(): Promise<void> {
    await this.actions.clickWithin(batchFormLocators.dialog, batchFormLocators.submitButton);
    const errors = this.actions.locatorWithin(batchFormLocators.dialog, batchFormLocators.validationErrors);
    await expect(errors).toHaveCount(4);
    const messages = await errors.allTextContents();
    expect(messages).toEqual(expect.arrayContaining(['请输入批次名称', '请选择工作流']));
  }
}
