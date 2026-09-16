import { target } from '../../../framework/core/locator.js';

/** 机器标注项目管理页元素定位，仅维护机器标注平台页面元素。 */
export const projectManagementLocators = {
  createProjectButton: target.role('button', /新建项目/),
};
