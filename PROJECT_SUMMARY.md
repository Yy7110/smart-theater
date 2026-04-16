# 智慧大剧院 (Smart Theater) 项目状态总结

**日期**: 2026/04/11

---

## 1. 已完成功能

### 1.1 用户端购票流程 (User Purchase Flow)
- `/shows` - 演出列表页，从后端API获取真实数据
- `/show/[id]` - 演出详情页，含场次选择器
- `/show/[id]/seats` - 选座页面，实时锁座/解锁
- `/order/[id]` - 订单支付页，15分钟倒计时
- `/tickets` - 我的票夹，显示票据列表和二维码
- 导航栏用户菜单添加"我的票夹"入口

### 1.2 检票系统 (Inspector System)
- `/admin/inspector` - 检票员专用页面
- 支持扫码检票（模拟）和数字键盘输入
- 检票结果：成功/失败/重复检票
- 后端API: `/api/inspector/verify`

### 1.3 系统管理后台 (Admin Backend)
- `/admin` - 管理员控制台
- `/admin/shows` - 演出CRUD管理
- `/admin/venues` - 场馆管理
- `/admin/orders` - 订单管理
- `/admin/users` - 用户管理
- `/admin/messages` - 留言反馈管理
- `/admin/categories` - 分类管理
- `/admin/home-config` - 首页配置

### 1.4 运营后台关键更新 (Operator Dashboard)

#### 后端API (`OperatorController.java`)
| 功能 | 状态 |
|------|------|
| `GET /api/operator/stats` | 实时统计（演出数/场次数/销量/营收） |
| `GET /api/operator/schedules` | 所有排期列表 |
| `PUT /api/operator/schedules/{id}` | 更新排期 |
| `DELETE /api/operator/schedules/{id}` | 删除排期 |
| `POST /api/operator/schedules/{id}/prices` | 设置票价 |
| `GET /api/operator/seat-maps` | 座位图预览 |
| `GET /api/operator/orders` | 订单列表 |
| `GET /api/operator/messages` | 观众反馈 |
| `PUT /api/operator/messages/{id}/reply` | 回复反馈 |

#### 前端API (`adminApi.ts`)
- `operatorApi` 已添加所有新方法的封装

### 1.5 票据ID生成 (Ticket ID Format)
**修改前**: `TK-yyyyMMdd-{8位UUID}` (含字母和连字符)
**修改后**: `yyyyMMddHHmmss{6位随机数}` (纯数字20位)

适用检票员纯数字键盘输入。

### 1.6 种子数据保护 (Seed Data Protection)
- ID <= 6 的演出为数据库预置数据
- Admin和Operator端均禁止对种子演出进行增删改操作
- 返回错误: "系统预置演出不可修改/删除"

### 1.7 空图片处理
- 修复 `<img src="">` 警告
- 无图片时显示 🎭 占位符

---

## 2. 遗留问题

### 2.1 运营后台前端需完善
**文件**: `src/app/admin/operator/page.tsx`

当前状态:
- 演出CRUD已连接真实API
- 其他模块仍使用硬编码mock数据:
  - 今日演出安排 (硬编码3条)
  - 座位概览 (硬编码60个格子)
  - 月度营收趋势 (硬编码6个月数据)
  - 观众反馈 (硬编码3条)

需要:
1. 添加Tab导航: 控制台/演出排期/座位管理/票务设置/观众反馈
2. 控制台Tab: 连接 `getStats()`, `getSchedules()`, `getOrders()`, `getMessages()`
3. 演出排期Tab: 连接 `getSchedules()`, 支持增删改
4. 座位管理Tab: 连接 `getSeatMaps()`, 可视化座位图
5. 票务设置Tab: 连接 `getOrders()`, 显示订单列表
6. 观众反馈Tab: 连接 `getMessages()`, 支持回复

### 2.2 消息实体缺少字段
**实体**: `ContactMessage.java`
**当前字段**: name, email, subject, message, isRead, reply
**缺少字段**: showId(关联演出), rating(评分), 创建时间在前端显示

### 2.3 座位图数据格式
**当前**: 返回rows数组，每个row含seats数组
**问题**: 需要与前端可视化组件对接确认格式

### 2.4 订单营收统计
**当前**: 从order表直接统计
**问题**: 需要确认是否包含退款/过期订单的过滤

---

## 3. 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16.2.1, React 19, TypeScript, Tailwind CSS, Framer Motion |
| 后端 | Spring Boot 3.2.3, MyBatis Plus, JWT |
| 数据库 | MySQL 8.x |
| 缓存 | Redis (用于锁座/解锁) |
| 其他 | ZXing (二维码), BCrypt (密码加密) |

---

## 4. 关键文件位置

### 前端
- `src/app/admin/operator/page.tsx` - 运营后台主页面
- `src/lib/adminApi.ts` - 管理员/运营者API客户端
- `src/lib/userApi.ts` - 用户端API客户端

### 后端
- `OperatorController.java` - 运营者API端点
- `AdminController.java` - 管理员API端点
- `InspectorController.java` - 检票员API端点
- `OrderServiceImpl.java` - 订单/票据生成逻辑

---

## 5. 数据库种子数据 (ID 1-6)

| ID | 演出名称 | 状态 |
|----|----------|------|
| 1 | 2026郎朗钢琴独奏音乐会 | 受保护 |
| 2 | 周杰伦「嘉年华」世界巡回演唱会 | 受保护 |
| 3 | 《茶馆》经典话剧 | 受保护 |
| 4 | 《天鹅湖》芭蕾舞剧 | 受保护 |
| 5 | 《冰雪奇缘》梦幻冰上秀 | 受保护 |
| 6 | 草间弥生「无限的网」沉浸式艺术展 | 受保护 |

---

## 6. 后续建议

1. **优先级1**: 完成operator/page.tsx的重写，替换所有mock数据
2. **优先级2**: 测试票务ID纯数字格式在检票流程中的端到端流程
3. **优先级3**: 添加数据可视化图表库 (如Recharts) 替代手动画的柱状图
4. **优先级4**: 实现真实的二维码扫描功能 (需要浏览器摄像头API)

