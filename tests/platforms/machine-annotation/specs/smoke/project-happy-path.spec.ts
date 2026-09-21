import { test } from '../../fixtures/machine-annotation.fixture.js';
import { ProjectDataFactory } from '../../data/project.factory.js';
import { ProjectDetailPage } from '../../pages/project-detail.page.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('机器标注平台项目 Smoke 快乐路径', () => {
  test('SMOKE-PROJECT-01：新建-编辑-查看-关注-我的关注-取消关注-删除项目', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectPage = new ProjectManagementPage(authenticatedPage);
    await projectPage.goto();

    const dataFactory = new ProjectDataFactory(
      projectPage,
      hawkApiClient,
      dataScope,
    );
    const project = await dataFactory.createProject();

    await projectPage.searchProject(project.name);
    await projectPage.openEditProject(project.name);
    await projectPage.assertEditProjectFormVisible();
    await projectPage.cancelEditProject();

    // 编辑保存后沿真实列表路径继续验证查看、关注和取消关注。
    await projectPage.reload();
    await projectPage.resetSearch();
    await projectPage.searchProject(project.name);
    await projectPage.openProjectDetail(project.name);
    await new ProjectDetailPage(authenticatedPage).assertReady(project.name);
    await projectPage.returnToList();

    await projectPage.assertProjectVisible(project.name);
    await projectPage.followProject(project.name);
    await projectPage.showMyFavorites();
    await projectPage.assertProjectVisible(project.name);
    await projectPage.unfollowProject(project.name);
    await projectPage.showMyFavorites();
    await projectPage.assertProjectNotVisible(project.name);

    // 当前项目列表和编辑弹窗没有删除按钮，删除动作使用平台 API，删除结果回到 UI 验证。
    await dataFactory.deleteProject(project);
    await projectPage.resetSearch();
    await projectPage.searchProject(project.name);
    await projectPage.assertProjectNotVisible(project.name);
  });
});
