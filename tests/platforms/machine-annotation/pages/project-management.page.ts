import { expect, type Page } from '@playwright/test';
import { environment } from '../../../framework/core/environment.js';
import { BasePage } from '../../../framework/pages/base.page.js';
import { projectFormLocators } from '../locators/project-form.locator.js';
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

  async goto(): Promise<void> {
    await this.visit(environment.platform('machine-annotation').url);
    await this.assertReady();
  }

  async openCreateProjectForm(): Promise<void> {
    await this.actions.click(projectManagementLocators.createProjectButton);
    await expect(this.actions.locator(projectFormLocators.dialog)).toBeVisible();
  }

  async assertCreateProjectValidation(): Promise<void> {
    await this.actions.clickWithin(projectFormLocators.dialog, projectFormLocators.submitButton);
    await expect(
      this.actions.locatorWithin(projectFormLocators.dialog, projectFormLocators.projectNameRequiredError),
    ).toBeVisible();
    await expect(
      this.actions.locatorWithin(projectFormLocators.dialog, projectFormLocators.developerRequiredError),
    ).toBeVisible();
  }

  /** 通过项目管理页面创建项目，并断言其在用户可见列表中出现。 */
  async createProject(name: string): Promise<void> {
    await this.openCreateProjectForm();
    await this.actions.fillWithin(projectFormLocators.dialog, projectFormLocators.projectNameInput, name);
    await this.selectFirstDeveloper();

    const { response } = await this.actions.performAndWaitForResponse(
      (candidate) =>
        candidate.request().method() === 'POST' &&
        /\/api\/v1\/project(?:\?|$)/.test(new URL(candidate.url()).pathname),
      () => this.actions.clickWithin(projectFormLocators.dialog, projectFormLocators.submitButton),
    );
    expect(response.ok(), `创建项目接口应成功：${response.status()}`).toBeTruthy();

    await this.assertProjectVisible(name);
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.assertReady();
  }

  /** 按项目名称查询，并以实际列表请求作为操作完成信号。 */
  async searchProject(name: string): Promise<void> {
    await expect(this.actions.locator(projectManagementLocators.searchButton)).toBeEnabled();
    await this.actions.fill(projectManagementLocators.projectNameSearchInput, name);
    const { response } = await this.actions.performAndWaitForResponse(
      (candidate) => {
        if (candidate.request().method() !== 'GET') return false;
        const url = new URL(candidate.url());
        return url.pathname === '/api/v1/project' && url.searchParams.get('name') === name;
      },
      () => this.actions.click(projectManagementLocators.searchButton),
    );
    expect(response.ok(), `项目查询接口应成功：${response.status()}`).toBeTruthy();
  }

  /** 清空项目名称等查询条件，避免 Ant Design 多选筛选残留旧值。 */
  async resetSearch(): Promise<void> {
    const { response } = await this.actions.performAndWaitForResponse(
      (candidate) => {
        if (candidate.request().method() !== 'GET') return false;
        const url = new URL(candidate.url());
        return url.pathname === '/api/v1/project' && !url.searchParams.has('name');
      },
      () => this.actions.click(projectManagementLocators.resetSearchButton),
    );
    expect(response.ok(), `重置项目查询接口应成功：${response.status()}`).toBeTruthy();
    await expect(this.actions.locator(projectManagementLocators.searchButton)).toBeEnabled();
  }

  /** 切换至当前用户关注的项目视图，并确认筛选控件已选中。 */
  async showMyFavorites(): Promise<void> {
    await this.actions.click(projectManagementLocators.myFavoritesFilter);
    await expect(this.actions.locator(projectManagementLocators.myFavoritesRadio)).toBeChecked();
  }

  /** 在指定项目行执行关注，并等待关注接口成功返回。 */
  async followProject(name: string): Promise<void> {
    const { response } = await this.actions.performAndWaitForResponse(
      (candidate) => {
        if (candidate.request().method() !== 'POST') return false;
        return /^\/api\/v1\/project\/[^/]+\/favorite$/.test(new URL(candidate.url()).pathname);
      },
      () => this.actions.clickTableRowAction(
        projectManagementLocators.projectName(name),
        projectManagementLocators.followProjectButton,
      ),
    );
    expect(response.ok(), `关注项目接口应成功：${response.status()}`).toBeTruthy();
  }

  /** 在指定项目行取消关注，并等待取消关注接口成功返回。 */
  async unfollowProject(name: string): Promise<void> {
    const { response } = await this.actions.performAndWaitForResponse(
      (candidate) => {
        if (candidate.request().method() !== 'DELETE') return false;
        return /^\/api\/v1\/project\/[^/]+\/favorite$/.test(new URL(candidate.url()).pathname);
      },
      async () => {
        await this.actions.clickTableRowAction(
          projectManagementLocators.projectName(name),
          projectManagementLocators.unfollowProjectButton,
        );
        await this.actions.clickWithin(
          projectManagementLocators.unfollowConfirmation,
          projectManagementLocators.confirmUnfollowButton,
        );
      },
    );
    expect(response.ok(), `取消关注项目接口应成功：${response.status()}`).toBeTruthy();
  }

  async openEditProject(name: string): Promise<void> {
    await this.actions.clickTableRowAction(
      projectManagementLocators.projectName(name),
      projectManagementLocators.editProjectButton,
    );
    await expect(this.actions.locator(projectFormLocators.dialog)).toBeVisible();
  }

  /** 选择环境中首个可用研发负责人，避免绑定会变化的具体账号。 */
  async selectFirstDeveloper(): Promise<void> {
    await this.actions.clickWithin(projectFormLocators.dialog, projectFormLocators.developerUserInput);
    await this.actions.press(projectFormLocators.developerUserInput, 'ArrowDown');
    await this.actions.press(projectFormLocators.developerUserInput, 'Enter');
  }

  async assertEditProjectFormVisible(): Promise<void> {
    await expect(this.actions.locatorWithin(projectFormLocators.dialog, projectFormLocators.projectNameInput)).toBeVisible();
    await expect(this.actions.locatorWithin(projectFormLocators.dialog, projectFormLocators.developerUserInput)).toBeVisible();
    await expect(this.actions.locatorWithin(projectFormLocators.dialog, projectFormLocators.ownerUserInput)).toBeVisible();
    await expect(this.actions.locatorWithin(projectFormLocators.dialog, projectFormLocators.adminUserInput)).toBeVisible();
    await expect(this.actions.locatorWithin(projectFormLocators.dialog, projectFormLocators.saveButton)).toBeVisible();
  }

  /** 修改项目名称，并以更新接口返回作为提交完成信号。 */
  async updateProjectName(name: string, updatedName: string): Promise<void> {
    await this.openEditProject(name);
    const input = this.actions.locatorWithin(projectFormLocators.dialog, projectFormLocators.projectNameInput);
    await this.actions.setControlledValueWithin(projectFormLocators.dialog, projectFormLocators.projectNameInput, updatedName);
    await expect(input).toHaveValue(updatedName);
    await input.press('Tab');
    const { response } = await this.actions.performAndWaitForResponse(
      (candidate) => {
        if (candidate.request().method() !== 'PUT') return false;
        return /^\/api\/v1\/project\/[^/]+$/.test(new URL(candidate.url()).pathname);
      },
      () => this.actions.clickWithin(projectFormLocators.dialog, projectFormLocators.saveButton),
    );
    expect(response.ok(), `更新项目接口应成功：${response.status()}`).toBeTruthy();
  }

<<<<<<< HEAD
  /** 保存已回填的编辑表单，验证编辑主链路请求成功。 */
  async saveEditProject(name: string): Promise<void> {
    await this.openEditProject(name);
    const { response } = await this.actions.performAndWaitForResponse(
      (candidate) => {
        if (candidate.request().method() !== 'PUT') return false;
        return /^\/api\/v1\/project\/[^/]+$/.test(new URL(candidate.url()).pathname);
      },
      () => this.actions.clickWithin(projectFormLocators.dialog, projectFormLocators.saveButton),
    );
    expect(response.ok(), `保存项目接口应成功：${response.status()}`).toBeTruthy();
  }

  async cancelEditProject(): Promise<void> {
    await this.actions.clickWithin(projectFormLocators.dialog, projectFormLocators.cancelButton);
    await expect(this.actions.locator(projectFormLocators.dialog)).toBeHidden();
  }

=======
>>>>>>> 5e0e3263e6df14975f2961018d45ca06420f0d83
  /** 用户从项目行点击“查看”进入详情页，保持与真实操作路径一致。 */
  async openProjectDetail(name: string): Promise<void> {
    await Promise.all([
      this.page.waitForURL(/\/hawk\/project\/detail\/\d+(?:[/?#]|$)/),
      this.actions.clickTableRowAction(projectManagementLocators.projectName(name), projectManagementLocators.viewProjectButton),
    ]);
  }

<<<<<<< HEAD
  /** 从项目详情返回项目列表，继续沿用真实页面导航状态。 */
  async returnToList(): Promise<void> {
    await Promise.all([
      this.page.waitForURL((url) => url.pathname === '/hawk/project'),
      this.page.goBack(),
    ]);
    await this.assertReady();
  }

=======
>>>>>>> 5e0e3263e6df14975f2961018d45ca06420f0d83
  async assertProjectVisible(name: string): Promise<void> {
    const row = this.actions.tableRowContaining(projectManagementLocators.projectName(name));
    await expect(row).toBeVisible();
    await expect(this.actions.locator(projectManagementLocators.projectName(name))).toHaveText(name);
  }

  async assertProjectNotVisible(name: string): Promise<void> {
    await expect(this.actions.locator(projectManagementLocators.projectName(name))).toHaveCount(0);
  }
}
