import { test } from '../../fixtures/machine-annotation.fixture.js';
import { HawkApiDataFactory } from '../../data/hawk-api.factory.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('P0：机器标注平台项目关注', () => {
  test('P0-ANNOTATION-11：取消关注后项目不再显示在我的关注中', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();
    const project = await new HawkApiDataFactory(hawkApiClient, dataScope).createFavoriteProject();

    await projectManagementPage.searchProject(project.name);
    await projectManagementPage.unfollowProject(project.name);
    await projectManagementPage.showMyFavorites();
    await projectManagementPage.assertProjectNotVisible(project.name);
  });
});
