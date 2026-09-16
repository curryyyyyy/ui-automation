import type { Page } from '@playwright/test';
import { UiActions } from '../core/ui-actions.js';

/** 所有页面对象的基类。测试用例只能通过页面对象操作 UI。 */
export abstract class BasePage {
  protected readonly actions: UiActions;

  protected constructor(protected readonly page: Page) {
    this.actions = new UiActions(page);
  }

  protected async visit(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }
}
