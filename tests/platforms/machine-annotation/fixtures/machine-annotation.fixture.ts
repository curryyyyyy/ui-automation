import { test as ssoTest } from '../../../shared/sso/fixtures/authenticated.fixture.js';
import { environment } from '../../../framework/core/environment.js';
import { captureHawkApiAccess } from '../api/hawk-api-access.js';
import { HawkApiClient } from '../api/hawk-api.client.js';

type MachineAnnotationFixtures = {
  hawkApiClient: HawkApiClient;
};

/** 机器标注业务 Fixture：在共享登录态之上提供本平台 API 客户端。 */
export const test = ssoTest.extend<MachineAnnotationFixtures>({
  hawkApiClient: async ({ authenticatedPage }, use) => {
    const access = await captureHawkApiAccess(authenticatedPage);
    await use(new HawkApiClient(authenticatedPage.context().request, access));
  },
});

test.skip(
  !environment.isPortalConfigured,
  '请先根据 .env.example 配置 SSO、门户和机器标注平台测试环境。',
);

export { expect } from '@playwright/test';
