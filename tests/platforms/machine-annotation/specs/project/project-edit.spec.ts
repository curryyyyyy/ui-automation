import { test } from '../../fixtures/machine-annotation.fixture.js';
import { ProjectDataFactory } from '../../data/project.factory.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('机器标注平台项目编辑', () => {
  test('PROJECT-07：编辑项目表单可查看并取消返回项目列表', async ({
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
    await projectManagementPage.searchProject(project.name);
    await projectManagementPage.openEditProject(project.name);
    await projectManagementPage.assertEditProjectFormVisible();
    await projectManagementPage.cancelEditProject();
    const current = await hawkApiClient.getProject(project.id);
    if (current.id !== project.id) throw new Error(`编辑项目后无法回查项目：${project.id}`);
  });
});
