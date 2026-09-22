import { target } from '../../../framework/core/locator.js';

/** 机器标注新增批次弹窗元素定位，仅维护批次创建表单。 */
export const batchFormLocators = {
  dialog: target.role('dialog'),
  // 当前组件的标签未稳定暴露为可访问关联；前端补齐后替换为 target.label('批次名称', true)。
  batchNameInput: target.css('#name'),
  // 工作流选择器是 Ant Design 组合框，前端应提供测试标识以替换此 CSS 兜底定位。
  workflowInput: target.css('#flowName'),
<<<<<<< HEAD
  validationErrors: target.css('.ant-form-item-explain-error'),
=======
>>>>>>> 5e0e3263e6df14975f2961018d45ca06420f0d83
  submitButton: target.role('button', '创建批次', true),
};
