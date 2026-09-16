import { test } from '../../../../shared/sso/fixtures/authenticated.fixture.js';
import { environment } from '../../../../framework/core/environment.js';
import { PortalPage } from '../../../data-service-portal/pages/portal.page.js';
import { ResourceListPage } from '../../pages/resource-list.page.js';

test.describe('P0：资源管理平台', () => {
  test.skip(
    !environment.isPortalConfigured,
    '请先根据 .env.example 配置 SSO、门户和资源管理平台测试环境。',
  );

  test('P0-RESOURCE-01：用户从门户进入资源管理资源列表', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const portalPage = new PortalPage(page);
    await portalPage.goto();
    await portalPage.openPlatform(environment.platform('resource-management'));

    await new ResourceListPage(page).assertReady();
  });
});
