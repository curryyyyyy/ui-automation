import { test } from '../../fixtures/machine-annotation.fixture.js';
import { environment } from '../../../../framework/core/environment.js';
import { PortalPage } from '../../../data-service-portal/pages/portal.page.js';
import { ProjectManagementPage } from '../../pages/project-management.page.js';

<<<<<<< HEAD:tests/platforms/machine-annotation/specs/access/portal-access.spec.ts
test.describe('机器标注平台访问', () => {
  test('ACCESS-01：用户从门户进入机器标注项目管理', async ({ authenticatedPage }) => {
=======
test.describe('P0：机器标注平台', () => {
  test('P0-ANNOTATION-01：用户从门户进入机器标注项目管理', async ({ authenticatedPage }) => {
>>>>>>> 5e0e3263e6df14975f2961018d45ca06420f0d83:tests/platforms/machine-annotation/specs/p0/01-portal-access.spec.ts
    const page = authenticatedPage;

    const portalPage = new PortalPage(page);
    await portalPage.goto();
    await portalPage.openPlatform(environment.platform('machine-annotation'));

    await new ProjectManagementPage(page).assertReady();
  });
});
