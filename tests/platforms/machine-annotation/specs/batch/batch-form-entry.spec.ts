import { test } from '../../fixtures/machine-annotation.fixture.js';
import { HawkApiDataFactory } from '../../data/hawk-api.factory.js';
import { ProjectDetailPage } from '../../pages/project-detail.page.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('机器标注新增批次', () => {
  test('BATCH-FORM-01：用户可从项目详情打开新增批次表单', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();
    const project = await new HawkApiDataFactory(hawkApiClient, dataScope).createProject();

    await projectManagementPage.searchProject(project.name);
    await projectManagementPage.openProjectDetail(project.name);
    const projectDetailPage = new ProjectDetailPage(authenticatedPage);
    await projectDetailPage.assertReady(project.name);
    await projectDetailPage.openNewBatchForm();
  });
});
