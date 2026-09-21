import { test } from '../../fixtures/machine-annotation.fixture.js';
import { HawkApiDataFactory } from '../../data/hawk-api.factory.js';
import { ProjectDetailPage } from '../../pages/project-detail.page.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('机器标注批次列表', () => {
  test('BATCH-LIST-01：API 创建批次后刷新详情列表仍可见', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();
    const dataFactory = new HawkApiDataFactory(hawkApiClient, dataScope);
    const project = await dataFactory.createProject();
    const batch = await dataFactory.createBatch(project);

    await projectManagementPage.searchProject(project.name);
    await projectManagementPage.openProjectDetail(project.name);
    const projectDetailPage = new ProjectDetailPage(authenticatedPage);
    await projectDetailPage.assertReady(project.name);
    await projectDetailPage.assertBatchVisible(batch.name);
    await authenticatedPage.reload({ waitUntil: 'domcontentloaded' });
    await projectDetailPage.assertReady(project.name);
    await projectDetailPage.assertBatchVisible(batch.name);
  });
});
