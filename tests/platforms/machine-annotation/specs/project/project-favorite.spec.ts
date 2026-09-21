import { test } from '../../fixtures/machine-annotation.fixture.js';
import { HawkApiDataFactory } from '../../data/hawk-api.factory.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('机器标注平台项目管理', () => {
  test('PROJECT-03：关注项目后可在我的关注中查看', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();

    const dataFactory = new HawkApiDataFactory(hawkApiClient, dataScope);
    const followedProject = await dataFactory.createProject(uniqueName('FOLLOWED'));
    const unfollowedProject = await dataFactory.createProject(uniqueName('UNFOLLOWED'));

    await projectManagementPage.searchProject(followedProject.name);
    await projectManagementPage.followProject(followedProject.name);
    await projectManagementPage.showMyFavorites();
    await projectManagementPage.assertProjectVisible(followedProject.name);
    await projectManagementPage.assertProjectNotVisible(unfollowedProject.name);
  });
});

function uniqueName(kind: string): string {
  return `MA-PROJECT-FAVORITE-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
