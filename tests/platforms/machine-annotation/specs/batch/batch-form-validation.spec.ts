import { test } from '../../fixtures/machine-annotation.fixture.js';
import { HawkApiDataFactory } from '../../data/hawk-api.factory.js';
import { ProjectDetailPage } from '../../pages/project-detail.page.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('机器标注平台批次表单', () => {
  test('BATCH-FORM-02：批次名称和工作流为空时显示必填校验', async ({
    authenticatedPage,
    dataScope,
    hawkApiClient,
  }) => {
    const projectManagementPage = new ProjectManagementPage(authenticatedPage);
    await projectManagementPage.goto();
    const project = await new HawkApiDataFactory(hawkApiClient, dataScope).createProject();

    await projectManagementPage.searchProject(project.name);
    await projectManagementPage.openProjectDetail(project.name);
    const projectDetailPage = new ProjectDetailPage(authenticatedPage);
    await projectDetailPage.assertReady(project.name);
    await projectDetailPage.openNewBatchForm();
    await projectDetailPage.assertNewBatchValidation();
  });
});
