-- Fix: Add schedules and prices for shows that don't have any
-- Run this manually: mysql -u root -proot123 smart_theater < fix-missing-schedules.sql

USE `smart_theater`;

-- Insert 2 schedules for each show that has no schedules
-- Uses seat_map_id=1 (主剧场标准座位图, 255 seats)
INSERT INTO `show_schedule` (`show_id`, `seat_map_id`, `show_date`, `show_time`, `end_time`, `status`, `total_tickets`, `sold_tickets`)
SELECT s.id, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), '19:30:00', '21:30:00', 'ON_SALE', 255, 0
FROM `show` s
WHERE s.deleted = 0
  AND NOT EXISTS (SELECT 1 FROM `show_schedule` sc WHERE sc.show_id = s.id AND sc.deleted = 0);

INSERT INTO `show_schedule` (`show_id`, `seat_map_id`, `show_date`, `show_time`, `end_time`, `status`, `total_tickets`, `sold_tickets`)
SELECT s.id, 1, DATE_ADD(CURDATE(), INTERVAL 14 DAY), '14:30:00', '16:30:00', 'ON_SALE', 255, 0
FROM `show` s
WHERE s.deleted = 0
  AND (SELECT COUNT(*) FROM `show_schedule` sc WHERE sc.show_id = s.id AND sc.deleted = 0) < 2;

-- Insert 3 price tiers for each schedule that has no prices
INSERT INTO `schedule_seat_price` (`schedule_id`, `seat_type`, `price`)
SELECT sc.id, 'VIP', COALESCE(s.max_price, 500)
FROM `show_schedule` sc
JOIN `show` s ON s.id = sc.show_id
WHERE NOT EXISTS (SELECT 1 FROM `schedule_seat_price` p WHERE p.schedule_id = sc.id AND p.deleted = 0);

INSERT INTO `schedule_seat_price` (`schedule_id`, `seat_type`, `price`)
SELECT sc.id, 'STANDARD', ROUND((COALESCE(s.min_price, 100) + COALESCE(s.max_price, 500)) / 2)
FROM `show_schedule` sc
JOIN `show` s ON s.id = sc.show_id
WHERE NOT EXISTS (SELECT 1 FROM `schedule_seat_price` p WHERE p.schedule_id = sc.id AND p.seat_type = 'STANDARD' AND p.deleted = 0);

INSERT INTO `schedule_seat_price` (`schedule_id`, `seat_type`, `price`)
SELECT sc.id, 'ECONOMY', COALESCE(s.min_price, 100)
FROM `show_schedule` sc
JOIN `show` s ON s.id = sc.show_id
WHERE NOT EXISTS (SELECT 1 FROM `schedule_seat_price` p WHERE p.schedule_id = sc.id AND p.seat_type = 'ECONOMY' AND p.deleted = 0);
