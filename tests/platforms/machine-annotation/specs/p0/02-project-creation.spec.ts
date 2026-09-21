import { test } from '../../fixtures/machine-annotation.fixture.js';
import { ProjectDataFactory } from '../../data/project.factory.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('P0：机器标注平台项目管理', () => {
  test('P0-ANNOTATION-02：创建项目后刷新列表仍可见', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();

    const project = await new ProjectDataFactory(
      projectManagementPage,
      hawkApiClient,
      dataScope,
    ).createProject();

    await projectManagementPage.reload();
    await projectManagementPage.assertProjectVisible(project.name);
  });
});
