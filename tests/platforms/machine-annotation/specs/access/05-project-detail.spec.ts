import { test } from '../../fixtures/machine-annotation.fixture.js';
import { HawkApiDataFactory } from '../../data/hawk-api.factory.js';
import { ProjectDetailPage } from '../../pages/project-detail.page.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('P0：机器标注项目详情', () => {
  test('P0-ANNOTATION-05：用户从项目行查看进入项目详情', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();
    const project = await new HawkApiDataFactory(hawkApiClient, dataScope).createProject();

    await projectManagementPage.searchProject(project.name);
    await projectManagementPage.openProjectDetail(project.name);
    await new ProjectDetailPage(authenticatedPage).assertReady(project.name);
  });
});
