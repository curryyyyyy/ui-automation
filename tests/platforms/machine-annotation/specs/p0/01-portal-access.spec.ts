import { test } from '../../fixtures/machine-annotation.fixture.js';
import { environment } from '../../../../framework/core/environment.js';
import { PortalPage } from '../../../data-service-portal/pages/portal.page.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

test.describe('P0：机器标注平台', () => {
  test('P0-ANNOTATION-01：用户从门户进入机器标注项目管理', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const portalPage = new PortalPage(page);
    await portalPage.goto();
    await portalPage.openPlatform(environment.platform('machine-annotation'));

    await new ProjectManagementPage(page).assertReady();
  });
});
