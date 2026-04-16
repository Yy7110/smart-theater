# 智慧大剧院 (Smart Theater)

一个基于 **Next.js 16 + React 19 + Spring Boot 3** 构建的现代化剧院票务管理系统。支持观众在线选座购票、运营人员后台管理、检票员扫码核销等完整业务流程。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Next.js 16.2, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion, Three.js, Zustand |
| **后端** | Spring Boot 3.2.3, Java 17, MyBatis Plus, JWT, ZXing |
| **数据库** | MySQL 8.x |
| **缓存** | Redis (座位锁、JWT 黑名单、首页数据缓存) |

---

## 功能特性

### 观众端
- 首页展示：精选演出、即将上演、剧院统计数据、3D 粒子动效
- 演出列表：分类筛选、关键词搜索、真实后端数据
- 演出详情：演出信息、可选排期、场次选择
- 在线选座：实时座位状态、Redis 15分钟锁座
- 订单支付：15分钟支付倒计时、模拟支付流程
- 我的票夹：已购演出票列表、20位纯数字票号、二维码凭证

### 管理后台
- **管理员 (ADMIN)**：演出 CRUD、分类管理、场馆管理、用户管理、订单管理、首页配置、留言反馈管理
- **运营人员 (OPERATOR)**：演出排期管理、票价设置、座位图预览、销售统计、观众反馈回复
- **检票员 (INSPECTOR)**：扫码/手动输入检票、检票结果实时反馈、核销记录查询

---

## 项目结构

```
.
├── smart-theater/                 # 前端 (Next.js)
│   ├── src/app/                   # Next.js App Router
│   │   ├── page.tsx               # 首页
│   │   ├── shows/                 # 演出列表
│   │   ├── show/[id]/             # 演出详情
│   │   ├── show/[id]/seats/       # 在线选座
│   │   ├── order/[id]/            # 订单支付
│   │   ├── tickets/               # 我的票夹
│   │   └── admin/                 # 管理后台
│   ├── src/components/            # 公共组件
│   ├── src/lib/                   # API 封装、状态管理
│   └── screenshots/               # 页面截图
│
├── smart-theater-backend/         # 后端 (Spring Boot)
│   ├── src/main/java/.../controller/    # REST API
│   ├── src/main/java/.../service/       # 业务逻辑
│   ├── src/main/java/.../entity/        # 数据实体 (16张表)
│   ├── src/main/java/.../mapper/        # MyBatis Plus Mapper
│   ├── src/main/java/.../security/      # JWT + Spring Security
│   └── src/main/resources/db/           # 数据库脚本
│
└── PROJECT_SUMMARY.md             # 项目状态总结
```

---

## 快速开始

### 环境要求

- **Node.js** 18+
- **JDK** 17+
- **Maven** 3.9+
- **MySQL** 8.x
- **Redis** 3.x+

### 1. 数据库初始化

```bash
cd smart-theater-backend

# 创建数据库和表结构
mysql -uroot -p < src/main/resources/db/schema.sql

# 导入种子数据（系统账号 + 6个分类 + 1个场馆 + 6场受保护演出）
mysql -uroot -p --default-character-set=utf8mb4 < src/main/resources/db/data.sql
```

### 2. 启动后端

编辑 `smart-theater-backend/src/main/resources/application.yml` 修改数据库密码：

```yaml
spring:
  datasource:
    password: your_password
```

启动应用：

```bash
cd smart-theater-backend
mvn spring-boot:run
```

后端默认运行在 `http://localhost:8070`

### 3. 启动前端

```bash
cd smart-theater
npm install
npm run dev
```

前端运行在 `http://localhost:3000`

---

## 系统账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | `root` | `123456` | 全系统管理 |
| 运营人员 | `theater` | `123456` | 演出排期、票务设置 |
| 检票员 | `check` | `123456` | 扫码检票、查看记录 |
| 观众 | (注册) | (自定义) | 浏览、选座、购票 |

> 后台登录入口：`http://localhost:3000/admin/login`

---

## 核心业务流程

### 购票流程
```
选座 → Redis 锁定座位(15分钟) → 创建订单(PENDING)
  → 模拟支付(PAID) → 生成 20 位纯数字票号 → 二维码凭证
```

### 检票流程
```
检票员扫码/手动输入 → 提取 ticket_no → 验证票据状态
  → 核销成功 / 已核销 / 无效 / 过期
```

### 订单过期处理
后端定时任务每 60 秒扫描一次，自动将超 15 分钟未支付的订单标记为 `EXPIRED`，并释放对应座位锁。

---

## API 接口概览

| 模块 | 基础路径 | 说明 |
|------|----------|------|
| 认证 | `/api/auth/*` | 登录、注册、刷新 Token、登出 |
| 公开接口 | `/api/public/*` | 演出列表、详情、排期、座位图、首页数据 |
| 观众 | `/api/user/*` | 锁座、解锁、创建订单、支付、我的票夹 |
| 管理员 | `/api/admin/*` | 演出/分类/场馆/用户/订单/留言管理 |
| 运营人员 | `/api/operator/*` | 统计报表、排期管理、票价设置、反馈回复 |
| 检票员 | `/api/inspector/*` | 票据核销、核销记录 |

---

## 安全机制

- **JWT 认证**：Access Token 2 小时有效期，Refresh Token 7 天
- **RBAC 权限控制**：4 种角色 (ADMIN / OPERATOR / INSPECTOR / AUDIENCE)
- **密码加密**：BCrypt
- **Token 黑名单**：Redis 实现安全登出
- **SQL 注入防护**：MyBatis Plus 参数化查询

---

## 设计亮点

- **深色沉浸式主题**：背景 `#0A0A0F`，紫色主调 `#6C2BD9`，配合玻璃态效果
- **3D 动效**：Three.js 粒子场、Framer Motion 页面过渡
- **响应式布局**：适配桌面端、平板、移动端
- **Redis 原子锁座**：Lua 脚本保证多座位锁定的一致性

---

## 页面截图

项目截图保存在 `smart-theater/screenshots/` 目录下：
- 首页 Hero 区域
- 精选演出
- 演出列表
- 演出详情
- 场馆介绍
- 演出日历
- 关于我们
- 联系表单

---

## 开发注意事项

1. **种子数据保护**：数据库中 ID `1-6` 的演出为系统预置数据，Admin 和 Operator 端禁止对其进行修改或删除。
2. **空图片处理**：当演出无封面图时，前端会显示默认的 `🎭` 占位符。
3. **票价设置**：运营人员在创建排期后，需要单独为该排期设置不同座位区域的票价。
4. **二维码内容**：编码为 `ticket_no`，检票时直接解析该值进行核销。

---

## 许可证

MIT
