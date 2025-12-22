-- ============================================
-- 采购小程序数据库初始化脚本
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `shopping_mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `shopping_mall`;

-- ============================================
-- 用户表 (users)
-- B2B 项目：通过手机号唯一标识用户
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号（唯一标识）',
  `openid` VARCHAR(64) DEFAULT NULL COMMENT '微信小程序openid',
  `unionid` VARCHAR(64) DEFAULT NULL COMMENT '微信unionid（如有）',
  
  -- 基本信息
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '用户昵称',
  `avatar` VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
  `real_name` VARCHAR(64) DEFAULT NULL COMMENT '真实姓名',
  
  -- B2B 客户信息
  `company_name` VARCHAR(128) DEFAULT NULL COMMENT '公司/客户名称',
  `level` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '客户等级: 1-4级，不同等级对应不同价格',
  `points` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '积分余额',
  `product_library_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属产品库ID（大客户专属）',
  
  -- 状态
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  
  -- 时间戳
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_level` (`level`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 用户收货地址表 (user_addresses)
-- ============================================
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '地址ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `contact_name` VARCHAR(64) NOT NULL COMMENT '收货人姓名',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '收货人电话',
  `province` VARCHAR(32) DEFAULT NULL COMMENT '省份',
  `city` VARCHAR(32) DEFAULT NULL COMMENT '城市',
  `district` VARCHAR(32) DEFAULT NULL COMMENT '区县',
  `address` VARCHAR(256) NOT NULL COMMENT '详细地址',
  `is_default` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否默认地址: 0-否, 1-是',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收货地址表';

-- ============================================
-- 积分记录表 (points_records)
-- ============================================
CREATE TABLE IF NOT EXISTS `points_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `points` INT NOT NULL COMMENT '积分变动数量（正数增加，负数减少）',
  `balance` INT UNSIGNED NOT NULL COMMENT '变动后积分余额',
  `type` TINYINT UNSIGNED NOT NULL COMMENT '类型: 1-消费获得, 2-积分兑换, 3-后台调整, 4-退款返还',
  `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联订单ID',
  `remark` VARCHAR(256) DEFAULT NULL COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_points_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分记录表';

-- ============================================
-- 用户收藏表 (user_favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_product` (`user_id`, `product_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_favorite_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';
