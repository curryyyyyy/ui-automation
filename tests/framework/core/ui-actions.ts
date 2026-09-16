import type { Locator, Page, Response } from '@playwright/test';
import { resolveLocator, type LocatorTarget } from './locator.js';

export type ResponseMatcher = (response: Response) => boolean;
type SelectOption = Parameters<Locator['selectOption']>[0];
type FilePayload = Parameters<Locator['setInputFiles']>[0];

/** 集中封装可靠的 Playwright 操作，禁止在页面对象中使用固定等待。 */
export class UiActions {
  constructor(private readonly page: Page) {}

  locator(element: LocatorTarget): Locator {
    return resolveLocator(this.page, element);
  }

  async click(element: LocatorTarget): Promise<void> {
    await this.locator(element).click();
  }

  /** 在以标题划分的区域内点击动作，适用于门户同名操作按钮的稳定定位。 */
  async clickActionForHeading(heading: LocatorTarget, action: LocatorTarget): Promise<void> {
    const section = this.locator(heading).locator('xpath=ancestor::*[.//button][1]');
    await resolveLocator(section, action).click();
  }

  async fill(element: LocatorTarget, value: string): Promise<void> {
    await this.locator(element).fill(value);
  }

  async clearAndType(element: LocatorTarget, value: string): Promise<void> {
    const locator = this.locator(element);
    await locator.click();
    await locator.fill('');
    await locator.pressSequentially(value);
  }

  async press(element: LocatorTarget, key: string): Promise<void> {
    await this.locator(element).press(key);
  }

  async select(element: LocatorTarget, option: SelectOption | string): Promise<void> {
    await this.locator(element).selectOption(option);
  }

  async check(element: LocatorTarget, checked = true): Promise<void> {
    const locator = this.locator(element);
    if (checked) await locator.check();
    else await locator.uncheck();
  }

  async upload(element: LocatorTarget, file: FilePayload): Promise<void> {
    await this.locator(element).setInputFiles(file);
  }

  /** 必须先注册响应监听，再执行 UI 操作，以避免竞态。 */
  async performAndWaitForResponse<T>(
    matcher: ResponseMatcher,
    operation: () => Promise<T>,
  ): Promise<{ result: T; response: Response }> {
    const responsePromise = this.page.waitForResponse(matcher);
    const result = await operation();
    return { result, response: await responsePromise };
  }

  async waitForVisible(element: LocatorTarget): Promise<Locator> {
    const locator = this.locator(element);
    await locator.waitFor({ state: 'visible' });
    return locator;
  }
}
