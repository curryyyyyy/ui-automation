import { resolve } from 'node:path';

export type Credentials = { username: string; password: string };

export type PlatformDefinition = {
  id: string;
  name: string;
  url: string;
  readyText: string;
};

type SsoSelectors = {
  username: string;
  password: string;
};

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function required(name: string): string {
  const value = optional(name);
  if (!value || value === 'replace-me') {
    throw new Error(`缺少 ${name}。请从 .env.example 创建 .env 并配置测试环境。`);
  }
  return value;
}

function parseAdditionalPlatforms(): PlatformDefinition[] {
  const raw = optional('UI_PLATFORMS_JSON');
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('必须是数组。');
    return parsed.map((value, index) => {
      if (!value || typeof value !== 'object') throw new Error(`第 ${index} 项无效。`);
      const entry = value as Record<string, unknown>;
      if (typeof entry.id !== 'string' || typeof entry.name !== 'string' ||
          typeof entry.url !== 'string' || typeof entry.readyText !== 'string') {
        throw new Error(`第 ${index} 项必须包含 id、name、url 和 readyText。`);
      }
      return { id: entry.id, name: entry.name, url: entry.url, readyText: entry.readyText };
    });
  } catch (error) {
    throw new Error(`UI_PLATFORMS_JSON 无效：${(error as Error).message}`);
  }
}

function builtInPlatforms(): PlatformDefinition[] {
  const candidates = [
    {
      id: 'machine-annotation',
      name: '机器标注工具',
      url: optional('UI_MACHINE_ANNOTATION_URL'),
      readyText: optional('UI_MACHINE_ANNOTATION_READY_TEXT'),
    },
    {
      id: 'resource-management',
      name: '资源管理平台',
      url: optional('UI_RESOURCE_MANAGEMENT_URL'),
      readyText: optional('UI_RESOURCE_MANAGEMENT_READY_TEXT'),
    },
  ];
  return candidates.flatMap((platform) => {
    if (!platform.url && !platform.readyText) return [];
    if (!platform.url || !platform.readyText) {
      throw new Error(`平台 ${platform.id} 必须同时配置 URL 和 READY_TEXT。`);
    }
    return [platform as PlatformDefinition];
  });
}

export const environment = {
  artifactsRoot: resolve('test-results'),
  authUrlPattern: optional('UI_AUTHENTICATED_URL_PATTERN') ?? '^(?!.*(/login|/signin)).+$',
  isSsoConfigured: Boolean(
    optional('UI_SSO_LOGIN_URL') &&
    optional('UI_E2E_USERNAME') && optional('UI_E2E_PASSWORD') &&
    optional('UI_SSO_USERNAME_SELECTOR') && optional('UI_SSO_PASSWORD_SELECTOR'),
  ),
  isPortalConfigured: Boolean(
    optional('UI_SSO_LOGIN_URL') && optional('UI_PORTAL_URL') &&
    optional('UI_E2E_USERNAME') && optional('UI_E2E_PASSWORD') &&
    optional('UI_SSO_USERNAME_SELECTOR') && optional('UI_SSO_PASSWORD_SELECTOR') &&
    optional('UI_PORTAL_READY_TEXT'),
  ),
  credentials(): Credentials {
    return { username: required('UI_E2E_USERNAME'), password: required('UI_E2E_PASSWORD') };
  },
  sso() {
    return {
      loginUrl: required('UI_SSO_LOGIN_URL'),
      selectors: {
        username: required('UI_SSO_USERNAME_SELECTOR'),
        password: required('UI_SSO_PASSWORD_SELECTOR'),
      } satisfies SsoSelectors,
    };
  },
  portal() {
    return { url: required('UI_PORTAL_URL'), readyText: required('UI_PORTAL_READY_TEXT') };
  },
  platforms(): PlatformDefinition[] {
    const platforms = [...builtInPlatforms(), ...parseAdditionalPlatforms()];
    const seen = new Set<string>();
    for (const platform of platforms) {
      if (seen.has(platform.id)) throw new Error(`平台 id 重复：${platform.id}`);
      seen.add(platform.id);
    }
    return platforms;
  },
  platform(id: string): PlatformDefinition {
    const platform = this.platforms().find((item) => item.id === id);
    if (!platform) throw new Error(`未配置平台：${id}`);
    return platform;
  },
};
