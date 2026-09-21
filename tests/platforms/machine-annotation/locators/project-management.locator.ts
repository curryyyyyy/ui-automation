import { target, type LocatorTarget } from '../../../framework/core/locator.js';

/** 机器标注项目管理页元素定位，仅维护机器标注平台页面元素。 */
export const projectManagementLocators = {
  createProjectButton: target.role('button', /新建项目/),
  projectNameSearchInput: target.role('textbox', /项目名称/),
  searchButton: target.role('button', /查\s*询/),
  resetSearchButton: target.role('button', '重 置', true),
  myFavoritesRadio: target.role('radio', '我的关注', true),
  // Ant Design 隐藏原生 radio；点击可见文本触发真实用户交互，radio 仅用于选中状态断言。
  myFavoritesFilter: target.text('我的关注', true),
  editProjectButton: target.role('button', '编辑', true),
  followProjectButton: target.role('button', '关注', true),
  unfollowProjectButton: target.role('button', '取消关注', true),
  unfollowConfirmation: target.role('tooltip'),
  confirmUnfollowButton: target.role('button', /确\s*认/),
  viewProjectButton: target.role('button', '查看', true),
  projectName: (name: string): LocatorTarget => target.text(name, true),
};
