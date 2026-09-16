import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { Browser, BrowserContext, Page } from '@playwright/test';

/** 管理角色隔离的 storageState；认证文件包含会话凭据，只能保存在本地。 */
export type SessionStrategy = {
  /** 使用已缓存的认证态访问受保护页面，返回该认证态是否仍有效。 */
  verify(page: Page): Promise<boolean>;
  /** 在新建 context 中完成交互式认证。 */
  authenticate(page: Page): Promise<void>;
};

export class SessionManager {
  constructor(private readonly browser: Browser) {}

  /**
   * 每条用例创建独立 BrowserContext，避免 Cookie、localStorage 和页面状态相互污染。
   * 认证态文件只作为 context 的初始状态，绝不复用同一个可变 context。
   */
  async createAuthenticatedContext(role: string, strategy: SessionStrategy): Promise<BrowserContext> {
    const statePath = this.statePath(role);
    if (existsSync(statePath)) {
      const context = await this.browser.newContext({ storageState: statePath });
      const page = await context.newPage();
      const valid = await strategy.verify(page).catch(() => false);
      await page.close();
      if (valid) return context;
      await context.close();
      rmSync(statePath, { force: true });
    }

    const context = await this.browser.newContext();
    const page = await context.newPage();
    await strategy.authenticate(page);
    mkdirSync(join(process.cwd(), '.auth'), { recursive: true });
    await context.storageState({ path: statePath });
    await page.close();
    return context;
  }

  private statePath(role: string): string {
    if (!/^[a-z0-9_-]+$/i.test(role)) throw new Error(`角色名无效：${role}`);
    return join(process.cwd(), '.auth', `${role}.json`);
  }
}
