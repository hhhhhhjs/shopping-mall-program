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

-- ============================================
-- 商品分类表 (goods_categories)
-- ============================================
CREATE TABLE IF NOT EXISTS `goods_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(64) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(256) DEFAULT NULL COMMENT '分类图标',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序值（越小越靠前）',
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- ============================================
-- 商品表 (goods)
-- ============================================
CREATE TABLE IF NOT EXISTS `goods` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` VARCHAR(256) NOT NULL COMMENT '商品名称',
  `image` VARCHAR(512) NOT NULL COMMENT '商品主图URL',
  `images` JSON DEFAULT NULL COMMENT '商品图片列表（轮播图，JSON数组）',
  `description` TEXT DEFAULT NULL COMMENT '商品简介/详情',
  `spec` VARCHAR(128) DEFAULT NULL COMMENT '商品规格/型号',
  
  -- 分类关联
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
  
  -- 库存信息
  `stock` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '库存数量',
  `show_stock` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否显示库存: 0-隐藏, 1-显示',
  
  -- 多等级价格（B2B 客户等级价格体系）
  `price1` DECIMAL(10,2) NOT NULL COMMENT '1级客户价格',
  `price2` DECIMAL(10,2) NOT NULL COMMENT '2级客户价格',
  `price3` DECIMAL(10,2) NOT NULL COMMENT '3级客户价格',
  `price4` DECIMAL(10,2) NOT NULL COMMENT '4级客户价格',
  
  -- 积分兑换
  `support_points` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否支持积分兑换: 0-否, 1-是',
  `points_price` INT UNSIGNED DEFAULT NULL COMMENT '积分兑换所需积分',
  
  -- 状态
  `status` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态: 0-下架, 1-上架',
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序值（越小越靠前）',
  
  -- 时间戳
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_support_points` (`support_points`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_created_at` (`created_at`),
  FULLTEXT KEY `ft_name` (`name`),
  CONSTRAINT `fk_goods_category` FOREIGN KEY (`category_id`) REFERENCES `goods_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ============================================
-- 初始化商品分类数据
-- ============================================
INSERT INTO `goods_categories` (`name`, `icon`, `sort_order`) VALUES
('办公用品', NULL, 1),
('电子设备', NULL, 2),
('劳保用品', NULL, 3),
('清洁用品', NULL, 4),
('包装材料', NULL, 5);

-- ============================================
-- 初始化商品测试数据
-- ============================================
INSERT INTO `goods` (`name`, `image`, `images`, `description`, `spec`, `category_id`, `stock`, `show_stock`, `price1`, `price2`, `price3`, `price4`, `support_points`, `points_price`, `sort_order`) VALUES
('A4打印纸 70g 500张/包 办公用纸', 'https://img.yzcdn.cn/vant/cat.jpeg', '["https://img.yzcdn.cn/vant/cat.jpeg", "https://img.yzcdn.cn/vant/cat.jpeg"]', '高品质A4打印纸，70g加厚设计，不易卡纸，打印清晰，适用于各类打印机、复印机。每包500张，经济实惠。', '70g / 500张/包', 1, 1000, 0, 28.00, 26.00, 24.00, 22.00, 1, 280, 1),
('中性笔黑色0.5mm 办公签字笔 12支装', 'https://img.yzcdn.cn/vant/cat.jpeg', NULL, '顺滑书写，不易断墨，适合日常办公签字使用。', '0.5mm / 12支', 1, 500, 1, 15.00, 14.00, 13.00, 12.00, 0, NULL, 2),
('无线蓝牙鼠标 静音办公 可充电', 'https://img.yzcdn.cn/vant/cat.jpeg', '["https://img.yzcdn.cn/vant/cat.jpeg"]', '2.4G无线连接，静音按键设计，内置锂电池可充电使用，人体工学设计。', '无线蓝牙', 2, 200, 1, 89.00, 85.00, 80.00, 75.00, 1, 890, 1),
('机械键盘 青轴104键 办公游戏两用', 'https://img.yzcdn.cn/vant/cat.jpeg', NULL, '青轴机械键盘，104键全尺寸，打字手感清脆，RGB背光可调。', '青轴 / 104键', 2, 150, 0, 199.00, 189.00, 179.00, 169.00, 0, NULL, 2),
('防护手套 乳胶手套 一次性 100只装', 'https://img.yzcdn.cn/vant/cat.jpeg', NULL, '医用级乳胶材质，弹性好，贴合手型，适用于清洁、防护等场景。', '乳胶 / 100只', 3, 800, 1, 35.00, 32.00, 30.00, 28.00, 1, 350, 1),
('安全帽 ABS材质 防砸防撞 工地施工', 'https://img.yzcdn.cn/vant/cat.jpeg', NULL, 'ABS工程塑料材质，防砸防撞，符合国家安全标准，适用于工地施工。', 'ABS材质', 3, 300, 0, 45.00, 42.00, 40.00, 38.00, 0, NULL, 2);
