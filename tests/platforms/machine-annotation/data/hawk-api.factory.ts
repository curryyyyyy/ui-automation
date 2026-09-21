import type { DataScope } from '../../../framework/data/data-scope.js';
import type { ApiBatch, ApiProject, HawkApiClient } from '../api/hawk-api.client.js';

export type { ApiBatch, ApiProject } from '../api/hawk-api.client.js';

/** 机器标注 API 数据工厂：只负责前置与清理，业务验收必须回到真实 UI。 */
export class HawkApiDataFactory {
  constructor(
    private readonly hawkApiClient: HawkApiClient,
    private readonly dataScope: DataScope,
  ) {}

  async createProject(name = uniqueName('PROJECT')): Promise<ApiProject> {
    const project = await this.hawkApiClient.createProject(
      name,
      await this.hawkApiClient.currentOwnerUserId(),
    );
    return this.dataScope.track(project, `删除机器标注项目 ${project.id}`, (created) =>
      this.hawkApiClient.deleteProject(created.id),
    );
  }

  /** 创建已关注项目；清理时先取消关注，再删除项目。 */
  async createFavoriteProject(name = uniqueName('FAVORITE-PROJECT')): Promise<ApiProject> {
    const project = await this.createProject(name);
    await this.hawkApiClient.favoriteProject(project.id);
    return this.dataScope.track(project, `取消关注机器标注项目 ${project.id}`, (created) =>
      this.hawkApiClient.unfavoriteProject(created.id),
    );
  }

  async createBatch(project: ApiProject, name = uniqueName('BATCH')): Promise<ApiBatch> {
    const batch = await this.hawkApiClient.createBatch(
      project,
      name,
      await this.hawkApiClient.availableFlowName(),
    );
    return this.dataScope.track(batch, `删除机器标注批次 ${batch.id}`, (created) =>
      this.hawkApiClient.deleteBatch(created.id),
    );
  }
}

function uniqueName(kind: string): string {
  return `MA-API-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
