import { target, type LocatorTarget } from '../../../framework/core/locator.js';

/** 数据服务平台门户元素定位，仅维护门户页面和入口卡片元素。 */
export const portalLocators = {
  homeReady: (text: string): LocatorTarget => target.text(text, true),
  platformHeading: (name: string): LocatorTarget => target.role('heading', name, true),
  usePlatformButton: target.role('button', '立即使用', true),
};
