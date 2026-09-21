import { test } from '../../fixtures/machine-annotation.fixture.js';
import { ProjectDataFactory } from '../../data/project.factory.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('P0：机器标注平台项目编辑', () => {
  test('P0-ANNOTATION-10：编辑项目表单提交成功且项目仍可查询', async ({
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
    const updatedName = `${project.name}-已编辑`;

    await projectManagementPage.searchProject(project.name);
    await projectManagementPage.updateProjectName(project.name, updatedName);
    await projectManagementPage.reload();
    const current = await hawkApiClient.getProject(project.id);
    if (current.id !== project.id) throw new Error(`编辑项目后无法回查项目：${project.id}`);
  });
});
