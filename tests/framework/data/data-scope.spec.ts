import { expect, test } from '@playwright/test';
import { DataScope } from './data-scope.js';

test.describe('DataScope', () => {
  test('清理器按资源创建的逆序执行，重复清理不重复调用', async () => {
    const scope = new DataScope();
    const calls: string[] = [];
    scope.defer('项目', () => {
      calls.push('项目');
    });
    scope.defer('批次', () => {
      calls.push('批次');
    });

    await scope.dispose();
    await scope.dispose();

    expect(calls).toEqual(['批次', '项目']);
  });
});
