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

## 当前状态

SSO、门户、机器标注和资源管理入口均已完成真实页面探索。当前覆盖：SSO 登录、进入门户、机器标注平台项目管理、项目详情、项目关注、API 预置批次后详情列表验证、新增批次表单入口和必填校验、资源管理资源列表入口。机器标注平台用例按 `specs/access`、`specs/project`、`specs/batch` 模块目录维护，后续新增用例继续按业务模块归档。
