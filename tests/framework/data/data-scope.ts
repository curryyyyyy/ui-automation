export type Cleanup = () => Promise<void> | void;

type CleanupEntry = {
  label: string;
  cleanup: Cleanup;
};

/**
 * 单条用例的数据清理栈。写入型用例创建资源后立即登记清理器，Fixture 在用例结束时逆序执行。
 * 即使某项清理失败，也会继续清理其余资源，最终汇总失败信息，避免测试数据继续污染后续执行。
 */
export class DataScope {
  private readonly entries: CleanupEntry[] = [];
  private disposed = false;

  defer(label: string, cleanup: Cleanup): void {
    if (this.disposed) throw new Error(`数据作用域已清理，无法登记：${label}`);
    this.entries.push({ label, cleanup });
  }

  track<T>(resource: T, label: string, cleanup: (resource: T) => Promise<void> | void): T {
    this.defer(label, () => cleanup(resource));
    return resource;
  }

  /** 资源已由被测流程主动删除时，移除对应的兜底清理器。 */
  release(label: string): void {
    const index = this.entries.findIndex((entry) => entry.label === label);
    if (index >= 0) this.entries.splice(index, 1);
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;

    const failures: Error[] = [];
    for (const entry of this.entries.reverse()) {
      try {
        await entry.cleanup();
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        failures.push(new Error(`清理“${entry.label}”失败：${detail}`));
      }
    }
    if (failures.length > 0) {
      throw new AggregateError(failures, '测试数据清理失败');
    }
  }
}
