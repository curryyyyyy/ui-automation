import { test } from '../../fixtures/machine-annotation.fixture.js';
import { ProjectDataFactory } from '../../data/project.factory.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('P0：机器标注平台项目管理', () => {
  test('P0-ANNOTATION-03：按项目名称查询仅展示命中项目', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();

    const dataFactory = new ProjectDataFactory(projectManagementPage, hawkApiClient, dataScope);
    const matchingProject = await dataFactory.createProject(uniqueName('MATCH'));
    const otherProject = await dataFactory.createProject(uniqueName('OTHER'));

    await projectManagementPage.searchProject(matchingProject.name);
    await projectManagementPage.assertProjectVisible(matchingProject.name);
    await projectManagementPage.assertProjectNotVisible(otherProject.name);
  });
});

function uniqueName(kind: string): string {
  return `MA-P0-SEARCH-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
