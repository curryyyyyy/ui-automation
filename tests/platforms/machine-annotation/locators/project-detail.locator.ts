import { target, type LocatorTarget } from '../../../framework/core/locator.js';

/** 机器标注项目详情页元素定位，仅维护详情和批次列表页面元素。 */
export const projectDetailLocators = {
  pageTitle: target.text('项目详情', true),
  newBatchButton: target.role('button', /新增批次/),
  batchName: (name: string): LocatorTarget => target.text(name, true),
};
