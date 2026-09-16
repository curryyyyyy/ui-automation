# UI 自动化开发约束

本文件适用于 `ui-automation` 下的所有后续开发。架构细节见 `ARCHITECTURE.md`。

## 平台隔离

- `tests/framework/` 只放跨平台能力，禁止导入或按平台名称分支。
- `tests/shared/sso/` 只处理单点登录和认证态，不放业务平台操作。
- 每个二级平台必须在 `tests/platforms/<平台>/` 内维护自己的页面对象、元素定位、数据、用例和 README；不得跨平台复用业务选择器。
- 机器标注平台使用 `machine-annotation/`，资源管理平台使用 `resource-management/`，门户使用 `data-service-portal/`。

## 页面对象与用例

- 正式用例必须使用 Page Object，禁止在 spec 中裸写定位器或直接操作页面。
- 严格解耦：每个页面的元素定位必须写入所属平台或 SSO 的 `locators/<页面>.locator.ts`；定位器文件只声明 `LocatorTarget`，不得执行操作或断言。
- Page Object 只能编排 `UiActions`、页面跳转、业务语义和断言；禁止直接导入 `target` 或在 `pages/` 内声明元素定位。
- 禁止建立跨平台业务选择器注册表。`framework/` 只能包含定位模型和无平台名称的通用操作，业务选择器必须留在所属平台。
- 定位优先使用 `data-testid`、角色和名称、标签、占位符、文本；CSS 是临时兜底，必须有替换计划。
- 操作后使用 Web First 断言、`waitForResponse` 或 `waitForURL` 收口，禁止固定等待。
- SSO 登录 P0 与“登录后进入门户”P0 使用 Playwright 原始 `page`，因为登录本身就是被测链路；二级平台业务 P0 必须使用 `shared/sso/fixtures/authenticated.fixture.ts` 提供的 `authenticatedPage`，禁止重复交互式登录。
- 写入型用例必须注入 `dataScope`：资源创建成功后立即使用 `dataScope.defer()` 或 `dataScope.track()` 登记平台内清理器；Fixture 在用例结束时逆序清理。只读用例不得伪造数据清理。
- 每条用例独立造数、独立清理，只验证一个明确行为。

## 文档与安全

- 注释、README、架构说明和平台文档一律使用中文。
- 账号、密码、令牌和 storageState 只能保存在忽略的 `.env`、`.auth/` 或 CI 密钥中，禁止读取、输出或提交真实凭据。
- 页面尚未探索确认时，禁止猜测选择器或业务路径；先临时探索，沉淀 Page Object 后删除探索文件。

## 验证

- 修改后至少执行 `npm run typecheck`、受影响的 Playwright 用例和 `git diff --check`。
- 真实 P0 登录和业务链路需要在静态资源可用、选择器和平台地址已确认后执行。
