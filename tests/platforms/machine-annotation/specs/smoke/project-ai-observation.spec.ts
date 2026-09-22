import { test, expect } from '../../fixtures/machine-annotation.fixture.js';
import { environment } from '../../../../framework/core/environment.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('机器标注平台 Midscene 语义观察', () => {
  test('SMOKE-AI-01：Midscene 可与 Playwright 共享已认证页面', async ({ authenticatedPage, midscene }) => {
    test.skip(!midscene, '请设置 MIDSCENE_ENABLED=true 和 MIDSCENE_MODEL_API_KEY 后运行 AI 观察用例。');

    const projects = new ProjectManagementPage(authenticatedPage);
    await projects.open(environment.platform('machine-annotation').url);
    await projects.assertReady();

    // AI 只负责语义观察；最终的可执行结果仍由 Playwright 的确定性断言确认。
    await midscene!.aiAssert('页面显示机器标注平台的项目管理页面，并能看到项目列表区域。');
    await expect(authenticatedPage).toHaveURL(/\/hawk\/project(?:[/?#]|$)/);
  });
});
