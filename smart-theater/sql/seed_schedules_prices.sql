-- ============================================================
-- 智慧大剧院 - 种子数据：场次 + 票档
-- 为 ID 1-6 的预置演出生成场次和票档信息
-- 表: show_schedule, schedule_seat_price
-- ============================================================

-- 禁用外键检查（避免外键约束冲突）
SET FOREIGN_KEY_CHECKS = 0;

-- 清理旧数据（直接删除，外键检查已禁用）
DELETE FROM schedule_seat_price;
DELETE FROM show_schedule WHERE show_id BETWEEN 1 AND 6;

-- ============================================================
-- 1. 2026郎朗钢琴独奏音乐会 (show_id=1)
-- ============================================================
INSERT INTO show_schedule (id, show_id, show_date, show_time, end_time, status, total_tickets, sold_tickets, deleted, create_time, update_time) VALUES
(101, 1, '2026-05-10', '19:30:00', '21:30:00', 'ON_SALE', 800, 0, 0, NOW(), NOW()),
(102, 1, '2026-05-11', '14:30:00', '16:30:00', 'ON_SALE', 800, 0, 0, NOW(), NOW()),
(103, 1, '2026-05-11', '19:30:00', '21:30:00', 'ON_SALE', 800, 0, 0, NOW(), NOW());

INSERT INTO schedule_seat_price (schedule_id, seat_type, price, deleted, create_time, update_time) VALUES
(101, 'VIP区', 1680, 0, NOW(), NOW()), (101, 'A区', 1280, 0, NOW(), NOW()), (101, 'B区', 880, 0, NOW(), NOW()), (101, 'C区', 480, 0, NOW(), NOW()),
(102, 'VIP区', 1680, 0, NOW(), NOW()), (102, 'A区', 1280, 0, NOW(), NOW()), (102, 'B区', 880, 0, NOW(), NOW()), (102, 'C区', 480, 0, NOW(), NOW()),
(103, 'VIP区', 1680, 0, NOW(), NOW()), (103, 'A区', 1280, 0, NOW(), NOW()), (103, 'B区', 880, 0, NOW(), NOW()), (103, 'C区', 480, 0, NOW(), NOW());

-- ============================================================
-- 2. 周杰伦「嘉年华」世界巡回演唱会 (show_id=2)
-- ============================================================
INSERT INTO show_schedule (id, show_id, show_date, show_time, end_time, status, total_tickets, sold_tickets, deleted, create_time, update_time) VALUES
(201, 2, '2026-05-01', '19:00:00', '22:00:00', 'SOLD_OUT', 5000, 5000, 0, NOW(), NOW()),
(202, 2, '2026-05-02', '19:00:00', '22:00:00', 'SOLD_OUT', 5000, 5000, 0, NOW(), NOW()),
(203, 2, '2026-05-03', '19:00:00', '22:00:00', 'ON_SALE', 5000, 4880, 0, NOW(), NOW());

INSERT INTO schedule_seat_price (schedule_id, seat_type, price, deleted, create_time, update_time) VALUES
(201, '内场VIP', 2880, 0, NOW(), NOW()), (201, '内场', 1880, 0, NOW(), NOW()), (201, '看台A', 1280, 0, NOW(), NOW()), (201, '看台B', 880, 0, NOW(), NOW()), (201, '看台C', 480, 0, NOW(), NOW()),
(202, '内场VIP', 2880, 0, NOW(), NOW()), (202, '内场', 1880, 0, NOW(), NOW()), (202, '看台A', 1280, 0, NOW(), NOW()), (202, '看台B', 880, 0, NOW(), NOW()), (202, '看台C', 480, 0, NOW(), NOW()),
(203, '内场VIP', 2880, 0, NOW(), NOW()), (203, '内场', 1880, 0, NOW(), NOW()), (203, '看台A', 1280, 0, NOW(), NOW()), (203, '看台B', 880, 0, NOW(), NOW()), (203, '看台C', 480, 0, NOW(), NOW());

-- ============================================================
-- 3. 《茶馆》经典话剧 (show_id=3)
-- ============================================================
INSERT INTO show_schedule (id, show_id, show_date, show_time, end_time, status, total_tickets, sold_tickets, deleted, create_time, update_time) VALUES
(301, 3, '2026-05-16', '19:30:00', '22:00:00', 'ON_SALE', 500, 0, 0, NOW(), NOW()),
(302, 3, '2026-05-17', '14:30:00', '17:00:00', 'ON_SALE', 500, 0, 0, NOW(), NOW()),
(303, 3, '2026-05-17', '19:30:00', '22:00:00', 'ON_SALE', 500, 0, 0, NOW(), NOW()),
(304, 3, '2026-05-18', '14:30:00', '17:00:00', 'ON_SALE', 500, 0, 0, NOW(), NOW());

INSERT INTO schedule_seat_price (schedule_id, seat_type, price, deleted, create_time, update_time) VALUES
(301, 'VIP区', 980, 0, NOW(), NOW()), (301, 'A区', 680, 0, NOW(), NOW()), (301, 'B区', 380, 0, NOW(), NOW()), (301, 'C区', 180, 0, NOW(), NOW()),
(302, 'VIP区', 980, 0, NOW(), NOW()), (302, 'A区', 680, 0, NOW(), NOW()), (302, 'B区', 380, 0, NOW(), NOW()), (302, 'C区', 180, 0, NOW(), NOW()),
(303, 'VIP区', 980, 0, NOW(), NOW()), (303, 'A区', 680, 0, NOW(), NOW()), (303, 'B区', 380, 0, NOW(), NOW()), (303, 'C区', 180, 0, NOW(), NOW()),
(304, 'VIP区', 980, 0, NOW(), NOW()), (304, 'A区', 680, 0, NOW(), NOW()), (304, 'B区', 380, 0, NOW(), NOW()), (304, 'C区', 180, 0, NOW(), NOW());

-- ============================================================
-- 4. 《天鹅湖》芭蕾舞剧 (show_id=4)
-- ============================================================
INSERT INTO show_schedule (id, show_id, show_date, show_time, end_time, status, total_tickets, sold_tickets, deleted, create_time, update_time) VALUES
(401, 4, '2026-05-23', '19:30:00', '21:30:00', 'ON_SALE', 600, 0, 0, NOW(), NOW()),
(402, 4, '2026-05-24', '14:30:00', '16:30:00', 'ON_SALE', 600, 0, 0, NOW(), NOW()),
(403, 4, '2026-05-24', '19:30:00', '21:30:00', 'ON_SALE', 600, 0, 0, NOW(), NOW());

INSERT INTO schedule_seat_price (schedule_id, seat_type, price, deleted, create_time, update_time) VALUES
(401, 'VIP区', 1580, 0, NOW(), NOW()), (401, 'A区', 1080, 0, NOW(), NOW()), (401, 'B区', 680, 0, NOW(), NOW()), (401, 'C区', 380, 0, NOW(), NOW()),
(402, 'VIP区', 1580, 0, NOW(), NOW()), (402, 'A区', 1080, 0, NOW(), NOW()), (402, 'B区', 680, 0, NOW(), NOW()), (402, 'C区', 380, 0, NOW(), NOW()),
(403, 'VIP区', 1580, 0, NOW(), NOW()), (403, 'A区', 1080, 0, NOW(), NOW()), (403, 'B区', 680, 0, NOW(), NOW()), (403, 'C区', 380, 0, NOW(), NOW());

-- ============================================================
-- 5. 《冰雪奇缘》梦幻冰上秀 (show_id=5)
-- ============================================================
INSERT INTO show_schedule (id, show_id, show_date, show_time, end_time, status, total_tickets, sold_tickets, deleted, create_time, update_time) VALUES
(501, 5, '2026-06-01', '10:30:00', '12:00:00', 'ON_SALE', 400, 0, 0, NOW(), NOW()),
(502, 5, '2026-06-01', '14:30:00', '16:00:00', 'ON_SALE', 400, 0, 0, NOW(), NOW()),
(503, 5, '2026-06-01', '19:00:00', '20:30:00', 'ON_SALE', 400, 0, 0, NOW(), NOW()),
(504, 5, '2026-06-02', '10:30:00', '12:00:00', 'ON_SALE', 400, 0, 0, NOW(), NOW()),
(505, 5, '2026-06-02', '14:30:00', '16:00:00', 'ON_SALE', 400, 0, 0, NOW(), NOW());

INSERT INTO schedule_seat_price (schedule_id, seat_type, price, deleted, create_time, update_time) VALUES
(501, 'VIP区', 580, 0, NOW(), NOW()), (501, 'A区', 380, 0, NOW(), NOW()), (501, 'B区', 280, 0, NOW(), NOW()), (501, 'C区', 160, 0, NOW(), NOW()),
(502, 'VIP区', 580, 0, NOW(), NOW()), (502, 'A区', 380, 0, NOW(), NOW()), (502, 'B区', 280, 0, NOW(), NOW()), (502, 'C区', 160, 0, NOW(), NOW()),
(503, 'VIP区', 580, 0, NOW(), NOW()), (503, 'A区', 380, 0, NOW(), NOW()), (503, 'B区', 280, 0, NOW(), NOW()), (503, 'C区', 160, 0, NOW(), NOW()),
(504, 'VIP区', 580, 0, NOW(), NOW()), (504, 'A区', 380, 0, NOW(), NOW()), (504, 'B区', 280, 0, NOW(), NOW()), (504, 'C区', 160, 0, NOW(), NOW()),
(505, 'VIP区', 580, 0, NOW(), NOW()), (505, 'A区', 380, 0, NOW(), NOW()), (505, 'B区', 280, 0, NOW(), NOW()), (505, 'C区', 160, 0, NOW(), NOW());

-- ============================================================
-- 6. 草间弥生「无限的网」沉浸式艺术展 (show_id=6)
-- ============================================================
INSERT INTO show_schedule (id, show_id, show_date, show_time, end_time, status, total_tickets, sold_tickets, deleted, create_time, update_time) VALUES
(601, 6, '2026-04-15', '10:00:00', '18:00:00', 'ON_SALE', 200, 0, 0, NOW(), NOW()),
(602, 6, '2026-04-16', '10:00:00', '18:00:00', 'ON_SALE', 200, 0, 0, NOW(), NOW()),
(603, 6, '2026-04-17', '10:00:00', '18:00:00', 'ON_SALE', 200, 0, 0, NOW(), NOW()),
(604, 6, '2026-04-18', '10:00:00', '18:00:00', 'ON_SALE', 200, 0, 0, NOW(), NOW()),
(605, 6, '2026-04-19', '10:00:00', '18:00:00', 'ON_SALE', 200, 0, 0, NOW(), NOW()),
(606, 6, '2026-04-20', '10:00:00', '18:00:00', 'ON_SALE', 200, 0, 0, NOW(), NOW());

INSERT INTO schedule_seat_price (schedule_id, seat_type, price, deleted, create_time, update_time) VALUES
(601, 'VIP早鸟票', 268, 0, NOW(), NOW()), (601, '全日票', 198, 0, NOW(), NOW()), (601, '学生票', 128, 0, NOW(), NOW()),
(602, 'VIP早鸟票', 268, 0, NOW(), NOW()), (602, '全日票', 198, 0, NOW(), NOW()), (602, '学生票', 128, 0, NOW(), NOW()),
(603, 'VIP早鸟票', 268, 0, NOW(), NOW()), (603, '全日票', 198, 0, NOW(), NOW()), (603, '学生票', 128, 0, NOW(), NOW()),
(604, 'VIP早鸟票', 268, 0, NOW(), NOW()), (604, '全日票', 198, 0, NOW(), NOW()), (604, '学生票', 128, 0, NOW(), NOW()),
(605, 'VIP早鸟票', 268, 0, NOW(), NOW()), (605, '全日票', 198, 0, NOW(), NOW()), (605, '学生票', 128, 0, NOW(), NOW()),
(606, 'VIP早鸟票', 268, 0, NOW(), NOW()), (606, '全日票', 198, 0, NOW(), NOW()), (606, '学生票', 128, 0, NOW(), NOW());

-- ============================================================
-- 更新演出表的价格范围和状态
-- ============================================================
UPDATE `show` SET min_price = 480,  max_price = 1680, status = 'ON_SALE' WHERE id = 1;
UPDATE `show` SET min_price = 480,  max_price = 2880, status = 'ON_SALE' WHERE id = 2;
UPDATE `show` SET min_price = 180,  max_price = 980,  status = 'ON_SALE' WHERE id = 3;
UPDATE `show` SET min_price = 380,  max_price = 1580, status = 'ON_SALE' WHERE id = 4;
UPDATE `show` SET min_price = 160,  max_price = 580,  status = 'ON_SALE' WHERE id = 5;
UPDATE `show` SET min_price = 128,  max_price = 268,  status = 'ON_SALE' WHERE id = 6;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;
