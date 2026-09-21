import { target, type LocatorTarget } from '../../../framework/core/locator.js';

/** 机器标注项目新建弹窗元素定位，仅维护项目创建表单。 */
export const projectFormLocators = {
  dialog: target.role('dialog'),
  // 当前组件虽输出 label，但未形成可用的可访问性关联；待前端补齐后替换为 target.label('项目名称', true)。
  projectNameInput: target.css('#name'),
  developerUserInput: target.css('#developerUserIds'),
  ownerUserInput: target.css('#ownerUserId'),
  adminUserInput: target.css('#adminUserIds'),
  projectNameRequiredError: target.text('请输入项目名称', true),
  developerRequiredError: target.text('请选择项目研发负责人', true),
  submitButton: target.role('button', '创建项目', true),
  saveButton: target.role('button', '保存项目', true),
  cancelButton: target.role('button', /取\s*消/),
};
