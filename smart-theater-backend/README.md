# 智慧大剧院后端系统 (Smart Theater Backend)

## 技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 3.2.3 | 主框架 |
| MyBatis Plus | 3.5.5 | ORM + CRUD |
| MySQL | 8.x | 主数据库 |
| Redis | 3.x+ | 座位锁 + JWT黑名单 |
| JWT (jjwt) | 0.12.5 | 无状态认证 |
| ZXing | 3.5.3 | 二维码生成 |
| Java | 17+ | 运行环境 |

## 快速开始

### 1. 环境准备

- JDK 17+
- Maven 3.9+
- MySQL 8.x (运行在 localhost:3306)
- Redis (运行在 localhost:6379)

### 2. 数据库初始化

```bash
# 创建数据库和表结构
mysql -uroot -p < src/main/resources/db/schema.sql

# 导入种子数据（3个系统账号 + 6个分类 + 1个场馆 + 6场演出）
mysql -uroot -p --default-character-set=utf8mb4 < src/main/resources/db/data.sql
```

### 3. 配置修改

编辑 `src/main/resources/application.yml`，修改数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/smart_theater?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

### 4. 启动应用

```bash
mvn spring-boot:run
```

应用默认启动在 `http://localhost:8081`

## 系统账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | root | 123456 | 全系统管理 |
| 运营人员 | theater | 123456 | 演出管理 |
| 检票员 | check | 123456 | 票据核销 |
| 观众 | (注册) | (自定义) | 浏览+购票 |

## API 接口

### 认证 `/api/auth`

| Method | Path | 说明 |
|--------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/register | 观众注册 |
| POST | /api/auth/refresh | 刷新Token |
| POST | /api/auth/logout | 登出 |
| GET | /api/auth/me | 当前用户信息 |

### 公开接口 `/api/public` (无需认证)

| Method | Path | 说明 |
|--------|------|------|
| GET | /api/public/shows | 演出列表(分页+分类+搜索) |
| GET | /api/public/shows/{id} | 演出详情 |
| GET | /api/public/shows/{id}/schedules | 演出排期 |
| GET | /api/public/schedule/{id}/seats | 座位图(实时状态) |
| GET | /api/public/home/featured | 首页精选 |
| GET | /api/public/home/upcoming | 即将上演 |
| GET | /api/public/home/stats | 首页统计 |
| GET | /api/public/schedule/calendar | 日历视图 |
| POST | /api/public/contact | 联系表单 |

### 观众 `/api/user` (需AUDIENCE角色)

| Method | Path | 说明 |
|--------|------|------|
| POST | /api/user/seats/lock | 锁定座位(Redis 15分钟) |
| POST | /api/user/seats/unlock | 释放座位 |
| POST | /api/user/orders | 创建订单 |
| POST | /api/user/orders/{id}/pay | 模拟支付 |
| POST | /api/user/orders/{id}/cancel | 取消订单 |
| GET | /api/user/orders | 我的订单 |
| GET | /api/user/orders/{id} | 订单详情 |
| GET | /api/user/tickets | 我的票列表 |
| GET | /api/user/tickets/{ticketNo} | 票据详情 |
| GET | /api/user/tickets/{ticketNo}/qrcode | 二维码图片 |

### 检票员 `/api/inspector` (需INSPECTOR角色)

| Method | Path | 说明 |
|--------|------|------|
| POST | /api/inspector/verify | 核销票据 |
| GET | /api/inspector/verify/history | 核销记录 |
| GET | /api/inspector/verify/today | 今日汇总 |
| GET | /api/inspector/ticket/{ticketNo} | 查询票据 |

### 管理员 `/api/admin` (需ADMIN角色)

演出CRUD、排期管理、座位图配置、分类管理、场馆管理、用户管理、首页配置、订单查看、留言管理等。

### 运营人员 `/api/operator` (需OPERATOR角色)

管理自己创建的演出、排期、图片等。

## 核心业务流程

### 购票流程

```
选座 → 锁定座位(Redis 15min) → 创建订单(PENDING) → 模拟支付(PAID) → 生成票号 → 二维码
```

### 核销流程

```
检票员扫码 → 提取ticket_no → 验证票据状态 → 核销成功/已核销/无效/过期
```

### 订单过期

定时任务每60秒扫描，自动过期未支付订单并释放座位锁。

## 数据库设计 (16张表)

- `sys_user` - 系统用户 (4种角色)
- `category` - 演出分类
- `venue` / `venue_hall` - 场馆/厅室
- `seat_map` / `seat` - 座位图/座位
- `show` - 演出
- `show_schedule` - 排期
- `schedule_seat_price` - 场次票价
- `show_image` / `show_tag` - 演出图片/标签
- `order` / `order_item` - 订单/订单项(票)
- `ticket_verification` - 核销记录
- `home_config` - 首页配置
- `contact_message` - 联系留言

## 项目结构

```
src/main/java/com/smarttheater/
├── SmartTheaterApplication.java
├── common/
│   ├── config/          (CORS, Redis, MyBatisPlus, Jackson)
│   ├── constant/        (RedisKey, OrderStatus, SystemConstants)
│   ├── enums/           (OrderStatus, ShowStatus, TicketStatus, SeatType, UserRole)
│   ├── exception/       (BusinessException, GlobalExceptionHandler)
│   ├── result/          (统一响应Result)
│   └── util/            (JwtUtil, QrCodeUtil, SnowflakeIdUtil)
├── security/            (SecurityConfig, JwtAuthenticationFilter)
├── entity/              (16个实体类 + BaseEntity)
├── mapper/              (16个Mapper接口)
├── dto/                 (请求DTO，按模块分包)
├── vo/                  (响应VO，按模块分包)
├── service/             (Service接口)
│   └── impl/            (Service实现)
└── controller/          (6个Controller)
    ├── AuthController.java
    ├── PublicController.java
    ├── UserController.java
    ├── AdminController.java
    ├── OperatorController.java
    └── InspectorController.java
```

## Redis Key 设计

```
seat:lock:{scheduleId}:{seatId}     → userId       (TTL 900s)
order:expire:{orderNo}              → orderId      (TTL 900s)
jwt:blacklist:{jti}                 → "1"          (TTL = token剩余时间)
home:featured                       → JSON缓存     (TTL 5min)
home:upcoming                       → JSON缓存     (TTL 5min)
home:stats                          → JSON缓存     (TTL 10min)
```

## 安全机制

### JWT 认证
- Access Token: 2小时有效期
- Refresh Token: 7天有效期
- 密码加密: BCrypt
- Token 黑名单: Redis 实现登出

### 权限控制
- 基于角色的访问控制 (RBAC)
- Spring Security + JWT Filter
- 4种角色: ADMIN, OPERATOR, INSPECTOR, AUDIENCE

### 数据安全
- SQL 注入防护: MyBatis Plus 参数化查询
- XSS 防护: 输入验证和输出转义
- CORS 配置: 仅允许前端域名访问

## 关键特性

### 座位锁机制
使用 Redis + Lua 脚本实现原子操作：
- 锁定多个座位时，全部成功或全部失败
- 15分钟自动过期
- 支付成功后自动释放

### 订单过期处理
定时任务 (@Scheduled 60s)：
- 扫描未支付订单
- 超过15分钟自动标记为 EXPIRED
- 释放对应的座位锁

### 二维码生成
使用 ZXing 库：
- 编码内容: ticket_no
- 格式: PNG, 300x300
- 检票员扫码核销

## 演出状态管理

### 状态流转
```
DRAFT (草稿) → ON_SALE (上架) → SOLD_OUT (售罄)
                ↓
            OFF_SHELF (下架)
```

### 状态说明
- **DRAFT**: 草稿，不对外显示
- **ON_SALE**: 上架销售，在演出列表和首页显示
- **OFF_SHELF**: 已下架，不在列表显示，详情页不可访问
- **SOLD_OUT**: 已售罄，显示但不可购买
- **COMING_SOON**: 即将上演
- **EXHIBITING**: 展出中（展览类）

## 开发注意事项

1. **密码加密**: 创建/更新用户时必须使用 `passwordEncoder.encode()`
2. **事务管理**: 涉及多表操作使用 `@Transactional`
3. **异常处理**: 业务异常抛出 `BusinessException`，由全局处理器统一处理
4. **日志记录**: 关键操作记录日志（登录、支付、核销等）
5. **性能优化**: 热点数据使用 Redis 缓存

## 测试

### 单元测试
```bash
mvn test
```

### API 测试
使用 Postman 或 curl 测试各个端点

### 示例请求
```bash
# 登录
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"root","password":"123456"}'

# 获取演出列表
curl http://localhost:8081/api/public/shows?page=1&size=10

# 创建演出（需要 token）
curl -X POST http://localhost:8081/api/admin/shows \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试演出","categoryId":1,"venueId":1}'
```

## 常见问题

**Q: 端口 8081 被占用？**
A: 修改 `application.yml` 中的 `server.port`

**Q: 数据库连接失败？**
A: 检查 MySQL 是否启动，用户名密码是否正确

**Q: Redis 连接失败？**
A: 检查 Redis 是否启动在 6379 端口

**Q: 新用户无法登录？**
A: 确保创建用户时使用了 `passwordEncoder.encode()` 加密密码

## 许可证

MIT

