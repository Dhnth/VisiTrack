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
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_token`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `access_token` WRITE;
/*!40000 ALTER TABLE `access_token` DISABLE KEYS */;
INSERT INTO `access_token` VALUES
(94,1,'7b448521b7bcdbd6c10f3813d1e4637ff3446f56343d455fd81c4493d4f841c7','2026-04-28 18:42:27',2,'2026-04-28 18:12:27');
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
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
(17,NULL,1,'INSERT','users',15,'Menambahkan admin baru: Isa Azhari (isaazari@gmail.com) untuk instansi SMA Negeri 1 Banjar','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"Isa Azhari\",\"email\":\"isaazari@gmail.com\",\"instance_id\":\"6\",\"role\":\"admin\"}','2026-04-22 05:54:27'),
(18,NULL,1,'INSERT','instances',7,'Menambahkan instansi baru: aa (asasas)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"aa\",\"slug\":\"asasas\",\"address\":\"sasasasaas\",\"phone\":\"asasa\",\"subscription_end\":\"2026-04-30\"}','2026-04-22 10:54:54'),
(19,NULL,1,'DELETE','instances',7,'Menghapus instansi: aa (asasas)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"aa\",\"slug\":\"asasas\"}',NULL,'2026-04-22 10:55:06'),
(20,NULL,1,'DELETE','users',7,'Menghapus admin: Admin UGM (admin@ugm.ac.id)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"Admin UGM\",\"email\":\"admin@ugm.ac.id\",\"instance_id\":3}',NULL,'2026-04-22 23:16:11'),
(21,NULL,1,'INSERT','instances',8,'Menambahkan instansi baru: aasasa (sasa)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"aasasa\",\"slug\":\"sasa\",\"address\":\"saas\",\"phone\":\"assa\",\"subscription_end\":\"2026-04-30\"}','2026-04-22 23:20:58'),
(22,NULL,1,'UPDATE','instances',3,'Mengupdate instansi: Universitas Gadjah Mada','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":3,\"name\":\"Universitas Gadjah Mada\",\"slug\":\"ugm\",\"address\":\"Jl. Bulaksumur No.1, Yogyakarta\",\"phone\":\"0274123456\",\"logo\":null,\"is_active\":1,\"created_at\":\"2026-04-15T13:23:12.000Z\",\"updated_at\":\"2026-04-22T10:46:06.000Z\",\"subscription_start\":\"2026-04-21T17:00:00.000Z\",\"subscription_end\":\"2026-05-21T17:00:00.000Z\",\"subscription_status\":\"active\"}','{\"name\":\"Universitas Genjot Makima\",\"slug\":\"ugm\",\"address\":\"Jl. Bulaksumur No.1, Yogyakarta\",\"phone\":\"0274123456\",\"subscription_start\":\"2026-04-21\",\"subscription_end\":\"2026-05-21\"}','2026-04-22 23:28:52'),
(23,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-23 02:13:39'),
(24,NULL,1,'LOGOUT','users',1,'User Super Admin logout',NULL,NULL,NULL,NULL,'2026-04-23 02:14:27'),
(25,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-23 02:14:39'),
(26,NULL,1,'LOGOUT','users',1,'User Super Admin logout',NULL,NULL,NULL,NULL,'2026-04-23 05:40:51'),
(27,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-23 05:41:02'),
(28,1,2,'LOGOUT','users',2,'User Admin SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-23 09:13:53'),
(29,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-23 09:15:12'),
(30,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-24 04:15:25'),
(31,1,2,'LOGOUT','users',2,'User Admin SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-24 06:16:46'),
(32,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-24 06:16:54'),
(33,NULL,1,'LOGOUT','users',1,'User Super Admin logout',NULL,NULL,NULL,NULL,'2026-04-24 06:20:16'),
(34,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-24 06:20:25'),
(35,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-24 06:21:53'),
(36,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-24 06:26:50'),
(37,1,2,'INSERT','employees',8,'Menambahkan karyawan: a','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"nip\":\"a\",\"name\":\"a\",\"department\":\"a\",\"phone\":\"a\",\"is_active\":true}','2026-04-24 06:27:09'),
(38,1,2,'DELETE','employees',8,'Menghapus karyawan: a','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":8,\"instance_id\":1,\"nip\":\"a\",\"name\":\"a\",\"department\":\"a\",\"phone\":\"a\",\"is_active\":1,\"created_at\":\"2026-04-24T06:27:08.000Z\",\"updated_at\":\"2026-04-24T06:27:08.000Z\"}',NULL,'2026-04-24 06:27:19'),
(39,1,2,'INSERT','users',16,'Menambahkan petugas: as (asasa@gmail.com)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"as\",\"email\":\"asasa@gmail.com\"}','2026-04-24 06:27:29'),
(40,1,2,'UPDATE','users',16,'Mengupdate petugas: as','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":16,\"instance_id\":1,\"name\":\"as\",\"email\":\"asasa@gmail.com\",\"password\":\"$2b$10$SMtyrMct9zVoziEO2BWV8OESVXk1SzTQaEGrUtQxtzqukYicbRsrS\",\"role\":\"petugas\",\"created_at\":\"2026-04-24T06:27:29.000Z\",\"updated_at\":\"2026-04-24T06:27:29.000Z\"}','{}','2026-04-24 06:27:36'),
(41,1,2,'UPDATE','users',16,'Mengupdate petugas: as','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":16,\"instance_id\":1,\"name\":\"as\",\"email\":\"asasa@gmail.com\",\"password\":\"$2b$10$8l8Ey9BLLbPU1XsdNNzhYOO4.4L1t6fUVIAiDOVatn1kWUJyTU//2\",\"role\":\"petugas\",\"created_at\":\"2026-04-24T06:27:29.000Z\",\"updated_at\":\"2026-04-24T06:27:36.000Z\"}','{}','2026-04-24 07:20:12'),
(42,1,2,'DELETE','users',16,'Menghapus petugas: as','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":16,\"instance_id\":1,\"name\":\"as\",\"email\":\"asasa@gmail.com\",\"password\":\"$2b$10$jd4rJtOaNFCxKhjzVvxNnu.SswpsBtOaqgybyKp2M0yx2A8QnEwhS\",\"role\":\"petugas\",\"created_at\":\"2026-04-24T06:27:29.000Z\",\"updated_at\":\"2026-04-24T07:20:12.000Z\"}',NULL,'2026-04-24 07:20:17'),
(43,1,2,'INSERT','users',17,'Menambahkan petugas: asas (asasa@gmail.com)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"asas\",\"email\":\"asasa@gmail.com\"}','2026-04-24 07:21:31'),
(44,1,2,'UPDATE','users',17,'Mengupdate petugas: asas','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":17,\"instance_id\":1,\"name\":\"asas\",\"email\":\"asasa@gmail.com\",\"password\":\"$2b$10$GJBoZikZUuYJHn2tM78eAe6HwsSSriv76VoZXlsiG3yyw3SlRZEEa\",\"role\":\"petugas\",\"created_at\":\"2026-04-24T07:21:31.000Z\",\"updated_at\":\"2026-04-24T07:21:31.000Z\"}','{}','2026-04-24 07:22:24'),
(45,1,2,'DELETE','users',17,'Menghapus petugas: asas','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":17,\"instance_id\":1,\"name\":\"asas\",\"email\":\"asasa@gmail.com\",\"password\":\"$2b$10$1mltVV038fBHqW0FQyjK6e4FouQARKC2O1wWF/71WB2tdCQ/Azlf2\",\"role\":\"petugas\",\"created_at\":\"2026-04-24T07:21:31.000Z\",\"updated_at\":\"2026-04-24T07:22:24.000Z\"}',NULL,'2026-04-24 07:22:33'),
(46,1,2,'LOGOUT','users',2,'User Admin SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-24 07:44:03'),
(47,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-24 07:44:44'),
(48,NULL,1,'LOGOUT','users',1,'User Super Admin logout',NULL,NULL,NULL,NULL,'2026-04-24 07:45:09'),
(49,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-24 07:45:28'),
(50,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-25 09:14:52'),
(51,1,2,'UPDATE','instances',1,'Mengupdate logo instansi','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"logo\":\"/uploads/smkn1banjar/logo.jpeg\"}','2026-04-25 09:50:06'),
(52,1,2,'UPDATE','instances',1,'Mengupdate logo instansi','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"logo\":\"/uploads/smkn1banjar/logo.jpg\"}','2026-04-25 09:52:51'),
(53,1,2,'UPDATE','instances',1,'Mengupdate logo instansi','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"logo\":\"/uploads/smkn1banjar/logo.jpeg\"}','2026-04-25 10:12:19'),
(54,1,2,'INSERT','users',18,'Menambahkan petugas: a (!@gmail.com)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"a\",\"email\":\"!@gmail.com\"}','2026-04-25 10:24:40'),
(55,1,2,'DELETE','users',18,'Menghapus petugas: a','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":18,\"instance_id\":1,\"name\":\"a\",\"email\":\"!@gmail.com\",\"password\":\"$2b$10$GjdY8U/.TbFdrg6Hil.8POLSU.328q/XNh0meXmv9TJP/eT6JkS6u\",\"role\":\"petugas\",\"created_at\":\"2026-04-25T10:24:40.000Z\",\"updated_at\":\"2026-04-25T10:24:40.000Z\"}',NULL,'2026-04-25 10:24:51'),
(56,1,2,'LOGOUT','users',2,'User Admin SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-25 10:40:28'),
(57,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-25 10:40:40'),
(58,NULL,1,'LOGOUT','users',1,'User Super Admin logout',NULL,NULL,NULL,NULL,'2026-04-25 10:40:58'),
(59,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-25 10:41:06'),
(60,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-25 11:05:14'),
(61,1,2,'DELETE','guests',4,'Menghapus data kunjungan tamu: Dewi Kartika',NULL,NULL,'{\"id\":4,\"name\":\"Dewi Kartika\",\"institution\":\"CV. Kreatif Abadi\",\"purpose\":\"Interview\",\"employee_id\":1,\"status\":\"pending\",\"check_in_at\":null,\"check_out_at\":null}',NULL,'2026-04-25 11:05:47'),
(62,1,2,'UPDATE','guests',2,'Mengupdate data kunjungan tamu: Siti Rahayu',NULL,NULL,'{\"name\":\"Siti Rahayu\",\"nik\":null,\"institution\":\"Dinas Pendidikan\",\"purpose\":\"Monitoring Sekolah\",\"employee_id\":2,\"status\":\"done\",\"check_in_at\":\"2026-04-21T03:00:00.000Z\",\"check_out_at\":\"2026-04-21T07:00:00.000Z\",\"photo_url\":\"/uploads/smkn1banjar/guests/guest_2_1777118196939.jpeg\"}','{\"name\":\"Siti Rahayu\",\"nik\":null,\"institution\":\"Dinas Pendidikan\",\"purpose\":\"Monitoring Sekolah\",\"employee_id\":2,\"status\":\"done\",\"check_in_at\":\"2026-04-21T03:00\",\"check_out_at\":\"2026-04-21T07:00\",\"photo_url\":\"/uploads/smkn1banjar/guests/guest_2_1777118196939.jpeg\"}','2026-04-25 11:56:39'),
(63,1,2,'LOGOUT','users',2,'User Admin SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-26 23:10:33'),
(64,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-27 06:01:40'),
(65,1,2,'UPDATE','instances',1,'Mengupdate logo instansi','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"logo\":\"/uploads/smkn1banjar/logo.jpg\"}','2026-04-27 06:02:16'),
(66,1,2,'LOGOUT','users',2,'User Admin SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-27 06:04:16'),
(67,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-27 06:04:36'),
(68,1,4,'LOGIN','users',4,'User Petugas SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-27 23:16:24'),
(69,1,4,'LOGOUT','users',4,'User Petugas SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-27 23:26:27'),
(70,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-27 23:26:34'),
(71,NULL,1,'INSERT','users',19,'Menambahkan admin baru: izzel ciputat (izel@gmail.com) untuk instansi SMK Negeri 1 Banjar','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"izzel ciputat\",\"email\":\"izel@gmail.com\",\"instance_id\":\"1\",\"role\":\"admin\"}','2026-04-27 23:27:42'),
(72,NULL,1,'DELETE','users',19,'Menghapus admin: izzel ciputat (izel@gmail.com)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"izzel ciputat\",\"email\":\"izel@gmail.com\",\"instance_id\":1}',NULL,'2026-04-27 23:27:56'),
(73,NULL,1,'LOGOUT','users',1,'User Super Admin logout',NULL,NULL,NULL,NULL,'2026-04-27 23:28:03'),
(74,1,4,'LOGIN','users',4,'User Petugas SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-27 23:28:22'),
(75,1,4,'UPDATE','guests',3,'Checkout tamu: Ahmad Fauzi',NULL,NULL,NULL,'{\"status\":\"done\",\"check_out_at\":\"2026-04-27 23:44:03\"}','2026-04-27 23:44:03'),
(76,1,4,'LOGOUT','users',4,'User Petugas SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-28 01:42:10'),
(77,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-28 01:42:18'),
(78,1,2,'UPDATE','settings',1,'Mengupdate pengaturan QR: mode dynamic, interval 30 menit','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"qr_mode\":\"dynamic\",\"token_interval\":30}','2026-04-28 01:42:30'),
(79,1,2,'UPDATE','instances',1,'Mengupdate logo instansi','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"logo\":\"/uploads/smkn1banjar/logo.jpeg\"}','2026-04-28 01:44:02'),
(80,1,2,'LOGOUT','users',2,'User Admin SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-28 01:44:04'),
(81,1,4,'LOGIN','users',4,'User Petugas SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-28 01:44:12'),
(82,1,4,'UPDATE','guests',9,'Meminta ulang foto untuk tamu: Budi Santoso',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_9_1777345202414.jpg\"}','2026-04-28 03:00:02'),
(83,1,4,'UPDATE','guests',9,'Memvalidasi tamu: Budi Santoso',NULL,NULL,NULL,'{\"status\":\"active\"}','2026-04-28 03:02:22'),
(84,1,4,'UPDATE','guests',10,'Meminta ulang foto untuk tamu: Siti Aminah',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_10_1777345725176.jpg\"}','2026-04-28 03:08:45'),
(85,1,4,'UPDATE','guests',10,'Meminta ulang foto untuk tamu: Siti Aminah',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_10_1777345725156.jpg\"}','2026-04-28 03:08:45'),
(86,1,4,'UPDATE','guests',10,'Menolak tamu: Siti Aminah',NULL,NULL,NULL,'{\"status\":\"rejected\"}','2026-04-28 03:09:02'),
(87,1,4,'UPDATE','guests',13,'Meminta ulang foto untuk tamu: Rizky Ramadhan',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_13_1777346595951.jpg\"}','2026-04-28 03:23:15'),
(88,1,4,'UPDATE','guests',13,'Memvalidasi tamu: Rizky Ramadhan',NULL,NULL,NULL,'{\"status\":\"active\"}','2026-04-28 03:23:26'),
(89,1,4,'UPDATE','guests',14,'Meminta ulang foto untuk tamu: Maya Sari',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_14_1777347381756.jpg\"}','2026-04-28 03:36:21'),
(90,1,4,'UPDATE','guests',13,'Checkout tamu: Rizky Ramadhan',NULL,NULL,NULL,'{\"status\":\"done\",\"check_out_at\":\"2026-04-28 03:47:46\"}','2026-04-28 03:47:46'),
(91,1,4,'UPDATE','guests',15,'Meminta ulang foto untuk tamu: Andi Wijaya',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_15_1777348626778.jpg\"}','2026-04-28 03:57:06'),
(92,1,4,'UPDATE','guests',15,'Memvalidasi tamu: Andi Wijaya',NULL,NULL,NULL,'{\"status\":\"active\"}','2026-04-28 03:57:50'),
(93,1,4,'UPDATE','guests',16,'Meminta ulang foto untuk tamu: Rina Febriana',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_16_1777348713425.jpeg\"}','2026-04-28 03:58:33'),
(94,1,4,'INSERT','guests',24,'Input manual tamu: s',NULL,NULL,NULL,'{\"name\":\"s\",\"nik\":\"a\",\"institution\":\"d\",\"purpose\":\"w\",\"employee_id\":3,\"photo_url\":\"/uploads/smkn1banjar/temp/temp_1777349256232.jpeg\"}','2026-04-28 04:07:45'),
(95,1,4,'UPDATE','guests',17,'Meminta ulang foto untuk tamu: Eko Prasetyo',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_17_1777350768900.jpg\"}','2026-04-28 04:32:48'),
(96,1,4,'UPDATE','guests',17,'Memvalidasi tamu: Eko Prasetyo',NULL,NULL,NULL,'{\"status\":\"active\"}','2026-04-28 04:33:49'),
(97,1,4,'UPDATE','guests',19,'Meminta ulang foto untuk tamu: Dodi Supriadi',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_19_1777354953865.jpg\"}','2026-04-28 05:42:33'),
(98,1,4,'UPDATE','guests',19,'Memvalidasi tamu: Dodi Supriadi',NULL,NULL,NULL,'{\"status\":\"active\"}','2026-04-28 05:42:42'),
(99,1,4,'UPDATE','guests',18,'Meminta ulang foto untuk tamu: Lina Marlina',NULL,NULL,NULL,'{\"photo_url\":\"/uploads/smkn1banjar/guests/guest_18_1777355210314.jpg\"}','2026-04-28 05:46:50'),
(100,1,4,'UPDATE','guests',15,'Checkout tamu: Andi Wijaya',NULL,NULL,NULL,'{\"status\":\"done\",\"check_out_at\":\"2026-04-28 05:47:02\"}','2026-04-28 05:47:02'),
(101,1,4,'LOGOUT','users',4,'User Petugas SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-28 06:06:00'),
(102,1,4,'LOGIN','users',4,'User Petugas SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-28 06:07:44'),
(103,1,NULL,'INSERT','guests',25,'Tamu baru mendaftar: a',NULL,NULL,NULL,'{\"name\":\"a\",\"nik\":\"a\",\"institution\":\"a\",\"purpose\":\"a\",\"employee_id\":1,\"photo_url\":\"/uploads/smkn1banjar/guests/guest_1777362222467.jpeg\"}','2026-04-28 07:43:51'),
(104,1,4,'INSERT','guests',26,'Input manual tamu: a',NULL,NULL,NULL,'{\"name\":\"a\",\"nik\":\"e981223629dfd9681aa7f96bd5dd3fed:45bb2b3b47ef6997bc7cccf968a8a7533c751a45dc09593ac94a18cfcb8ad961\",\"institution\":\"a\",\"purpose\":\"a\",\"employee_id\":3,\"photo_url\":\"/uploads/smkn1banjar/temp/temp_1777363634832.jpg\"}','2026-04-28 08:07:20'),
(105,1,NULL,'INSERT','guests',27,'Tamu baru mendaftar: ramqi dan damnis',NULL,NULL,NULL,'{\"name\":\"ramqi dan damnis\",\"nik\":\"12323454323452\",\"institution\":\"asasaa\",\"purpose\":\"sasasa\",\"employee_id\":1,\"photo_url\":\"/uploads/smkn1banjar/guests/guest_1777364685883.jpg\"}','2026-04-28 08:25:08'),
(106,1,4,'UPDATE','guests',25,'Menolak tamu: a',NULL,NULL,NULL,'{\"status\":\"rejected\"}','2026-04-28 08:26:13'),
(107,1,4,'UPDATE','guests',9,'Checkout tamu: Budi Santoso',NULL,NULL,NULL,'{\"status\":\"done\",\"check_out_at\":\"2026-04-29 00:01:08\"}','2026-04-29 00:01:08'),
(108,1,4,'UPDATE','guests',17,'Checkout tamu: Eko Prasetyo',NULL,NULL,NULL,'{\"status\":\"done\",\"check_out_at\":\"2026-04-29 00:01:10\"}','2026-04-29 00:01:10'),
(109,1,4,'UPDATE','guests',19,'Checkout tamu: Dodi Supriadi',NULL,NULL,NULL,'{\"status\":\"done\",\"check_out_at\":\"2026-04-29 00:01:12\"}','2026-04-29 00:01:12'),
(110,1,4,'UPDATE','guests',26,'Checkout tamu: a',NULL,NULL,NULL,'{\"status\":\"done\",\"check_out_at\":\"2026-04-29 00:01:14\"}','2026-04-29 00:01:14'),
(111,1,4,'UPDATE','guests',27,'Memvalidasi tamu: ramqi dan damnis',NULL,NULL,NULL,'{\"status\":\"active\"}','2026-04-29 00:04:30'),
(112,1,4,'LOGOUT','users',4,'User Petugas SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-29 00:08:30'),
(113,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-29 00:08:37'),
(114,1,2,'LOGOUT','users',2,'User Admin SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-29 00:09:06'),
(115,1,4,'LOGIN','users',4,'User Petugas SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-29 00:09:32'),
(116,1,NULL,'INSERT','guests',28,'Tamu baru mendaftar: Dhanis Fathan Gunawan',NULL,NULL,NULL,'{\"name\":\"Dhanis Fathan Gunawan\",\"nik\":\"1234567890\",\"institution\":\"SMK Negeri 1 Cijurey\",\"purpose\":\"Membahas project\",\"employee_id\":1,\"photo_url\":\"/uploads/smkn1banjar/guests/guest_1777425237704.jpg\"}','2026-04-29 01:14:46'),
(117,1,4,'UPDATE','guests',28,'Memvalidasi tamu: Dhanis Fathan Gunawan',NULL,NULL,NULL,'{\"status\":\"active\"}','2026-04-29 01:19:24'),
(118,1,4,'LOGOUT','users',4,'User Petugas SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-29 02:16:33'),
(119,1,3,'LOGIN','users',3,'User PPID SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-29 02:35:11'),
(120,1,3,'LOGOUT','users',3,'User PPID SMKN 1 Banjar logout',NULL,NULL,NULL,NULL,'2026-04-29 05:08:12'),
(121,1,2,'LOGIN','users',2,'User Admin SMKN 1 Banjar login',NULL,NULL,NULL,NULL,'2026-04-29 05:09:55'),
(122,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-29 13:30:08'),
(123,NULL,1,'INSERT','instances',9,'Menambahkan instansi baru: SMKN 1 Subang (smkn1subang)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"SMKN 1 Subang\",\"slug\":\"smkn1subang\",\"address\":\"disana\",\"phone\":\"0895619037777\",\"subscription_start\":\"2026-04-28\",\"subscription_end\":\"2026-05-29\"}','2026-04-29 13:31:45'),
(124,NULL,1,'INSERT','users',20,'Menambahkan admin baru: admin smkn 1 subang (smkn1subang@gmail.com) untuk instansi SMKN 1 Subang','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',NULL,'{\"name\":\"admin smkn 1 subang\",\"email\":\"smkn1subang@gmail.com\",\"instance_id\":\"9\",\"role\":\"admin\"}','2026-04-29 13:32:31'),
(125,NULL,1,'UPDATE','users',20,'Mengupdate admin: admin smkn 1 subang (password direset)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"admin smkn 1 subang\",\"email\":\"smkn1subang@gmail.com\",\"instance_id\":9}','{\"password_reset\":true}','2026-04-29 13:32:52'),
(126,NULL,1,'UPDATE','users',15,'Mengupdate admin: Isa Azhari (password direset)','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"name\":\"Isa Azhari\",\"email\":\"isaazari@gmail.com\",\"instance_id\":6}','{\"password_reset\":true}','2026-04-29 13:34:49'),
(127,NULL,1,'LOGOUT','users',1,'User Super Admin logout',NULL,NULL,NULL,NULL,'2026-04-29 13:37:22'),
(128,NULL,1,'LOGIN','users',1,'User Super Admin login',NULL,NULL,NULL,NULL,'2026-04-29 13:39:11'),
(129,NULL,1,'UPDATE','instances',8,'Mengupdate instansi: aasasa','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36','{\"id\":8,\"name\":\"aasasa\",\"slug\":\"sasa\",\"address\":\"saas\",\"phone\":\"assa\",\"logo\":null,\"is_active\":1,\"created_at\":\"2026-04-22T23:20:58.000Z\",\"updated_at\":\"2026-04-22T23:20:58.000Z\",\"subscription_start\":\"2026-04-21T17:00:00.000Z\",\"subscription_end\":\"2026-04-29T17:00:00.000Z\",\"subscription_status\":\"active\"}','{\"name\":\"aasasa\",\"slug\":\"sasa\",\"address\":\"saas\",\"phone\":\"assa\",\"subscription_start\":\"2026-04-21\",\"subscription_end\":\"2026-04-27\"}','2026-04-29 13:42:09');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `nik` varchar(100) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guests`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `guests` WRITE;
/*!40000 ALTER TABLE `guests` DISABLE KEYS */;
INSERT INTO `guests` VALUES
(28,1,1,4,'Dhanis Fathan Gunawan','1234567890','SMK Negeri 1 Cijurey','Membahas project','/uploads/smkn1banjar/guests/guest_1777425237704.jpg','active','2026-04-29 01:19:24',NULL,'2026-04-28 18:14:46','2026-04-29 01:19:24');
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
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `subscription_start` date DEFAULT NULL,
  `subscription_end` date DEFAULT NULL,
  `subscription_status` enum('active','expired','trial') DEFAULT 'trial',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `instances` WRITE;
/*!40000 ALTER TABLE `instances` DISABLE KEYS */;
INSERT INTO `instances` VALUES
(1,'SMK Negeri 1 Banjar','smkn1banjar','Jl. Raya Banjar, Banjar, Jawa Barat','0265123456','/uploads/smkn1banjar/logo.jpeg',1,'2026-04-15 13:23:12','2026-04-28 01:44:02','2026-04-22','2026-05-22','active'),
(2,'SMA Negeri 1 Jakarta','sman1jakarta','Jl. Medan Merdeka No.1, Jakarta Pusat','0211234567',NULL,1,'2026-04-15 13:23:12','2026-04-22 10:46:06','2026-04-22','2026-05-22','active'),
(3,'Universitas Genjot Makima','ugm','Jl. Bulaksumur No.1, Yogyakarta','0274123456',NULL,1,'2026-04-15 13:23:12','2026-04-22 23:28:52','2026-04-21','2026-05-21','active'),
(6,'SMA Negeri 1 Banjar','sman1banjar','Jl. K.H. Mustofa No.1, Banjar, Banjar City, West Java 46311, Indonesia','0265212233',NULL,1,'2026-04-22 05:51:25','2026-04-22 10:46:06','2026-04-22','2026-05-22','active'),
(8,'aasasa','sasa','saas','assa',NULL,1,'2026-04-22 23:20:58','2026-04-29 13:42:09','2026-04-21','2026-04-27','expired'),
(9,'SMKN 1 Subang','smkn1subang','disana','0895619037777',NULL,1,'2026-04-29 13:31:45','2026-04-29 13:31:45','2026-04-28','2026-05-29','active');
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
  `setting_key` varchar(100) DEFAULT NULL,
  `setting_value` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  CONSTRAINT `1` FOREIGN KEY (`instance_id`) REFERENCES `instances` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES
(1,1,'dynamic',30,'2026-04-15 13:23:12','2026-04-28 02:15:01',NULL,NULL),
(2,2,'static',NULL,'2026-04-15 13:23:12','2026-04-15 13:23:12',NULL,NULL),
(3,3,'dynamic',15,'2026-04-15 13:23:12','2026-04-15 13:23:12',NULL,NULL),
(6,6,'static',NULL,'2026-04-22 05:51:25','2026-04-22 05:51:25',NULL,NULL),
(8,8,'static',NULL,'2026-04-22 23:20:58','2026-04-22 23:20:58',NULL,NULL),
(9,9,'static',NULL,'2026-04-29 13:31:45','2026-04-29 13:31:45',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
(8,3,'PPID UGM','ppid@ugm.ac.id','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','ppid','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(9,3,'Petugas UGM','petugas@ugm.ac.id','$2b$10$PPeipKZLZfcW8okiIGn7ieIIukJnk0HJyTTXbUuCa.qmYkxRjo672','petugas','2026-04-15 13:23:12','2026-04-16 01:24:50'),
(15,6,'Isa Azhari','isaazari@gmail.com','$2b$10$AypJMMcizQy1zVrDsMY/K.KhqJhQLA7vSrHBGmGdZArFlMH7SMk7i','admin','2026-04-22 05:54:27','2026-04-29 13:34:49'),
(20,9,'admin smkn 1 subang','smkn1subang@gmail.com','$2b$10$P6Q/0RidkSBFoBSMPapBReCzVhZxubLKepNklYElma8X/p.MzdmXu','admin','2026-04-29 13:32:31','2026-04-29 13:32:52');
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

-- Dump completed on 2026-04-29 20:45:47
