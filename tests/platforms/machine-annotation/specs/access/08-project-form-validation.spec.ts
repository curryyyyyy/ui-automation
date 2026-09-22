import { test } from '../../fixtures/machine-annotation.fixture.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('P0：机器标注平台项目表单', () => {
  test('P0-ANNOTATION-08：新建项目表单校验必填字段', async ({ authenticatedPage }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();
    await projectManagementPage.openCreateProjectForm();
    await projectManagementPage.assertCreateProjectValidation();
  });
});
