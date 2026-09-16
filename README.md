# AI 数据服务平台 UI 自动化

本工程基于 Playwright，覆盖数据服务平台的 SSO 单点登录、门户和二级平台。基座只承载可复用的定位、操作、认证态和报告能力；机器标注、资源管理等平台的业务资产必须各自隔离。

详细边界见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 初始化

```bash
cd /Users/fish/project/Auto-Test/ui-automation
npm install
npx playwright install chromium
npm run typecheck
npm run test:p0
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

SSO 登录 P0 和门户登录链路直接使用 Playwright `page`，验证真实登录行为。二级平台业务 P0 使用 `tests/shared/sso/fixtures/authenticated.fixture.ts` 的 `authenticatedPage`：每条用例有独立 BrowserContext，优先复用经过访问验证的 `.auth/default.json`，过期时才重走 SSO。

写入型用例还必须注入 `dataScope`。资源创建后立即登记对应清理器，Fixture 在用例结束时按逆序执行清理；当前入口 P0 是只读链路，不创建平台数据。

## 当前状态

SSO、门户、机器标注和资源管理入口均已完成真实页面探索。当前 P0 覆盖：SSO 登录、进入门户、从门户进入机器标注项目管理、从门户进入资源管理资源列表。后续业务 P0 用例按平台目录继续扩展。
