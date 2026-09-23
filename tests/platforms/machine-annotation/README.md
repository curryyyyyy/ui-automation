# 机器标注平台

本目录独占机器标注平台的 API 访问层、Fixture、页面对象、元素定位、数据工厂和业务用例。用例按 `specs/access`、`specs/project`、`specs/batch`、`specs/smoke` 按模块归档，不再按 P0/P1 目录拆分。`locators/` 只声明页面元素，`pages/` 只编排操作与断言。

机器标注平台复用共享认证 Fixture 注入的 `midscene` AI 代理。`specs/smoke/project-ai-observation.spec.ts` 是可选的语义观察示例，只有配置 Midscene 模型后才执行；项目、批次等正式回归仍必须使用本平台 Page Object 的 Playwright 定位和确定性断言。

运行本平台全部用例：`npm run test:machine-annotation`；只运行批次模块：`npx playwright test tests/platforms/machine-annotation/specs/batch`。

`specs/smoke/` 只存放跨模块核心快乐路径。当前项目 Smoke 覆盖新建、编辑提交、查看、关注、我的关注、取消关注和删除。当前页面没有项目删除按钮，删除阶段使用平台 API，随后回到 UI 验证项目已不可见。

已确认入口路径为 `/hawk/project`，页面就绪态为“新建项目”按钮可见。`ACCESS-01` 验证用户从门户卡片进入项目管理页；`PROJECT-01` 至 `PROJECT-08` 覆盖项目创建、查询、关注、详情、表单校验和编辑表单；`BATCH-LIST-01`、`BATCH-FORM-01` 和 `BATCH-FORM-02` 覆盖批次列表持久化、批次表单入口和必填校验。

业务用例使用 `fixtures/machine-annotation.fixture.ts` 提供的 `authenticatedPage` 与 `hawkApiClient`，不得重复填写账号密码。平台环境跳过条件也集中在该 Fixture，平台 spec 不再重复声明 `test.skip`。`api/hawk-api-access.ts` 只从真实浏览器项目列表请求提取本平台 API 会话；`api/hawk-api.client.ts` 只封装 HTTP 请求、响应校验和 API 数据转换；数据工厂只构造测试资源并向 `dataScope` 登记逆序清理。UI 创建项目场景保留 `data/project.factory.ts`；项目详情和批次相关场景采用“API 造数据 + UI 验行为”。UI 仅验证用户真实可见的项目详情与批次列表，避免用 UI 堆叠前置数据造成不稳定。

严格依赖方向为：`Fixture -> authenticatedPage + hawkApiClient`，`data/ -> HawkApiClient + DataScope`，`pages/ -> UiActions + locators`。禁止 API 客户端导入页面对象、数据工厂或用例；禁止页面对象提取 API 鉴权、发送 API 请求或解析 API 响应。

项目详情用例验证用户从项目行“查看”进入详情；批次模块用 API 预置项目和批次后，验证详情列表显示批次、刷新后仍可见，并验证新增批次表单入口和名称/工作流必填校验。详情页直接 URL 访问在当前环境存在加载波动，因此正式用例固定使用列表行“查看”的真实导航路径。

当前环境的工作流候选加载不稳定，尚不将 UI 提交批次纳入批次模块；待提供稳定可用的项目工作流或接口前置后，再扩展“UI 创建批次并刷新验证”场景。该限制不影响 API 批次预置后详情列表的 UI 验证。

项目编辑表单使用 UI 创建的项目作为前置，PROJECT-07 和 Smoke 验证编辑表单字段可见并可取消返回。当前环境已确认编辑保存存在产品缺陷：编辑弹窗中项目名称显示为新值，但提交请求体仍可能携带旧名称；保存持久化待产品修复后单独回归。仅通过 API 创建的项目在当前环境不能稳定回填研发负责人等必填成员，因此不用于编辑表单场景。取消关注由 API 预置已关注项目、UI 打开确认弹窗并确认取消后验证“我的关注”列表，保证用例独立且清理顺序为“取消关注 -> 删除项目”。项目名称筛选为多选控件，连续检索前必须经页面对象重置筛选条件。
项目创建表单的项目名称和研发负责人控件当前采用带替换计划的 CSS 兜底定位：页面虽有标签却未形成可用的可访问性关联，前端补齐后必须替换为标签或测试标识定位；研发负责人候选随环境变化，页面对象通过键盘选择可用首项，不绑定具体账号；提交通过弹窗内“创建项目”按钮定位。后续新增页面元素必须继续写入本目录 `locators/`，页面操作写入 `pages/`，数据生命周期写入 `data/`，禁止将机器标注业务选择器或清理逻辑放入公共层。
