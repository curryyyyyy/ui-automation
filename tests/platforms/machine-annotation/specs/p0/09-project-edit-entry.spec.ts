import { test } from '../../fixtures/machine-annotation.fixture.js';
import { HawkApiDataFactory } from '../../data/hawk-api.factory.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('P0：机器标注平台项目编辑', () => {
  test('P0-ANNOTATION-09：用户可从项目行打开编辑项目表单', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();
    const project = await new HawkApiDataFactory(hawkApiClient, dataScope).createProject();

    await projectManagementPage.searchProject(project.name);
    await projectManagementPage.openEditProject(project.name);
    await projectManagementPage.assertEditProjectFormVisible();
  });
});
