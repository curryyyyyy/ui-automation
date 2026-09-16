import type { Locator, Page } from '@playwright/test';

type AriaRole = Parameters<Page['getByRole']>[0];

/**
 * 页面对象只通过此声明式模型描述元素。优先级：测试标识 > 角色和名称 > 标签 > 占位符 > 文本 > CSS。
 * CSS 仅用于缺少稳定语义或测试标识的遗留页面，页面改造后应替换为测试标识。
 */
export type LocatorTarget =
  | { by: 'testId'; value: string }
  | { by: 'role'; role: AriaRole; name?: string | RegExp; exact?: boolean }
  | { by: 'label'; value: string | RegExp; exact?: boolean }
  | { by: 'placeholder'; value: string | RegExp; exact?: boolean }
  | { by: 'text'; value: string | RegExp; exact?: boolean }
  | { by: 'css'; value: string };

export const target = {
  testId: (value: string): LocatorTarget => ({ by: 'testId', value }),
  role: (role: AriaRole, name?: string | RegExp, exact?: boolean): LocatorTarget =>
    ({ by: 'role', role, name, exact }),
  label: (value: string | RegExp, exact?: boolean): LocatorTarget => ({ by: 'label', value, exact }),
  placeholder: (value: string | RegExp, exact?: boolean): LocatorTarget =>
    ({ by: 'placeholder', value, exact }),
  text: (value: string | RegExp, exact?: boolean): LocatorTarget => ({ by: 'text', value, exact }),
  css: (value: string): LocatorTarget => ({ by: 'css', value }),
};

export type LocatorScope = Page | Locator;

/** 将声明式元素描述解析为当前页面或局部容器中的 Playwright Locator。 */
export function resolveLocator(scope: LocatorScope, element: LocatorTarget): Locator {
  switch (element.by) {
    case 'testId':
      return scope.getByTestId(element.value);
    case 'role':
      return scope.getByRole(element.role, { name: element.name, exact: element.exact });
    case 'label':
      return scope.getByLabel(element.value, { exact: element.exact });
    case 'placeholder':
      return scope.getByPlaceholder(element.value, { exact: element.exact });
    case 'text':
      return scope.getByText(element.value, { exact: element.exact });
    case 'css':
      return scope.locator(element.value);
  }
}
