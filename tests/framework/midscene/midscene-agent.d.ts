declare module '@midscene/web' {
  import type { Page } from '@playwright/test';

  export class PlaywrightAgent {
    constructor(page: Page, options?: unknown);
    aiAction(prompt: string): Promise<unknown>;
    aiAssert(prompt: string, message?: string): Promise<unknown>;
    aiQuery<T = unknown>(demand: string): Promise<T>;
  }
}
