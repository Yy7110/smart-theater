# 智慧大剧院 - 前端项目

基于 Next.js 的现代化剧院票务系统前端应用。

## 技术栈

- **框架**: Next.js 16.2.1 (App Router)
- **UI**: React 19, TypeScript 5
- **样式**: Tailwind CSS v4 (@theme)
- **动画**: Framer Motion 12
- **状态管理**: Zustand 5
- **图标**: Lucide React

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 配置后端地址
编辑 `src/lib/api.ts`，确保 API_BASE 指向后端服务：
```typescript
const API_BASE = 'http://localhost:8081';
```

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000

### 构建生产版本
```bash
npm run build
npm start
```

## 页面结构

### 观众端
| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 精选演出、即将上演、统计数据 |
| `/shows` | 演出列表 | 分类筛选、搜索（已对接后端API） |
| `/show/[id]` | 演出详情 | 演出信息、排期、座位选择 |
| `/schedule` | 演出日历 | 按月查看演出排期 |
| `/venue` | 场馆介绍 | 场馆信息、厅室展示 |
| `/about` | 关于我们 | 剧院介绍 |
| `/contact` | 联系我们 | 联系表单 |
| `/login` | 观众登录 | 密码/短信/扫码登录 |
| `/register` | 观众注册 | 用户注册 |

### 管理后台
| 路由 | 页面 | 角色权限 |
|------|------|----------|
| `/admin/login` | 后台登录 | ADMIN/OPERATOR/INSPECTOR |
| `/admin` | 仪表盘 | ADMIN |
| `/admin/shows` | 演出管理 | ADMIN |
| `/admin/categories` | 分类管理 | ADMIN |
| `/admin/venues` | 场馆管理 | ADMIN |
| `/admin/users` | 用户管理 | ADMIN |
| `/admin/orders` | 订单管理 | ADMIN |
| `/admin/operator` | 运营人员工作台 | OPERATOR |
| `/admin/inspector` | 检票员工作台 | INSPECTOR |

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式 (Tailwind v4)
│   ├── shows/              # 演出列表
│   ├── show/[id]/          # 演出详情
│   ├── schedule/           # 演出日历
│   ├── venue/              # 场馆介绍
│   ├── about/              # 关于我们
│   ├── contact/            # 联系我们
│   ├── login/              # 观众登录
│   ├── register/           # 观众注册
│   └── admin/              # 管理后台
│       ├── login/          # 后台登录
│       ├── layout.tsx      # 后台布局
│       ├── page.tsx        # 仪表盘
│       ├── shows/          # 演出管理
│       ├── categories/     # 分类管理
│       ├── venues/         # 场馆管理
│       ├── users/          # 用户管理
│       ├── orders/         # 订单管理
│       ├── operator/       # 运营人员工作台
│       └── inspector/      # 检票员工作台
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # 导航栏
│   │   ├── Footer.tsx      # 页脚
│   │   ├── ClientLayout.tsx
│   │   └── PageTransition.tsx
│   └── ui/
│       └── GlowCard.tsx    # 发光卡片组件
└── lib/
    ├── api.ts              # API 请求封装
    ├── authStore.ts        # 认证状态管理 (Zustand)
    └── adminApi.ts         # 管理端 API
```

## 功能模块

### 观众端功能
- 首页展示（精选演出、即将上演、统计数据）
- 演出列表（分类筛选、关键词搜索、实时数据）
- 演出详情（演出信息、排期、座位图）
- 演出日历（按月份查看）
- 用户认证（登录、注册）
- 订单管理（购票、查看订单）

### 管理后台功能

**管理员 (ADMIN)**
- 演出 CRUD（创建、编辑、删除、上下架）
- 分类管理
- 场馆管理
- 用户管理（创建、编辑、启用/禁用）
- 订单查看
- 数据统计

**运营人员 (OPERATOR)**
- 管理自己的演出
- 查看销售统计

**检票员 (INSPECTOR)**
- 扫码核销票据
- 查看核销记录

## 设计特点

- **深色主题**: 使用 CSS 变量定义的现代深色主题
  - 背景色: `#0A0A0F`
  - 主色调: `#6C2BD9` (紫色)
  - 强调色: `#F43F5E` (粉红)
  - 辅助色: `#06B6D4` (青色)
- **流畅动画**: Framer Motion 实现页面过渡和交互动画
- **响应式设计**: 适配桌面、平板、移动端
- **玻璃态效果**: 半透明背景 + 模糊效果
- **发光效果**: 卡片悬停时的光晕效果

## 认证流程

1. 用户登录获取 JWT token (有效期 2 小时)
2. Token 存储在 localStorage
3. 请求时自动添加 `Authorization: Bearer {token}` header
4. Token 过期自动跳转登录页
5. 支持刷新 token (有效期 7 天)

## API 集成

所有 API 请求通过 `apiRequest` 函数统一处理：

```typescript
import { apiRequest } from '@/lib/api';

// 公开接口（无需认证）
const shows = await apiRequest<any>('/api/public/shows?page=1&size=12');

// 需要认证的请求
const orders = await apiRequest<any>('/api/user/orders', { token });
```

### 主要 API 端点

**公开接口**
- `GET /api/public/shows` - 演出列表
- `GET /api/public/shows/{id}` - 演出详情
- `GET /api/public/categories` - 分类列表
- `GET /api/public/home/featured` - 首页精选
- `POST /api/public/contact` - 提交联系表单

**认证接口**
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/me` - 当前用户信息

**用户接口**
- `POST /api/user/orders` - 创建订单
- `GET /api/user/orders` - 我的订单

**管理接口**
- `GET /api/admin/shows` - 演出列表
- `POST /api/admin/shows` - 创建演出
- `PUT /api/admin/shows/{id}` - 更新演出
- `DELETE /api/admin/shows/{id}` - 删除演出
- `PUT /api/admin/shows/{id}/status` - 更新演出状态

## 测试账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | root | 123456 | 全系统管理 |
| 运营人员 | theater | 123456 | 演出管理 |
| 检票员 | check | 123456 | 票据核销 |

## 开发注意事项

1. **React Hooks 规则**: 所有 Hooks 必须在条件判断之前调用
2. **性能优化**: 使用 `lazy loading` 加载图片
3. **错误处理**: API 错误统一捕获并显示友好提示
4. **状态管理**: 使用 Zustand 管理全局认证状态
5. **类型安全**: 充分利用 TypeScript 类型检查

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

