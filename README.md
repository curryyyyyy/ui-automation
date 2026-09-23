# AI 数据服务平台 UI 自动化

本工程基于 Playwright，覆盖数据服务平台的 SSO 单点登录、门户和二级平台。基座只承载可复用的定位、操作、认证态和报告能力；机器标注、资源管理等平台的业务资产必须各自隔离。

详细边界见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 初始化

```bash
cd /Users/fish/project/Auto-Test/ui-automation
npm install
npx playwright install chromium
npm run typecheck
npm test
```

测试环境地址和账号仅保存在忽略的 `.env` 中，CI 使用密钥注入。`.auth/` 保存浏览器认证态，也不得提交。

## 目录

```text
tests/framework/                   # 跨平台底座
tests/shared/sso/                  # 单点登录
tests/platforms/data-service-portal/ # locators、pages、specs
tests/platforms/machine-annotation/  # locators、pages、specs
tests/platforms/resource-management/ # locators、pages、specs
```

采用严格解耦：`locators/` 只声明页面元素；`pages/` 只组合定位器并编排页面操作和断言；`specs/` 只表达测试场景。业务定位器按 SSO、门户、机器标注和资源管理隔离，禁止建立跨平台选择器库。页面操作统一经 `UiActions` 执行点击、填充、键盘、上传、选择、勾选和响应等待。定位应优先采用 `data-testid`，禁止依赖不稳定的样式类名。

## 夹具与数据隔离

SSO 登录和门户登录链路直接使用 Playwright `page`，验证真实登录行为。二级平台业务用例使用 `tests/shared/sso/fixtures/authenticated.fixture.ts` 的 `authenticatedPage`：每条用例有独立 BrowserContext，优先复用经过访问验证的 `.auth/default.json`，过期时才重走 SSO。

写入型用例还必须注入 `dataScope`。资源创建后立即登记对应清理器，Fixture 在用例结束时按逆序执行清理。跨多个前置资源的场景采用“API 造数据 + UI 验行为”：平台数据工厂通过已认证会话调用本平台 API 造数，Page Object 只验证用户经 UI 可见的业务结果。

机器标注等需要 API 前置的平台，在各自平台目录内以 `api/`、`fixtures/`、`data/` 分层：`api/` 管理会话提取、请求和响应解析，`fixtures/` 提供平台 API 客户端，`data/` 管理数据构造和清理；页面对象不处理 API 会话或 HTTP 请求。

## Playwright 与 Midscene 协作

本工程将 Playwright 作为确定性执行底座，将 Midscene 作为可选的 AI 语义能力层。两者职责固定如下：

- Playwright 负责页面生命周期、稳定 Locator、表单输入、网络等待、数据隔离和最终断言；P0、Smoke 的核心结果不得只由 AI 判断。
- Midscene 负责页面探索、视觉或语义定位兜底、复杂页面状态的辅助观察，以及尚未沉淀为稳定 Locator 的临时验证。
- Midscene 只能通过 `tests/framework/midscene/midscene-agent.ts` 和认证 Fixture 使用，业务 Page Object 不得直接导入 `@midscene/web`。
- AI 能力默认关闭。只有同时设置 `MIDSCENE_ENABLED=true` 和 `MIDSCENE_MODEL_API_KEY` 时，Fixture 才创建 Agent；未配置时普通 Playwright 用例不受影响。
- AI 操作成功后，必须用 Playwright Locator 或 URL/接口响应补充确定性验证；AI 失败应保留截图、Trace 和 Midscene 运行产物，不得通过调大重试掩盖问题。

运行可选的 Midscene 语义观察用例：

```bash
MIDSCENE_ENABLED=true MIDSCENE_MODEL_API_KEY=xxx npm run test:midscene
```

Midscene 的模型地址、模型名和缓存/报告目录按所安装版本的环境变量约定配置，真实 Key 只放在本地 `.env` 或 CI Secret，不提交到仓库。

## 当前状态

SSO、门户、机器标注和资源管理入口均已完成真实页面探索。当前覆盖：SSO 登录、进入门户、机器标注平台项目管理、项目详情、项目关注、API 预置批次后详情列表验证、新增批次表单入口和必填校验、资源管理资源列表入口。机器标注平台用例按 `specs/access`、`specs/project`、`specs/batch` 模块目录维护，后续新增用例继续按业务模块归档。
