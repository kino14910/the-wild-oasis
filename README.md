# The Wild Oasis — 管理后台

The Wild Oasis 的运营后台：React SPA，通过共享业务 API（Next.js 应用）管理房源、预订与经营数据。

## 功能

- 邮箱密码登录（Supabase Auth），受保护路由 + 管理员角色校验
- 经营看板：销售额、预订数、入住数、入住率、销售趋势图、住宿时长分布、今日动态
- 房源管理：列表、创建、编辑、删除、上下架、图片上传/删除（经 API，服务端校验类型与大小）
- 预订管理：筛选/排序/分页、详情、确认、入住（可加早餐）、退房、取消
- 设置：最少/最多入住晚数、每单最多客人、早餐价格
- 账户：修改姓名与密码
- 中英文切换（i18next）

## 技术栈

React 19 · Vite 7 · TypeScript · React Router 7 · TanStack Query 5 · React Hook Form ·
Recharts · styled-components · i18next · Supabase JS（仅登录与身份）

## 本地启动

```bash
npm install
cp .env.example .env.local   # 填入 Supabase 信息与 API 地址
npm run dev
```

`VITE_API_BASE_URL` 指向托管共享业务 API 的 Next.js 应用（默认 `http://localhost:3000`）。
后台不直连数据库表：所有业务读写都走 API，请求携带 Supabase 访问令牌。

## 环境变量

见 [.env.example](./.env.example)：

| 变量 | 说明 |
| --- | --- |
| `VITE_API_BASE_URL` | 共享业务 API 地址 |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Supabase 公开信息（仅登录/身份） |

## 角色说明

- 新注册账户默认为 `guest`，无法访问管理接口（服务端返回 403）。
- 提升为管理员需在数据库中执行：
  `UPDATE profiles SET role = 'admin' WHERE email = '...';`
- 演示账号可用前台仓库的种子脚本创建（需 `SUPABASE_SERVICE_ROLE_KEY`）。

## 测试与检查

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # Vitest：API Client 封装/鉴权头/分→元转换/错误处理
npm run build       # vite build
```

## 部署

构建为静态资源后可部署到任意静态托管（Vercel / Netlify / 对象存储 + CDN）：

```bash
npm run build   # 输出 dist/
```

- 配置 `VITE_API_BASE_URL` 为生产 API 地址；确认 SPA 路由回退（所有路径返回 index.html）。
- 跨源访问需在 API 侧允许该 Origin；生产环境建议给管理后台单独域名。

## 设计决策

- **保持 React SPA**：按项目约束不迁移到 Next.js。
- **零业务规则**：价格、库存、状态机全部由服务端拥有，后台只发送意图
  （confirm / check_in / check_out / cancel），客户端提交的状态值不被信任。
- **金额单位**：UI 使用元，API Client 在边界处与整数分互转。
