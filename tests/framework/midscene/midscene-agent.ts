import type { Page } from '@playwright/test';

/** Midscene 的最小能力面，避免业务页面直接依赖第三方 Agent 类型。 */
export type MidsceneAgent = {
  aiAction(prompt: string): Promise<unknown>;
  aiAssert(prompt: string, message?: string): Promise<unknown>;
  aiQuery<T = unknown>(demand: string): Promise<T>;
};

/** AI 能力默认关闭，避免普通 Playwright 回归受模型网络波动影响。 */
export function isMidsceneConfigured(): boolean {
  return process.env.MIDSCENE_ENABLED === 'true' && Boolean(process.env.MIDSCENE_MODEL_API_KEY);
}

/** 延迟加载 Midscene，未配置时不要求普通用例安装或初始化 AI 运行时。 */
export async function createMidsceneAgent(page: Page): Promise<MidsceneAgent | undefined> {
  if (!isMidsceneConfigured()) return undefined;

  const { PlaywrightAgent } = await import('@midscene/web');
  return new PlaywrightAgent(page) as MidsceneAgent;
}

/** 统一封装 AI 操作入口，页面对象和用例不直接依赖第三方实现。 */
export async function runMidsceneAction(agent: MidsceneAgent, prompt: string): Promise<void> {
  await agent.aiAction(prompt);
}

export async function runMidsceneAssertion(
  agent: MidsceneAgent,
  prompt: string,
  message?: string,
): Promise<void> {
  await agent.aiAssert(prompt, message);
}
