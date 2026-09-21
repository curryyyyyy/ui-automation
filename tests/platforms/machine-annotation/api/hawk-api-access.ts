import type { Page } from '@playwright/test';
import { environment } from '../../../framework/core/environment.js';

/** 已认证浏览器会话中提取的机器标注 API 访问上下文。 */
export type HawkApiAccess = {
  origin: string;
  authorization: string;
};

/**
 * 从机器标注项目列表的真实浏览器请求提取 API 鉴权信息。
 * 该能力属于机器标注平台 API 层，不由页面对象或共享 SSO Fixture 承担。
 */
export async function captureHawkApiAccess(page: Page): Promise<HawkApiAccess> {
  const requestPromise = page.waitForRequest((candidate) => {
    if (candidate.method() !== 'GET') return false;
    return new URL(candidate.url()).pathname === '/api/v1/project';
  });

  await page.goto(environment.platform('machine-annotation').url, {
    waitUntil: 'domcontentloaded',
  });
  const request = await requestPromise;
  const authorization = request.headers().authorization;
  if (!authorization) {
    throw new Error('项目列表请求未携带认证信息，无法通过 API 创建测试数据。');
  }

  return { origin: new URL(request.url()).origin, authorization };
}
