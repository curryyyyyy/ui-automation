# UI 自动化架构约束

本文件是 `ui-automation` 后续开发的强制约束，目标是让 SSO、数据服务平台门户和各二级平台能够独立演进，同时复用稳定的自动化底座。

## 目录与依赖边界

```text
tests/
  framework/                       # 跨平台基础能力，不导入任何平台代码
    core/                          # 定位模型、页面操作、环境和平台注册
    locators/                      # 无业务归属的通用页面元素定位
    data/                          # 与平台无关的数据作用域和清理协议
    pages/                         # 页面对象基类和跨平台访问层
    services/                      # 登录态生命周期
  shared/sso/                      # SSO 的专属页面对象
    fixtures/                      # 已认证会话 Fixture
    locators/                      # SSO 页面元素定位
    pages/                         # SSO 页面操作与断言
  platforms/
    data-service-portal/           # 数据服务平台门户
      locators/
      pages/
      specs/p0/
    machine-annotation/            # 机器标注平台
      api/                          # API 会话提取、客户端与响应解析
      fixtures/                     # 平台业务 Fixture
      data/                         # 数据工厂与清理登记
      locators/
      pages/
      specs/access/
      specs/project/
      specs/batch/
      specs/smoke/
    resource-management/           # 资源管理平台
      locators/
      pages/
      specs/p0/
```

- `framework/` 只能提供跨平台能力，禁止导入或按平台名称分支。
- `shared/sso/` 只处理 SSO 登录、退出和认证态，不能包含任一业务平台操作。
- 每个 `platforms/<平台>/` 独占页面对象、元素定位、测试数据、测试用例和平台说明；不得跨目录复用业务选择器。
- 用例目录按业务模块归档，例如机器标注平台使用 `specs/access/`、`specs/project/`、`specs/batch/`、`specs/smoke/`；不使用 P0/P1 作为目录层级。风险等级通过用例元数据或标题编号追踪。Smoke 只允许放跨模块核心快乐路径，不复制单模块回归用例。

## 严格解耦

- 每个页面必须有所属的 `locators/<页面>.locator.ts`。其中只允许声明或组合 `LocatorTarget`，不得包含点击、填写、跳转、等待或断言。
- 所属 `pages/<页面>.page.ts` 只能调用 `UiActions` 和使用定位器资产来编排业务动作、页面跳转与断言；不得直接导入 `target`，不得创建内联元素定位。
- `specs/` 只能表达测试场景和调用 Page Object，禁止直接定位或操作页面。
- 公共层只允许提供 `LocatorTarget`、定位解析、局部容器定位和无平台名称的通用操作。不得创建跨平台业务选择器注册表。
- 平台业务定位器必须与页面同属一个平台目录。SSO 定位器仅归属 `shared/sso/`，门户定位器仅归属 `data-service-portal/`。

## 元素与页面操作

- 页面对象必须使用 `LocatorTarget` 和 `UiActions`，正式用例不得裸写定位器。
- 定位优先级固定为：`data-testid`、角色与名称、标签、占位符、文本、CSS。CSS 仅作为遗留页面兜底，并在页面对象中注明替换计划。
- 只有对应平台的定位器文件可以声明业务元素；对应平台的页面对象可以编排业务操作；公共页面对象只能验证通用认证和可达性。
- 提交或跳转操作必须先注册 `waitForResponse` 或 `waitForURL`，禁止提交固定等待。

## 用例与数据

- 每条用例只验证一个可观察行为，使用 Page Object，且独立造数和清理。
- SSO 和门户登录链路用例使用 Playwright 原始 `page`，以覆盖真实交互式登录；二级平台业务用例必须使用 `shared/sso/fixtures/authenticated.fixture.ts` 的 `authenticatedPage`，该 Fixture 为每条用例创建独立 BrowserContext，并复用已校验的 storageState。
- `framework/services/session-manager.ts` 只管理认证态缓存和 context 生命周期，通过回调接收认证与校验流程，禁止导入 SSO、门户或任一二级平台代码。
- 写入型用例必须从认证 Fixture 注入 `dataScope`，并在每次创建平台资源后立即登记对应的删除或回收动作。`DataScope` 在 teardown 按 LIFO 顺序清理，即使单项失败也会继续处理剩余资源。
- 平台环境准入条件（如 SSO、门户和平台地址配置）必须集中在平台 Fixture 中通过一次 `test.skip` 声明；同一平台的 spec 不得逐条复制环境跳过代码。
- 多资源前置场景采用“API 造数据 + UI 验行为”：平台 `data/` 工厂可复用已认证会话调用本平台 API 创建项目、批次等前置资源，并在 `DataScope` 中按依赖逆序清理；`pages/` 和 `specs/` 必须通过真实 UI 验证用户触发的导航、表单、列表和状态结果。不得使用 API 调用替代被测 UI 动作或断言，从而将 API 造数误写成 API 测试。
- API 数据工程采用严格分层：`api/` 负责从已认证浏览器会话提取本平台访问上下文、封装 HTTP 请求、校验响应和转换 API 数据；`fixtures/` 在共享 SSO Fixture 上注入平台 API 客户端；`data/` 只编排唯一测试数据构造和 `DataScope` 清理登记；`pages/` 只处理 UI 导航、操作和断言。API 客户端不得导入 Page Object、数据工厂或 spec，页面对象不得暴露 API 会话、请求或响应解析方法。
<<<<<<< HEAD
- 只读入口用例不创建业务资源，因此不登记数据清理；机器标注项目创建用例已通过平台数据工厂实现真实 UI 创建，随后由平台 API 客户端查询项目标识并立即登记 `DELETE /api/v1/project/{id}` 清理器。后续创建项目、资源入库等写入型用例必须先提供所属平台的数据工厂与清理器。
=======
- 当前入口 P0 为只读用例，不创建业务资源，因此不登记数据清理；`P0-ANNOTATION-02` 已通过机器标注平台数据工厂实现真实 UI 创建，随后由平台 API 客户端查询项目标识并立即登记 `DELETE /api/v1/project/{id}` 清理器。后续创建项目、资源入库等写入型用例必须先提供所属平台的数据工厂与清理器。
>>>>>>> 5e0e3263e6df14975f2961018d45ca06420f0d83
- 搜索、筛选和删除场景必须同时准备命中和不命中数据，并同时断言“存在”和“不存在”。
- 登录态缓存保存在 `.auth/`，不得提交；账号、密码、令牌只允许出现在忽略的 `.env` 或 CI 密钥中。
- 所有注释、README、架构和平台说明均使用中文；新增平台时必须补充该平台 README。

## 现状与准入

SSO 登录页已完成首轮探索：用户名为 `#username`、密码为 `#password`、提交按钮的可访问名称为“登 录”。这些定位只归属 `shared/sso/`。门户地址为 `/dashboard`；机器标注卡片标题为“机器标注工具”，入口为 `/hawk/project`，以“新建项目”可见作为就绪态；资源管理入口为 `/resource-platform/index`，以“文件夹目录”可见作为就绪态。后续业务用例仍须先按各自平台完成探索，禁止猜测选择器或路径。
