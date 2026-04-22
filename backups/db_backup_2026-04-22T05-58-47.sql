/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.2.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: visitrack_next
-- ------------------------------------------------------
-- Server version	12.2.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `access_token`
--

DROP TABLE IF EXISTS `access_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_token` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` bigint(20) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expired_at` timestamp NULL DEFAULT NULL,
  `usage_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `1` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_token`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `access_token` WRITE;
/*!40000 ALTER TABLE `access_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `access_token` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `action` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` bigint(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `1` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE SET NULL,
  CONSTRAINT `2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES
(1,NULL,1,'LOGIN',NULL,NULL,'User Super Admin logged in successfully','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,NULL,'2026-04-21 11:34:11'),
(2,1,2,'LOGIN',NULL,NULL,'User Admin SMKN 1 Banjar logged in successfully','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,NULL,'2026-04-21 11:34:35'),
(3,NULL,1,'LOGIN',NULL,NULL,'User Super Admin logged in successfully','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,NULL,'2026-04-21 11:34:50'),
(4,NULL,1,'LOGIN',NULL,NULL,'User Super Admin logged in successfully','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,NULL,'2026-04-21 11:38:54'),
(5,NULL,1,'LOGIN',NULL,NULL,'User Super Admin logged in successfully','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,NULL,'2026-04-21 11:39:15'),
(6,NULL,1,'DELETE','instances',4,'Menghapus instansi: aa (aaaa)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"aa\",\"slug\":\"aaaa\"}',NULL,'2026-04-21 12:03:09'),
(7,NULL,1,'INSERT','users',12,'Menambahkan admin baru: aa (aaa@gmail.com) untuk instansi SMK Negeri 1 Banjar','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"aa\",\"email\":\"aaa@gmail.com\",\"instance_id\":\"1\",\"role\":\"admin\"}','2026-04-21 12:03:30'),
(8,NULL,1,'DELETE','users',12,'Menghapus admin: aa (aaa@gmail.com)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"aa\",\"email\":\"aaa@gmail.com\",\"instance_id\":1}',NULL,'2026-04-21 12:03:39'),
(9,NULL,1,'INSERT','users',13,'Menambahkan admin baru: sasasas (sasa@saas.sa) untuk instansi SMK Negeri 1 Banjar','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"sasasas\",\"email\":\"sasa@saas.sa\",\"instance_id\":\"1\",\"role\":\"admin\"}','2026-04-21 23:57:32'),
(10,NULL,1,'UPDATE','users',13,'Mengupdate admin: sasasas','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"sasasas\",\"email\":\"sasa@saas.sa\",\"instance_id\":1}','{\"name\":\"sasasas\",\"email\":\"sasa@saas.com\",\"instance_id\":\"1\"}','2026-04-21 23:57:43'),
(11,NULL,1,'DELETE','users',13,'Menghapus admin: sasasas (sasa@saas.com)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"sasasas\",\"email\":\"sasa@saas.com\",\"instance_id\":1}',NULL,'2026-04-21 23:57:58'),
(12,NULL,1,'INSERT','instances',5,'Menambahkan instansi baru: Universitas Niggerian (uniga)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"Universitas Niggerian\",\"slug\":\"uniga\",\"address\":\"disna\",\"phone\":\"iya\",\"plan\":\"starter\",\"subscription_end\":\"2026-05-22\"}','2026-04-22 00:57:24'),
(13,NULL,1,'INSERT','users',14,'Menambahkan admin baru: Sandi savetian (sandi@gmail.com) untuk instansi Universitas Niggerian','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"Sandi savetian\",\"email\":\"sandi@gmail.com\",\"instance_id\":\"5\",\"role\":\"admin\"}','2026-04-22 00:57:49'),
(14,NULL,1,'DELETE','users',14,'Menghapus admin: Sandi savetian (sandi@gmail.com)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"Sandi savetian\",\"email\":\"sandi@gmail.com\",\"instance_id\":5}',NULL,'2026-04-22 02:48:17'),
(15,NULL,1,'DELETE','instances',5,'Menghapus instansi: Universitas Niggerian (uniga)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"Universitas Niggerian\",\"slug\":\"uniga\"}',NULL,'2026-04-22 02:48:23'),
(16,NULL,1,'INSERT','instances',6,'Menambahkan instansi baru: SMA Negeri 1 Banjar (sman1banjar)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"SMA Negeri 1 Banjar\",\"slug\":\"sman1banjar\",\"address\":\"Jl. K.H. Mustofa No.1, Banjar, Banjar City, West Java 46311, Indonesia\",\"phone\":\"0265212233\",\"plan\":\"starter\",\"subscription_end\":\"2026-04-29\"}','2026-04-22 05:51:25'),
(17,NULL,1,'INSERT','users',15,'Menambahkan admin baru: Isa Azhari (isaazari@gmail.com) untuk instansi SMA Negeri 1 Banjar','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"Isa Azhari\",\"email\":\"isaazari@gmail.com\",\"instance_id\":\"6\",\"role\":\"admin\"}','2026-04-22 05:54:27');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` bigint(20) NOT NULL,
  `nip` varchar(50) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `department` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `1` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES
(1,1,'198001012010011001','Ahmad Sudrajat','Teknik Komputer','081234567890',1,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(2,1,'198502152011012002','Siti Aminah','Bahasa Inggris','081234567891',1,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(3,1,'199003102012013003','Budi Santoso','Matematika','081234567892',1,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(4,2,'197505102005012001','Dewi Lestari','IPA','081234567893',1,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(5,2,'198008202008022002','Rudi Hartono','IPS','081234567894',1,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(6,3,'196812151994031001','Prof. Dr. Bambang Suharto','Teknik Informatika','081234567895',1,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(7,3,'197505152000122002','Dr. Ir. Ratna Wijaya','Ekonomi','081234567896',1,'2026-04-15 13:23:12','2026-04-15 13:23:12');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `guests`
--

DROP TABLE IF EXISTS `guests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guests` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` bigint(20) NOT NULL,
  `employee_id` bigint(20) NOT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `institution` varchar(100) DEFAULT NULL,
  `purpose` varchar(100) NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `status` enum('pending','active','done','rejected') NOT NULL DEFAULT 'pending',
  `check_in_at` datetime DEFAULT NULL,
  `check_out_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  KEY `employee_id` (`employee_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `1` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guests`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `guests` WRITE;
/*!40000 ALTER TABLE `guests` DISABLE KEYS */;
INSERT INTO `guests` VALUES
(1,1,1,4,'Budi Santoso','PT. Maju Jaya','Meeting Kerjasama','/uploads/photo1.jpg','done','2026-04-21 09:00:00','2026-04-21 11:30:00','2026-04-21 01:55:00','2026-04-21 04:30:00'),
(2,1,2,4,'Siti Rahayu','Dinas Pendidikan','Monitoring Sekolah','/uploads/photo2.jpg','done','2026-04-21 10:00:00','2026-04-21 14:00:00','2026-04-21 02:45:00','2026-04-21 07:00:00'),
(3,1,3,4,'Ahmad Fauzi','Universitas Negeri','Penelitian','/uploads/photo3.jpg','active','2026-04-22 08:30:00',NULL,'2026-04-22 01:15:00','2026-04-22 01:30:00'),
(4,1,1,NULL,'Dewi Kartika','CV. Kreatif Abadi','Interview','/uploads/photo4.jpg','pending',NULL,NULL,'2026-04-22 02:00:00','2026-04-22 02:00:00'),
(5,2,4,6,'Rizki Ramadhan','Kementerian Pendidikan','Studi Banding','/uploads/photo5.jpg','done','2026-04-20 09:30:00','2026-04-20 12:00:00','2026-04-20 02:15:00','2026-04-20 05:00:00'),
(6,2,5,6,'Nadia Putri','Bank Indonesia','Sosialisasi','/uploads/photo6.jpg','rejected',NULL,NULL,'2026-04-21 07:00:00','2026-04-21 07:00:00'),
(7,3,6,9,'Prof. Dr. Hendra','Kemendikbudristek','Akreditasi','/uploads/photo7.jpg','active','2026-04-22 10:00:00',NULL,'2026-04-22 02:45:00','2026-04-22 03:00:00'),
(8,3,7,9,'Lina Marlina','Google Indonesia','Guest Lecture','/uploads/photo8.jpg','pending',NULL,NULL,'2026-04-22 04:30:00','2026-04-22 04:30:00');
/*!40000 ALTER TABLE `guests` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `instances`
--

DROP TABLE IF EXISTS `instances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `instances` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `plan` enum('starter','business','enterprise') NOT NULL,
  `subscription_start` date NOT NULL,
  `subscription_end` date NOT NULL,
  `subscription_status` enum('active','expired','trial') NOT NULL DEFAULT 'trial',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `instances` WRITE;
/*!40000 ALTER TABLE `instances` DISABLE KEYS */;
INSERT INTO `instances` VALUES
(1,'SMK Negeri 1 Banjar','smkn1banjar','Jl. Raya Banjar, Banjar, Jawa Barat','0265123456',NULL,'business','2025-01-01','2027-12-03','active',1,'2026-04-15 13:23:12','2026-04-21 05:54:18'),
(2,'SMA Negeri 1 Jakarta','sman1jakarta','Jl. Medan Merdeka No.1, Jakarta Pusat','0211234567',NULL,'starter','2025-01-01','2025-12-31','expired',1,'2026-04-15 13:23:12','2026-04-21 05:51:24'),
(3,'Universitas Gadjah Mada','ugm','Jl. Bulaksumur No.1, Yogyakarta','0274123456',NULL,'enterprise','2025-01-01','2025-12-31','expired',1,'2026-04-15 13:23:12','2026-04-21 05:51:24'),
(6,'SMA Negeri 1 Banjar','sman1banjar','Jl. K.H. Mustofa No.1, Banjar, Banjar City, West Java 46311, Indonesia','0265212233',NULL,'starter','2026-04-22','2026-04-29','active',1,'2026-04-22 05:51:25','2026-04-22 05:51:25');
/*!40000 ALTER TABLE `instances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` bigint(20) NOT NULL,
  `qr_mode` enum('static','dynamic') NOT NULL DEFAULT 'static',
  `token_interval` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `1` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES
(1,1,'dynamic',30,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(2,2,'static',NULL,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(3,3,'dynamic',15,'2026-04-15 13:23:12','2026-04-15 13:23:12'),
(6,6,'static',NULL,'2026-04-22 05:51:25','2026-04-22 05:51:25');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` bigint(20) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','ppid','petugas') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `1` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,NULL,'Super Admin','superadmin@visitrack.com','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','super_admin','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(2,1,'Admin SMKN 1 Banjar','admin@smkn1banjar.com','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','admin','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(3,1,'PPID SMKN 1 Banjar','ppid@smkn1banjar.com','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','ppid','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(4,1,'Petugas SMKN 1 Banjar','petugas@smkn1banjar.com','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','petugas','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(5,2,'Admin SMA N 1 Jakarta','admin@sman1jakarta.com','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','admin','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(6,2,'Petugas SMA N 1 Jakarta','petugas@sman1jakarta.com','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','petugas','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(7,3,'Admin UGM','admin@ugm.ac.id','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','admin','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(8,3,'PPID UGM','ppid@ugm.ac.id','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','ppid','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(9,3,'Petugas UGM','petugas@ugm.ac.id','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','petugas','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(15,6,'Isa Azhari','isaazari@gmail.com','$2b$10$kkKUR1czOMgBjjQwTdKCw.MfuLBIg6839fHPbJJOYPG7UvxE6edYO','admin','2026-04-22 05:54:27','2026-04-22 05:54:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping routines for database 'visitrack_next'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-04-22 12:58:47
