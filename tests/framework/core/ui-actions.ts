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

  /** 在声明式容器内解析元素，避免页面对象拼接业务选择器。 */
  locatorWithin(container: LocatorTarget, element: LocatorTarget): Locator {
    return resolveLocator(this.locator(container), element);
  }

  /** 返回包含指定元素的最近表格行，适用于列表中的行级断言和操作。 */
  tableRowContaining(element: LocatorTarget): Locator {
    return this.locator(element).locator('xpath=ancestor::tr[1]');
  }

  async click(element: LocatorTarget): Promise<void> {
    await this.locator(element).click();
  }

  async clickWithin(container: LocatorTarget, element: LocatorTarget): Promise<void> {
    await this.locatorWithin(container, element).click();
  }

  /** 在包含指定内容的表格行内点击动作，避免业务页面自行拼接行级选择器。 */
  async clickTableRowAction(rowContent: LocatorTarget, action: LocatorTarget): Promise<void> {
    await resolveLocator(this.tableRowContaining(rowContent), action).click();
  }

  /** 在以标题划分的区域内点击动作，适用于门户同名操作按钮的稳定定位。 */
  async clickActionForHeading(heading: LocatorTarget, action: LocatorTarget): Promise<void> {
    const section = this.locator(heading).locator('xpath=ancestor::*[.//button][1]');
    await resolveLocator(section, action).click();
  }

  async fill(element: LocatorTarget, value: string): Promise<void> {
    await this.locator(element).fill(value);
  }

  async fillWithin(container: LocatorTarget, element: LocatorTarget, value: string): Promise<void> {
    await this.locatorWithin(container, element).fill(value);
  }

  async clearAndType(element: LocatorTarget, value: string): Promise<void> {
    const locator = this.locator(element);
    await locator.click();
    await locator.fill('');
    await locator.pressSequentially(value);
  }

  /** 兼容部分 React 受控输入框：使用原生 setter 后补发 input/change 事件。 */
  async setControlledValue(element: LocatorTarget, value: string): Promise<void> {
    const locator = this.locator(element);
    await this.setControlledLocatorValue(locator, value);
  }

  async setControlledValueWithin(container: LocatorTarget, element: LocatorTarget, value: string): Promise<void> {
    await this.setControlledLocatorValue(this.locatorWithin(container, element), value);
  }

  private async setControlledLocatorValue(locator: Locator, value: string): Promise<void> {
    await locator.evaluate((node, nextValue) => {
      const input = node as HTMLInputElement | HTMLTextAreaElement;
      const prototype = input instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (!setter) throw new Error('找不到受控输入框 value setter。');
      const tracker = (input as HTMLInputElement & {
        _valueTracker?: { setValue(value: string): void };
      })._valueTracker;
      tracker?.setValue(input.value);
      setter.call(input, nextValue);
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
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
