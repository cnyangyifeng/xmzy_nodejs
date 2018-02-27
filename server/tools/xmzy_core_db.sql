/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50721
 Source Host           : localhost:3306
 Source Schema         : xmzy_core_db

 Target Server Type    : MySQL
 Target Server Version : 50721
 File Encoding         : 65001

 Date: 27/02/2018 12:33:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for activity
-- ----------------------------
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
  `activityId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `disciplineId` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentInfo` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tutorId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tutorInfo` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `xmStatus` tinyint(1) NOT NULL DEFAULT '0',
  `currentAssignmentId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastVisitTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`activityId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for assignment
-- ----------------------------
DROP TABLE IF EXISTS `assignment`;
CREATE TABLE `assignment` (
  `assignmentId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activityId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderInfo` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `xmStatus` tinyint(1) NOT NULL DEFAULT '0',
  `imageData` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastVisitTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignmentId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for student
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `studentId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentInfo` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `beginner` tinyint(1) NOT NULL DEFAULT '0',
  `hearts` int(11) DEFAULT '0',
  `praises` int(11) DEFAULT '0',
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastVisitTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for tutor
-- ----------------------------
DROP TABLE IF EXISTS `tutor`;
CREATE TABLE `tutor` (
  `tutorId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tutorInfo` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastVisitTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tutorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for xmessage
-- ----------------------------
DROP TABLE IF EXISTS `xmessage`;
CREATE TABLE `xmessage` (
  `xmessageId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activityId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignmentId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderInfo` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `xmStatus` tinyint(1) NOT NULL DEFAULT '1',
  `audioData` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastVisitTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`xmessageId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
