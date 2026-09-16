import { target, type LocatorTarget } from '../core/locator.js';

/** 二级平台通用可达性页面的元素定位，不包含任一平台业务元素。 */
export const platformAccessLocators = {
  readyText: (text: string): LocatorTarget => target.text(text, true),
};
