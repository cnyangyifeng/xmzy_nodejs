/*
 Navicat Premium Data Transfer

 Source Server         : xmzy_core_db
 Source Server Type    : MySQL
 Source Server Version : 50628
 Source Host           : gz-cdb-hy2472r9.sql.tencentcdb.com:63055
 Source Schema         : cAuth

 Target Server Type    : MySQL
 Target Server Version : 50628
 File Encoding         : 65001

 Date: 19/03/2018 17:40:07
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cAppinfo
-- ----------------------------
DROP TABLE IF EXISTS `cAppinfo`;
CREATE TABLE `cAppinfo` (
  `appid` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `secret` varchar(300) COLLATE utf8_unicode_ci NOT NULL,
  `login_duration` int(11) DEFAULT '30',
  `session_duration` int(11) DEFAULT '2592000',
  `qcloud_appid` varchar(300) COLLATE utf8_unicode_ci DEFAULT 'appid_qcloud',
  `ip` varchar(50) COLLATE utf8_unicode_ci DEFAULT '0.0.0.0',
  PRIMARY KEY (`appid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Records of cAppinfo
-- ----------------------------
BEGIN;
INSERT INTO `cAppinfo` VALUES ('wxa01c657814b80e65', '381528546bddfa148164a5c31e5f0a71', 1000, 2000, '1252644202', '123.207.6.178');
COMMIT;

-- ----------------------------
-- Table structure for cSessionInfo
-- ----------------------------
DROP TABLE IF EXISTS `cSessionInfo`;
CREATE TABLE `cSessionInfo` (
  `open_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_visit_time` timestamp NOT NULL,
  `session_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_info` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`open_id`),
  KEY `openid` (`open_id`) USING BTREE,
  KEY `skey` (`skey`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话管理用户信息';

SET FOREIGN_KEY_CHECKS = 1;
