import type { DataScope } from '../../../framework/data/data-scope.js';
import type { HawkApiClient } from '../api/hawk-api.client.js';
import { ProjectManagementPage } from '../pages/project-management.page.js';

export type TestProject = {
  id: string;
  name: string;
};

/** 机器标注项目测试数据工厂：通过真实 UI 创建，并通过平台删除接口回收。 */
export class ProjectDataFactory {
  constructor(
    private readonly projectManagementPage: ProjectManagementPage,
    private readonly hawkApiClient: HawkApiClient,
    private readonly dataScope: DataScope,
  ) {}

  async createProject(name = uniqueProjectName()): Promise<TestProject> {
    await this.projectManagementPage.createProject(name);
    const created = await this.hawkApiClient.findProjectByName(name);
    this.dataScope.track(
      created,
      `删除机器标注项目 ${created.id}`,
      (project) => this.hawkApiClient.deleteProject(project.id),
    );
    return { id: created.id, name: created.name };
  }
  /** Smoke 主链路主动删除项目后释放兜底清理器。 */
  async deleteProject(project: TestProject): Promise<void> {
    await this.hawkApiClient.deleteProject(project.id);
    this.dataScope.release(`删除机器标注项目 ${project.id}`);
  }
}

function uniqueProjectName(): string {
  return `MA-PROJECT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
