-- ============================================================
-- Smart Theater Database Schema
-- MySQL 8.x DDL Script
-- ============================================================

CREATE DATABASE IF NOT EXISTS `smart_theater` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `smart_theater`;

-- ============================================================
-- 1. sys_user - System users (admin, operators, inspectors, audience)
-- ============================================================
-- Drop in reverse dependency order
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `contact_message`;
DROP TABLE IF EXISTS `home_config`;
DROP TABLE IF EXISTS `ticket_verification`;
DROP TABLE IF EXISTS `order_item`;
DROP TABLE IF EXISTS `order`;
DROP TABLE IF EXISTS `show_tag`;
DROP TABLE IF EXISTS `show_image`;
DROP TABLE IF EXISTS `schedule_seat_price`;
DROP TABLE IF EXISTS `show_schedule`;
DROP TABLE IF EXISTS `show`;
DROP TABLE IF EXISTS `seat`;
DROP TABLE IF EXISTS `seat_map`;
DROP TABLE IF EXISTS `venue_hall`;
DROP TABLE IF EXISTS `venue`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `sys_user`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `sys_user` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `username`    VARCHAR(50)  NOT NULL,
    `password`    VARCHAR(255) NOT NULL,
    `nickname`    VARCHAR(100)  DEFAULT NULL,
    `phone`       VARCHAR(20)   DEFAULT NULL,
    `email`       VARCHAR(100)  DEFAULT NULL,
    `avatar`      VARCHAR(500)  DEFAULT NULL,
    `role`        VARCHAR(20)  NOT NULL DEFAULT 'AUDIENCE',
    `status`      TINYINT      NOT NULL DEFAULT 1,
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`     TINYINT      DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    INDEX `idx_role` (`role`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System users';

-- ============================================================
-- 2. category - Show categories
-- ============================================================
CREATE TABLE `category` (
    `id`          BIGINT      NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(50) NOT NULL,
    `icon`        VARCHAR(10)  DEFAULT NULL,
    `sort_order`  INT          DEFAULT 0,
    `status`      TINYINT      DEFAULT 1,
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`     TINYINT      DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`),
    INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Show categories';

-- ============================================================
-- 3. venue - Performance venues
-- ============================================================
CREATE TABLE `venue` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(200) NOT NULL,
    `city`        VARCHAR(50)  NOT NULL,
    `address`     VARCHAR(500)  DEFAULT NULL,
    `description` TEXT          DEFAULT NULL,
    `image`       VARCHAR(500)  DEFAULT NULL,
    `phone`       VARCHAR(50)   DEFAULT NULL,
    `total_seats` INT           DEFAULT 0,
    `facilities`  JSON          DEFAULT NULL,
    `status`      TINYINT       DEFAULT 1,
    `create_time` DATETIME      DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`     TINYINT       DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_city` (`city`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Performance venues';

-- ============================================================
-- 4. venue_hall - Halls within a venue
-- ============================================================
CREATE TABLE `venue_hall` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `venue_id`    BIGINT       NOT NULL,
    `name`        VARCHAR(100) NOT NULL,
    `capacity`    INT           DEFAULT 0,
    `description` TEXT          DEFAULT NULL,
    `status`      TINYINT       DEFAULT 1,
    `create_time` DATETIME      DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`     TINYINT       DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_venue_id` (`venue_id`),
    CONSTRAINT `fk_venue_hall_venue` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Venue halls';

-- ============================================================
-- 5. seat_map - Seat layout maps for halls
-- ============================================================
CREATE TABLE `seat_map` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT,
    `venue_hall_id` BIGINT       NOT NULL,
    `name`          VARCHAR(100) NOT NULL,
    `total_rows`    INT          NOT NULL,
    `description`   VARCHAR(500)  DEFAULT NULL,
    `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP,
    `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`       TINYINT       DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_venue_hall_id` (`venue_hall_id`),
    CONSTRAINT `fk_seat_map_venue_hall` FOREIGN KEY (`venue_hall_id`) REFERENCES `venue_hall` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Seat layout maps';

-- ============================================================
-- 6. seat - Individual seats in a seat map
-- ============================================================
CREATE TABLE `seat` (
    `id`          BIGINT      NOT NULL AUTO_INCREMENT,
    `seat_map_id` BIGINT      NOT NULL,
    `row_num`     INT         NOT NULL,
    `col_num`     INT         NOT NULL,
    `seat_label`  VARCHAR(20) NOT NULL,
    `seat_type`   VARCHAR(20)  DEFAULT 'STANDARD',
    `status`      TINYINT      DEFAULT 1,
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`     TINYINT      DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_seat_position` (`seat_map_id`, `row_num`, `col_num`),
    INDEX `idx_seat_map_id` (`seat_map_id`),
    INDEX `idx_seat_type` (`seat_type`),
    CONSTRAINT `fk_seat_seat_map` FOREIGN KEY (`seat_map_id`) REFERENCES `seat_map` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Individual seats';

-- ============================================================
-- 7. show - Performance shows / events
-- ============================================================
CREATE TABLE `show` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT,
    `title`         VARCHAR(200) NOT NULL,
    `category_id`   BIGINT       NOT NULL,
    `venue_id`      BIGINT       NOT NULL,
    `venue_hall_id` BIGINT        DEFAULT NULL,
    `artist`        VARCHAR(200)  DEFAULT NULL,
    `description`   TEXT          DEFAULT NULL,
    `poster_url`    VARCHAR(500)  DEFAULT NULL,
    `min_price`     DECIMAL(10,2) DEFAULT NULL,
    `max_price`     DECIMAL(10,2) DEFAULT NULL,
    `status`        VARCHAR(20)   DEFAULT 'DRAFT',
    `operator_id`   BIGINT        DEFAULT NULL,
    `create_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP,
    `update_time`   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`       TINYINT       DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_venue_id` (`venue_id`),
    INDEX `idx_venue_hall_id` (`venue_hall_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_operator_id` (`operator_id`),
    CONSTRAINT `fk_show_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
    CONSTRAINT `fk_show_venue` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Performance shows';

-- ============================================================
-- 8. show_schedule - Scheduled performances for a show
-- ============================================================
CREATE TABLE `show_schedule` (
    `id`           BIGINT      NOT NULL AUTO_INCREMENT,
    `show_id`      BIGINT      NOT NULL,
    `seat_map_id`  BIGINT       DEFAULT NULL,
    `show_date`    DATE        NOT NULL,
    `show_time`    TIME        NOT NULL,
    `end_time`     TIME         DEFAULT NULL,
    `status`       VARCHAR(20)  DEFAULT 'ON_SALE',
    `total_tickets` INT         DEFAULT 0,
    `sold_tickets`  INT         DEFAULT 0,
    `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`      TINYINT      DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_show_id` (`show_id`),
    INDEX `idx_seat_map_id` (`seat_map_id`),
    INDEX `idx_show_date` (`show_date`),
    INDEX `idx_status` (`status`),
    CONSTRAINT `fk_schedule_show` FOREIGN KEY (`show_id`) REFERENCES `show` (`id`),
    CONSTRAINT `fk_schedule_seat_map` FOREIGN KEY (`seat_map_id`) REFERENCES `seat_map` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Show schedules';

-- ============================================================
-- 9. schedule_seat_price - Pricing per seat type per schedule
-- ============================================================
CREATE TABLE `schedule_seat_price` (
    `id`          BIGINT        NOT NULL AUTO_INCREMENT,
    `schedule_id` BIGINT        NOT NULL,
    `seat_type`   VARCHAR(20)   NOT NULL,
    `price`       DECIMAL(10,2) NOT NULL,
    `create_time` DATETIME       DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`     TINYINT        DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_schedule_seat_type` (`schedule_id`, `seat_type`),
    INDEX `idx_schedule_id` (`schedule_id`),
    CONSTRAINT `fk_price_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `show_schedule` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Schedule seat pricing';

-- ============================================================
-- 10. show_image - Additional images for a show
-- ============================================================
CREATE TABLE `show_image` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `show_id`     BIGINT       NOT NULL,
    `image_url`   VARCHAR(500) NOT NULL,
    `sort_order`  INT           DEFAULT 0,
    `create_time` DATETIME      DEFAULT CURRENT_TIMESTAMP,
    `deleted`     TINYINT       DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_show_id` (`show_id`),
    CONSTRAINT `fk_image_show` FOREIGN KEY (`show_id`) REFERENCES `show` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Show images';

-- ============================================================
-- 11. show_tag - Tags associated with a show
-- ============================================================
CREATE TABLE `show_tag` (
    `id`       BIGINT      NOT NULL AUTO_INCREMENT,
    `show_id`  BIGINT      NOT NULL,
    `tag_name` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_show_id` (`show_id`),
    INDEX `idx_tag_name` (`tag_name`),
    CONSTRAINT `fk_tag_show` FOREIGN KEY (`show_id`) REFERENCES `show` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Show tags';

-- ============================================================
-- 12. order - Ticket orders
-- ============================================================
CREATE TABLE `order` (
    `id`           BIGINT        NOT NULL AUTO_INCREMENT,
    `order_no`     VARCHAR(32)   NOT NULL,
    `user_id`      BIGINT        NOT NULL,
    `schedule_id`  BIGINT        NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `status`       VARCHAR(20)    DEFAULT 'PENDING_PAYMENT',
    `payment_time` DATETIME       DEFAULT NULL,
    `cancel_time`  DATETIME       DEFAULT NULL,
    `expire_time`  DATETIME      NOT NULL,
    `remark`       VARCHAR(500)   DEFAULT NULL,
    `create_time`  DATETIME       DEFAULT CURRENT_TIMESTAMP,
    `update_time`  DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`      TINYINT        DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_schedule_id` (`schedule_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_create_time` (`create_time`),
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`),
    CONSTRAINT `fk_order_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `show_schedule` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ticket orders';

-- ============================================================
-- 13. order_item - Individual tickets within an order
-- ============================================================
CREATE TABLE `order_item` (
    `id`             BIGINT        NOT NULL AUTO_INCREMENT,
    `order_id`       BIGINT        NOT NULL,
    `seat_id`        BIGINT        NOT NULL,
    `schedule_id`    BIGINT        NOT NULL,
    `ticket_no`      VARCHAR(64)   NOT NULL,
    `seat_label`     VARCHAR(20)   NOT NULL,
    `seat_type`      VARCHAR(20)   NOT NULL,
    `price`          DECIMAL(10,2) NOT NULL,
    `ticket_status`  VARCHAR(20)    DEFAULT 'VALID',
    `verify_time`    DATETIME       DEFAULT NULL,
    `verify_user_id` BIGINT         DEFAULT NULL,
    `create_time`    DATETIME       DEFAULT CURRENT_TIMESTAMP,
    `update_time`    DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`        TINYINT        DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ticket_no` (`ticket_no`),
    UNIQUE KEY `uk_seat_schedule` (`seat_id`, `schedule_id`),
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_seat_id` (`seat_id`),
    INDEX `idx_schedule_id` (`schedule_id`),
    INDEX `idx_ticket_status` (`ticket_status`),
    CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`),
    CONSTRAINT `fk_item_seat` FOREIGN KEY (`seat_id`) REFERENCES `seat` (`id`),
    CONSTRAINT `fk_item_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `show_schedule` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Order items (tickets)';

-- ============================================================
-- 14. ticket_verification - Ticket verification records
-- ============================================================
CREATE TABLE `ticket_verification` (
    `id`            BIGINT      NOT NULL AUTO_INCREMENT,
    `order_item_id` BIGINT       DEFAULT NULL,
    `ticket_no`     VARCHAR(64) NOT NULL,
    `inspector_id`  BIGINT      NOT NULL,
    `verify_result` VARCHAR(20) NOT NULL,
    `remark`        VARCHAR(500) DEFAULT NULL,
    `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_order_item_id` (`order_item_id`),
    INDEX `idx_inspector_id` (`inspector_id`),
    INDEX `idx_ticket_no` (`ticket_no`),
    INDEX `idx_create_time` (`create_time`),
    CONSTRAINT `fk_verify_inspector` FOREIGN KEY (`inspector_id`) REFERENCES `sys_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ticket verification records';

-- ============================================================
-- 15. home_config - Homepage configuration (featured / upcoming)
-- ============================================================
CREATE TABLE `home_config` (
    `id`          BIGINT      NOT NULL AUTO_INCREMENT,
    `config_type` VARCHAR(20) NOT NULL,
    `show_id`     BIGINT      NOT NULL,
    `sort_order`  INT          DEFAULT 0,
    `status`      TINYINT      DEFAULT 1,
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`     TINYINT      DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_show` (`config_type`, `show_id`),
    INDEX `idx_config_type` (`config_type`),
    INDEX `idx_show_id` (`show_id`),
    CONSTRAINT `fk_home_show` FOREIGN KEY (`show_id`) REFERENCES `show` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Homepage configuration';

-- ============================================================
-- 16. contact_message - Contact form messages
-- ============================================================
CREATE TABLE `contact_message` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(100) NOT NULL,
    `email`       VARCHAR(100) NOT NULL,
    `subject`     VARCHAR(200)  DEFAULT NULL,
    `message`     TEXT         NOT NULL,
    `is_read`     TINYINT       DEFAULT 0,
    `reply`       TEXT          DEFAULT NULL,
    `create_time` DATETIME      DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`     TINYINT       DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_is_read` (`is_read`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contact form messages';
