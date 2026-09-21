import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { HawkApiAccess } from './hawk-api-access.js';

export type ApiProject = {
  id: string;
  name: string;
};

export type ApiBatch = {
  id: string;
  name: string;
  projectId: string;
};

type Envelope = {
  code?: number;
  id?: string | number;
  data?: Record<string, unknown> & { id?: string | number; list?: Array<Record<string, unknown>> };
};

/** 机器标注 API 客户端：仅负责请求、响应校验和 API 数据转换。 */
export class HawkApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly access: HawkApiAccess,
  ) {}

  async getMyProjects(): Promise<Array<Record<string, unknown>>> {
    const response = await this.request.get(this.url('/api/v1/project?page=1&pageSize=10&onlyMine=true'), {
      headers: this.authorizationHeader(),
    });
    const body = await readEnvelope(response, '查询我的项目');
    return body.data?.list ?? [];
  }

  async findProjectByName(name: string): Promise<ApiProject> {
    const response = await this.request.get(
      this.url(`/api/v1/project?page=1&pageSize=10&name=${encodeURIComponent(name)}`),
      { headers: this.authorizationHeader() },
    );
    const body = await readEnvelope(response, '按名称查询项目');
    const project = (body.data?.list ?? []).find((candidate) => candidate.name === name);
    if (!project) throw new Error(`未找到刚创建的机器标注项目：${name}`);
    return { id: requiredRecordId(project, '查询项目'), name };
  }

  async getProject(id: string): Promise<ApiProject> {
    const response = await this.request.get(this.url(`/api/v1/project/${encodeURIComponent(id)}`), {
      headers: this.authorizationHeader(),
    });
    const body = await readEnvelope(response, '查询项目详情');
    const project = body.data;
    if (!project || typeof project.name !== 'string') throw new Error(`项目详情缺少名称：${id}`);
    return { id: requiredRecordId(project, '查询项目详情'), name: project.name };
  }

  async currentOwnerUserId(): Promise<number> {
    const projects = await this.getMyProjects();
    for (const project of projects) {
      const users = Array.isArray(project.users) ? project.users : [];
      const owner = users.find((user) => isOwner(user));
      if (owner && typeof owner.userId === 'number' && Number.isFinite(owner.userId)) {
        return owner.userId;
      }
      if (owner && typeof owner.userId === 'string') {
        const ownerUserId = Number(owner.userId);
        if (Number.isFinite(ownerUserId)) return ownerUserId;
      }
    }
    throw new Error('当前账号没有可用于 API 造数的项目 OWNER。');
  }

  async availableFlowName(): Promise<string> {
    const response = await this.request.get(this.url('/api/v1/flow?page=1&pageSize=1'), {
      headers: this.authorizationHeader(),
    });
    const body = await readEnvelope(response, '查询工作流');
    const flowName = body.data?.list?.[0]?.flowName;
    if (typeof flowName !== 'string' || !flowName) {
      throw new Error('测试环境没有可用于创建批次的工作流。');
    }
    return flowName;
  }

  async createProject(name: string, ownerUserId: number): Promise<ApiProject> {
    const response = await this.request.post(this.url('/api/v1/project'), {
      headers: this.jsonHeaders(),
      data: {
        name,
        notificationLevel: 0,
        ownerUserId,
        adminUserIds: [],
        developerUserIds: [],
      },
    });
    return { id: requiredId(await readEnvelope(response, '创建项目'), '创建项目'), name };
  }

  async favoriteProject(id: string): Promise<void> {
    const response = await this.request.post(
      this.url(`/api/v1/project/${encodeURIComponent(id)}/favorite`),
      { headers: this.authorizationHeader() },
    );
    await readEnvelope(response, '关注项目');
  }

  async unfavoriteProject(id: string): Promise<void> {
    const response = await this.request.delete(
      this.url(`/api/v1/project/${encodeURIComponent(id)}/favorite`),
      { headers: this.authorizationHeader() },
    );
    await readEnvelope(response, '取消关注项目');
  }

  async createBatch(project: ApiProject, name: string, flowName: string): Promise<ApiBatch> {
    const response = await this.request.post(this.url('/api/v1/batch'), {
      headers: this.jsonHeaders(),
      data: {
        name,
        projectId: Number(project.id),
        flowName,
        inputFilePath: 'CID://966',
        materialType: '图片',
        config: '{"stages":[]}',
      },
    });
    return {
      id: requiredId(await readEnvelope(response, '创建批次'), '创建批次'),
      name,
      projectId: project.id,
    };
  }

  async deleteProject(id: string): Promise<void> {
    const response = await this.request.delete(this.url(`/api/v1/project/${encodeURIComponent(id)}`), {
      headers: this.authorizationHeader(),
    });
    await readEnvelope(response, '删除项目');
  }

  async deleteBatch(id: string): Promise<void> {
    const response = await this.request.delete(this.url(`/api/v1/batch/${encodeURIComponent(id)}`), {
      headers: this.authorizationHeader(),
    });
    await readEnvelope(response, '删除批次');
  }

  private url(path: string): string {
    return `${this.access.origin}${path}`;
  }

  private authorizationHeader(): Record<string, string> {
    return { authorization: this.access.authorization };
  }

  private jsonHeaders(): Record<string, string> {
    return { ...this.authorizationHeader(), 'content-type': 'application/json' };
  }
}

function isOwner(user: unknown): user is { roleCode: string; userId: string | number } {
  return Boolean(
    user &&
      typeof user === 'object' &&
      (user as Record<string, unknown>).roleCode === 'OWNER' &&
      (typeof (user as Record<string, unknown>).userId === 'string' ||
        typeof (user as Record<string, unknown>).userId === 'number'),
  );
}

async function readEnvelope(response: APIResponse, action: string): Promise<Envelope> {
  const body = await response.json() as Envelope;
  if (!response.ok() || body.code !== 0) {
    throw new Error(`${action}失败：HTTP ${response.status()}，业务码 ${String(body.code)}`);
  }
  return body;
}

function requiredId(body: Envelope, action: string): string {
  const id = body.id ?? body.data?.id;
  if (typeof id !== 'string' && typeof id !== 'number') throw new Error(`${action}响应缺少编号。`);
  return String(id);
}

function requiredRecordId(record: Record<string, unknown>, action: string): string {
  const id = record.id;
  if (typeof id !== 'string' && typeof id !== 'number') throw new Error(`${action}响应缺少编号。`);
  return String(id);
}
