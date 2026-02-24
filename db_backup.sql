-- MySQL dump 10.13  Distrib 8.4.7, for Linux (x86_64)
--
-- Host: localhost    Database: laravel
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-hanako@test|172.18.0.1','i:1;',1768216717),('laravel-cache-hanako@test|172.18.0.1:timer','i:1768216717;',1768216717),('laravel-cache-kyoko@test|172.18.0.1','i:1;',1770106899),('laravel-cache-kyoko@test|172.18.0.1:timer','i:1770106899;',1770106899),('temotto-cache-hanako@test|172.18.0.1','i:1;',1771585223),('temotto-cache-hanako@test|172.18.0.1:timer','i:1771585223;',1771585223),('temotto-cache-kyoko@test|172.18.0.1','i:1;',1771306871),('temotto-cache-kyoko@test|172.18.0.1:timer','i:1771306871;',1771306871);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `care_records`
--

DROP TABLE IF EXISTS `care_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `care_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_id` bigint unsigned DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_temp` decimal(4,1) DEFAULT NULL,
  `blood_pressure_high` int DEFAULT NULL,
  `blood_pressure_low` int DEFAULT NULL,
  `water_intake` int DEFAULT NULL,
  `spo2` int DEFAULT NULL COMMENT 'SpO2(%)',
  `recorded_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recorded_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `care_records_client_id_foreign` (`client_id`),
  KEY `care_records_schedule_id_foreign` (`schedule_id`),
  CONSTRAINT `care_records_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `care_records_schedule_id_foreign` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `care_records`
--

LOCK TABLES `care_records` WRITE;
/*!40000 ALTER TABLE `care_records` DISABLE KEYS */;
INSERT INTO `care_records` VALUES (1,'A001',NULL,'うどんを買った',36.8,123,78,200,NULL,'kyo','2025-12-01 10:42:00','2025-12-29 22:42:46','2026-01-01 16:13:19'),(2,'A001',NULL,'うどんを完食しました',36.7,123,87,120,NULL,'kyo','2025-12-28 11:35:00','2025-12-29 23:36:23','2025-12-29 23:36:23'),(3,'A001',NULL,'咳と発熱と風邪症状あり要観察',37.8,145,90,300,NULL,'kyo','2025-12-29 11:46:00','2025-12-29 23:47:19','2026-01-01 15:35:36'),(4,'A001',NULL,'食事の少し前から元気がない様子だった。 今日の献立は好みのメニューではなく、ほとんど箸をつけられません。体調不良ではなく嗜好の問題のため、無理強いはせずに様子を見ることにしました。',36.8,123,89,123,NULL,'kyo','2025-12-16 12:00:00','2026-01-01 14:18:43','2026-01-01 14:18:43'),(5,'A001',NULL,'普段から食事をよく噛まずに飲み込んでしまうことが多いようで、そのためむせ込んでしまうことがある。なるべく職員が近くにいるようにして、ゆっくり食べることと、口に詰め込み過ぎないように声かけを行う。今後も、むせ混むことが多いようであれば、食事形態の変更も必要と思われる。',36.7,145,120,100,NULL,'kyo','2025-12-17 10:00:00','2026-01-01 14:20:32','2026-01-01 14:20:32'),(6,'A001',NULL,'検温すると平熱より高かったため、看護師に報告し本日の入浴は中止した。',37.9,123,89,200,NULL,'kyo','2025-12-19 11:00:00','2026-01-01 14:21:38','2026-01-01 14:21:38'),(7,'A001',NULL,'便意をもよおして、トイレに行こうとされるも、場所がわからなくなってしまうので、職員が声かけ、誘導し排泄した。',37.0,110,77,120,NULL,'kyo','2025-12-19 11:00:00','2026-01-01 14:23:09','2026-01-01 14:23:09'),(8,'A001',NULL,'ポータブルトイレでなんとか自力で排泄することが出来た。ポータブルトイレの後始末は職員が行った。',36.8,123,78,120,NULL,'kyo','2025-12-21 11:00:00','2026-01-01 14:24:43','2026-01-01 14:24:43'),(9,'A001',NULL,'昨晩より高熱がつつく、倦怠感が強く食事もとれていない状況。\n娘さんに相談してかかりつけ医の井上内科クリニックを受診。\nインフルエンザA型要請との診断となり足元がふらついている為2,3日の入院となった。',38.9,145,110,65,NULL,'kyo','2025-12-25 10:00:00','2026-01-01 15:08:16','2026-01-03 14:19:07'),(10,'A001',NULL,'血圧が高めだったので入浴は停止してお風呂で清拭を行った。',36.9,145,115,230,NULL,'kyo','2025-12-17 12:00:00','2026-01-03 14:20:20','2026-01-03 14:20:20'),(11,'A001',NULL,'今日は体調もよく食事を完食されました',36.9,134,111,120,NULL,'kyo','2025-12-20 11:00:00','2026-01-03 16:05:34','2026-01-03 16:05:34'),(12,'A002',NULL,'雪が降っているのを外から見たいとのことなので窓際まで介助をしながらしばらく眺めていました。',36.9,134,99,100,NULL,'kyo','2026-01-04 15:02:00','2026-01-11 15:04:18','2026-01-11 15:04:18'),(13,'A001',NULL,'テスト',36.8,144,79,120,NULL,'kyo','2026-01-11 17:21:00','2026-01-11 17:21:59','2026-01-11 17:21:59'),(14,'A001',NULL,'チェックテスト',3.8,144,134,300,NULL,'kyo','2026-01-12 11:23:00','2026-01-11 17:23:31','2026-01-11 17:23:31'),(15,'A001',3,'入浴介助、バイタル確認',36.0,155,109,111,NULL,'kyo','2026-01-11 17:00:00','2026-01-11 17:36:31','2026-01-11 17:36:31'),(16,'A001',4,'血圧が高めなので、ヒートショックにならなように入浴介助を行った',36.8,178,89,0,NULL,'kyo','2026-01-12 17:27:00','2026-01-12 17:28:33','2026-01-12 17:28:33'),(17,'A001',NULL,'様子未入力',36.5,120,80,NULL,NULL,'担当スタッフ','2026-02-04 16:33:00','2026-02-04 16:33:54','2026-02-04 16:33:54'),(18,'A001',NULL,'様子:血圧値に異常の可能性あり、要確認',NULL,90,NULL,NULL,NULL,'担当スタッフ','2026-02-04 17:05:00','2026-02-04 17:06:00','2026-02-04 17:06:00'),(19,'A001',NULL,'発熱のため入浴中止、かかりつけ医受診',38.2,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 17:07:00','2026-02-04 17:07:54','2026-02-04 17:07:54'),(20,'A001',NULL,'体温36.8℃。食欲低下が見受けられたため、食事内容について伺ったところ、義歯の痛みがある旨の訴えが聞かれた。これを受け、翌日、歯科医の受診予約が手配されることとなった。',NULL,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 17:17:00','2026-02-04 17:17:10','2026-02-04 17:17:10'),(21,'A001',NULL,'体温37.3℃が測定され、微熱が認められる。そのため、本日の入浴介助は中止される。利用者Aより「少し体がだるい」との訴えが聞かれる。冷たいアイスを提供したところ、「おいしい」と発言され、半分摂取される。夕方以降に発熱が認められることがあるため、申し送りが実施される。',NULL,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 17:23:00','2026-02-04 17:23:41','2026-02-04 17:23:41'),(22,'A001',NULL,'体温35.6℃、血圧90/124mmHgが測定される。本日は寒さが感じられるため、排泄介助は居室にて実施される。浴室の寒さを理由に、本日の入浴は中止される。利用者Aからは、翌日のデイサービスにて入浴する旨の発言が聞かれる。',NULL,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 17:27:00','2026-02-04 17:28:00','2026-02-04 17:28:00'),(23,'A001',NULL,'体温は36.6℃、血圧は90/123mmHgで測定されました。咳と鼻水の風邪症状が継続されているとのことです。熱は認められず、ご本人は元気なご様子で過ごされています。',36.6,90,123,NULL,NULL,'担当スタッフ','2026-02-04 17:39:00','2026-02-04 17:39:27','2026-02-04 17:39:27'),(24,'A001',NULL,'本日、お孫様の成人式の写真を見せてくださり、とても楽しそうにお話をされていました。先日まで食欲が低下されていましたが、本日はおやつも召し上がられていました。',36.9,90,111,120,NULL,'担当スタッフ','2026-02-04 17:45:00','2026-02-04 17:45:50','2026-02-04 17:45:50'),(25,'A001',NULL,'体温が37.9℃でした。',37.9,NULL,NULL,234,NULL,'担当スタッフ','2026-02-04 18:45:00','2026-02-04 18:46:21','2026-02-04 18:46:21'),(26,'A001',NULL,'体温は37.5℃、血圧は125/89mmHgと測定されました。喉の痛みがあるご様子で、食事はおかゆを3口摂取され、ポカリスエットを110ml飲まれました。夜間に発熱の可能性が考えられますため、娘様には早めにご帰宅いただくよう、お電話にてご連絡いたしました。',37.5,125,89,110,NULL,'担当スタッフ','2026-02-04 20:17:00','2026-02-04 20:17:46','2026-02-04 20:17:46'),(27,'A001',NULL,'体温は36.7℃と測定されました。汁物を摂取される際にむせ込まれるため、飲みたくないとのご意向が示されました。',36.7,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 20:30:00','2026-02-04 20:30:32','2026-02-04 20:30:32'),(28,'A001',NULL,'体温は36.9℃、血圧は66/100mmHgと測定されました。デイサービスでの出来事について、たくさんお話ししてくださいました。',36.9,66,100,NULL,NULL,'担当スタッフ','2026-02-04 20:36:00','2026-02-04 20:36:46','2026-02-04 20:36:46'),(29,'A001',NULL,'排泄介助が実施されました。',NULL,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 20:45:00','2026-02-04 20:45:36','2026-02-04 20:45:36'),(30,'A001',NULL,'ケア記録で入力した',36.8,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-05 20:46:00','2026-02-04 20:47:01','2026-02-04 20:47:01'),(31,'A001',NULL,'血圧が20/123mmHgであったとのことです。',NULL,20,123,NULL,NULL,'担当スタッフ','2026-02-04 20:50:00','2026-02-04 20:50:48','2026-02-04 20:50:48'),(32,'A001',NULL,'体温38.0℃、血圧99/155mmHgと測定されました。昨日から発熱があったとのことですが、徐々に熱が上がってきているご様子です。',38.0,99,155,NULL,NULL,'担当スタッフ','2026-02-04 20:57:00','2026-02-04 20:57:32','2026-02-04 20:57:32'),(33,'A001',NULL,'体温が37.9℃と測定され、高熱が継続されているとのことです。',37.9,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 21:00:00','2026-02-04 21:00:29','2026-02-04 21:00:29'),(34,'A001',NULL,'体温は36.0℃と測定されました。うどんを完食されました。',36.0,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 21:03:00','2026-02-04 21:03:45','2026-02-04 21:03:45'),(35,'A001',NULL,'体温が36.7℃と測定されました。おむつの交換が実施されました。',36.7,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-04 22:51:00','2026-02-04 22:51:57','2026-02-04 22:51:57'),(36,'A001',NULL,'体温が36.7℃と測定されました。おむつの交換が実施されました。',36.7,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-05 14:07:00','2026-02-05 14:07:16','2026-02-05 14:07:16'),(37,'A001',NULL,'布団が干されました。',NULL,110,333,NULL,NULL,'担当スタッフ','2026-02-05 14:54:00','2026-02-05 14:54:23','2026-02-05 14:54:23'),(38,'A001',NULL,'体温が36.8℃と測定され、ケア記録に入力されました。',36.8,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-05 18:39:00','2026-02-05 18:39:15','2026-02-05 18:39:15'),(39,'A001',NULL,'体温36.9℃でした。主食、副食ともに完食されました。',36.9,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-05 23:07:00','2026-02-05 23:07:25','2026-02-05 23:07:25'),(40,'A001',NULL,'本日、血圧90-100mmHgとのご報告がございました。ご機嫌よくお過ごしのご様子で、昔お勤めになっていた工場のお話をたくさんお聞かせくださいました。',NULL,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-05 23:12:00','2026-02-05 23:12:41','2026-02-05 23:12:41'),(41,'A001',NULL,'うどんを完食されました。',36.7,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-10 20:22:00','2026-02-10 20:22:25','2026-02-10 20:22:25'),(42,'A001',NULL,'本日のバイタル計測で体温37.7度であった。ご本人に確認すると2/1より微熱と倦怠感が続いているとのこと。排泄は変わりないが食欲は6割程度であり、喉が渇いている様子なので、かかりつけ医「佐藤内科クリニック」に午後から娘さんと受診されることとなった。結果出次第、ご連絡をいただけることになりました。',37.5,112,145,110,NULL,'担当スタッフ','2026-02-03 09:41:00','2026-02-12 14:46:54','2026-02-12 14:46:54'),(43,'A001',NULL,'高熱がありました',38.9,NULL,NULL,0,NULL,'担当スタッフ','2026-02-16 10:00:00','2026-02-15 19:47:51','2026-02-15 19:47:51'),(44,'A001',NULL,'高熱が続いており、血圧も高値であったため、かかりつけ医へ連絡し、受診いたしました。',38.2,110,156,NULL,NULL,'担当スタッフ','2026-02-16 11:36:00','2026-02-16 11:37:00','2026-02-16 11:37:00'),(45,'A001',NULL,'高熱が続いている',38.4,NULL,NULL,NULL,NULL,'担当スタッフ','2026-02-16 12:00:00','2026-02-16 17:49:57','2026-02-16 17:49:57'),(51,'A001',NULL,'体調はよさそう',36.8,120,156,33,98,'kyo','2026-02-16 11:00:00','2026-02-16 22:12:55','2026-02-16 22:12:55'),(54,'A001',NULL,'インフルエンザは陰性でした',38.9,123,90,100,98,'kyo','2026-02-17 11:00:00','2026-02-17 12:10:31','2026-02-17 12:10:31'),(55,'A001',10,'血圧が高くて頭痛がするとのことでした。かかりつけ医に相談し明日受診予定です',36.8,119,167,10,92,'kyo','2026-02-17 16:00:00','2026-02-17 20:13:56','2026-02-17 20:13:56'),(56,'A001',NULL,'本日、散歩のご案内時に紙パンツのご使用についてご説明いたしました。当初はご納得いただけないご様子でしたが、奥様へサンプルをお渡しし、ご検討いただけますようお願いいたしました。',36.5,90,113,NULL,NULL,'kyo','2026-02-17 23:06:00','2026-02-17 23:06:45','2026-02-17 23:06:45'),(57,'A001',NULL,'昨日より水分を摂取できておらず便秘している',38.9,111,166,11,98,'kyo','2026-02-20 11:12:00','2026-02-20 19:51:57','2026-02-20 19:52:51'),(58,'A001',NULL,'発熱があり、かかりつけ医に連絡して往診に来ていただきました',38.0,90,145,12,92,'kyo','2026-02-20 20:20:00','2026-02-20 21:37:43','2026-02-20 21:37:43'),(59,'A001',NULL,'本日、利用者A様より「今日は寒いのでお風呂に入りたくない」とのご発言がありましたため、本日のご入浴は中止とし、清拭にて身体を清潔に保ち、着替えの介助を実施させていただきました。SPO2は98%でした。',NULL,NULL,NULL,NULL,NULL,'kyo','2026-02-20 21:48:00','2026-02-20 21:49:16','2026-02-20 21:49:16'),(60,'A001',NULL,'主食9割、副食8割を完食されました。',36.9,90,123,110,98,'kyo','2026-02-21 11:50:00','2026-02-21 11:51:03','2026-02-21 11:51:03'),(61,'A001',NULL,'体温は36.8℃、SPO2は97%でした。汁物のおかずを美味しく完食され、水分摂取量は200mlでした。',36.8,NULL,NULL,200,97,'kyo','2026-02-21 12:00:00','2026-02-21 12:00:51','2026-02-21 12:00:51'),(62,'A001',NULL,'体温は36.8℃でした。うどんを完食されました。',36.8,NULL,NULL,NULL,NULL,'kyo','2026-02-21 13:09:00','2026-02-21 13:09:03','2026-02-21 13:09:03'),(63,'A001',NULL,'体温が36.7℃と測定されました。その他の具体的な状況の記載はございませんでした。',36.7,NULL,NULL,NULL,NULL,'kyo','2026-02-21 13:56:00','2026-02-21 13:56:49','2026-02-21 13:56:49'),(64,'A001',NULL,'今日は認定更新手続きについて長男の〇〇さんにご説明しました',36.8,123,90,223,98,'kyo','2026-02-21 11:00:00','2026-02-21 14:15:46','2026-02-21 14:15:46'),(65,'A001',NULL,'本日、体温37.8℃、血圧90/145mmHgと測定されました。体温が高値であるため、本日のご入浴は中止いたしました。看護師へ連絡し、かかりつけ医による往診を手配しております。',37.8,90,145,NULL,NULL,'kyo','2026-02-21 17:51:00','2026-02-21 17:51:32','2026-02-21 17:51:32'),(66,'A001',NULL,'体温が36.7℃と測定されました。',36.7,NULL,NULL,NULL,NULL,'kyo','2026-02-22 14:59:00','2026-02-22 14:59:17','2026-02-22 14:59:17'),(67,'A001',NULL,'体温35.7℃でした。',35.7,NULL,NULL,NULL,NULL,'kyo','2026-02-22 15:22:00','2026-02-22 15:22:42','2026-02-22 15:22:42'),(68,'A001',NULL,'3333',36.9,111,90,12,90,'kyo','2026-02-10 11:00:00','2026-02-22 15:25:47','2026-02-22 15:25:47'),(69,'A001',NULL,'主食9割、副食8割を完食されました。',36.9,90,123,NULL,98,'kyo','2026-02-22 15:42:00','2026-02-22 15:42:40','2026-02-22 15:42:40'),(70,'A001',NULL,'うどんを完食されました。',36.7,123,87,NULL,NULL,'kyo','2026-02-22 15:57:00','2026-02-22 15:57:20','2026-02-22 15:57:20'),(71,'A001',NULL,'今朝から発熱38.9となっている。咳も出ておりインフルエンザの疑いもあるためかかりつけ医を受診した。',38.9,120,90,190,96,'kyo','2026-02-22 11:00:00','2026-02-22 16:03:51','2026-02-22 16:03:51'),(72,'A001',NULL,'体温36.8℃と測定されました。その他の具体的な状況の記載はございませんでした。',36.8,NULL,NULL,NULL,NULL,'kyo','2026-02-22 16:04:00','2026-02-22 16:04:54','2026-02-22 16:04:54'),(73,'A001',NULL,'体温36.8℃、血圧90/123mmHgでした。',36.8,90,123,NULL,NULL,'kyo','2026-02-22 16:10:00','2026-02-22 16:11:07','2026-02-22 16:11:07'),(74,'A001',NULL,'うどんを買った',36.8,123,78,NULL,NULL,'kyo','2026-02-22 16:24:00','2026-02-22 16:24:21','2026-02-22 16:24:21'),(75,'A002',NULL,'333',36.9,123,10,123,98,'kyo','2026-02-22 16:33:00','2026-02-22 16:33:35','2026-02-22 16:33:35'),(76,'A001',NULL,'333',36.8,123,98,123,98,'kyo','2026-02-22 16:35:00','2026-02-22 16:36:10','2026-02-22 16:36:10'),(77,'A002',NULL,'本日体重測定を実施し、1kg増加していた。利用者からは、入れ歯を直してから食事がおいしいからだと話があった。',36.7,NULL,NULL,NULL,NULL,'kyo','2026-02-22 16:43:00','2026-02-22 16:43:58','2026-02-22 16:43:58');
/*!40000 ALTER TABLE `care_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `office_id` bigint unsigned DEFAULT NULL,
  `client_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postcode` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_tel` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `insurace_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `care_start_date` date DEFAULT NULL,
  `care_end_date` date DEFAULT NULL,
  `care_manager` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `care_manager_tel` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clients_office_id_foreign` (`office_id`),
  CONSTRAINT `clients_office_id_foreign` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES ('A0003',1,'利用者　虎次郎','8120002','福岡県福岡市博多区空港前2-1','090-7777-8888','1234567890','2025-10-01','2026-09-30','田中ケアマネ','090-9999-2222','2026-01-03 14:20:59','2026-01-03 14:20:59'),('A001',1,'田中　太郎','8000001','北九州市戸畑区中原新町2-1','000-111-2222','0123456789','2025-01-01','2026-10-31','田中ケアマネジャー','090-2222-3333','2025-12-29 21:42:57','2026-01-12 22:23:04'),('A002',1,'介護　イサオ','8000001','bhogqh','000-222-2222','1234567890','2025-07-01','2026-06-30','田中ケアマネジャー','090-333-4444','2026-01-01 13:59:43','2026-01-01 13:59:43'),('A003',1,'介護　次郎','8040003','福岡県北九州市戸畑区中原新町','092-111-3333','0987654321','2025-10-01','2026-09-30','田中ケアマネジャー','090-5555-3333','2026-01-11 11:33:18','2026-01-11 11:33:18'),('A0092',1,'介護　テスト','8020017','福岡県北九州市小倉北区明和町','090-8888-3333','12345667890','2025-12-01','2026-02-21','田中ケアマネ44','090-3333-2222','2026-02-17 12:15:59','2026-02-17 13:21:53'),('A010',1,'介護　シロウ','8020017','福岡県北九州市小倉北区明和町','090-2222-3333','1234567890','2025-10-01','2025-12-31','田中ケアマネジャー','090-3333--3333','2026-01-12 22:00:45','2026-01-12 22:05:29');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (19,'0001_01_01_000000_create_users_table',1),(20,'0001_01_01_000001_create_cache_table',1),(21,'0001_01_01_000002_create_jobs_table',1),(22,'2025_12_28_140201_create_personal_access_tokens_table',1),(23,'2025_12_28_150339_create_care_tables',1),(24,'2025_12_28_161951_add_vitals_to_care_records_table',1),(25,'2025_12_29_143926_create_offices_table',1),(26,'2025_12_29_144833_add_office_id_to_users_and_clients_table',1),(27,'2025_12_29_202847_add_details_to_clients_table',1),(28,'2025_12_29_222248_add_vitals_to_care_records_table',2),(29,'2026_01_11_140841_create_schedules_table',3),(30,'2026_01_11_155345_add_schedule_id_to_records_table',4),(31,'2026_02_16_212303_add_spo2_to_care_records_table',5),(32,'2026_02_17_143728_add_user_id_to_schedules_table',6),(33,'2026_02_17_151705_add_is_task_to_schedules_table',7),(34,'2026_02_17_160346_add_is_task_to_schedules_table',8),(35,'2026_02_17_184218_add_is_confirmed_to_schedules_table',9),(36,'2026_02_20_194435_create_staff_messages_table',10);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offices`
--

DROP TABLE IF EXISTS `offices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postcode` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tel` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offices`
--

LOCK TABLES `offices` WRITE;
/*!40000 ALTER TABLE `offices` DISABLE KEYS */;
INSERT INTO `offices` VALUES (1,'テスト介護事業所','8040003','福岡県北九州市小倉北区','093-000-0000','2025-12-29 21:24:57','2026-01-11 11:30:41');
/*!40000 ALTER TABLE `offices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_task` tinyint(1) NOT NULL DEFAULT '1',
  `is_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `schedules_client_id_foreign` (`client_id`),
  KEY `schedules_user_id_foreign` (`user_id`),
  CONSTRAINT `schedules_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedules_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (1,1,'care','A002','A002: 介護　イサオ様ケア','訪問介護(清拭)',1,0,'2026-01-11 11:00:00','2026-01-11 12:00:00','#007bff','2026-01-11 15:01:08','2026-02-17 16:11:48'),(3,1,'care','A001','A001: 田中　太郎様ケア','入浴介助、バイタル確認',1,0,'2026-01-11 17:00:00','2026-01-11 18:00:00','#007bff','2026-01-11 17:06:41','2026-02-17 16:11:48'),(4,1,'care','A001','田中　太郎','身体介助',1,0,'2026-01-12 17:27:00','2026-01-12 18:27:00','#28a745','2026-01-12 17:27:39','2026-02-17 16:11:48'),(5,1,'work',NULL,'会議','会議',1,0,'2026-02-06 10:00:00','2026-02-06 11:00:00','#007bff','2026-02-05 21:49:57','2026-02-17 16:11:48'),(6,1,'care','A001','田中　太郎','入浴介助',1,0,'2026-02-16 10:00:00','2026-02-16 11:30:00','#28a745','2026-02-17 13:33:55','2026-02-17 16:11:48'),(9,1,'work',NULL,'カンファレンス','カンファレンス',1,0,'2026-02-17 16:00:00','2026-02-16 17:30:00','#007bff','2026-02-17 14:41:45','2026-02-17 16:11:48'),(10,1,'care','A001','田中　太郎','入浴介助',1,0,'2026-02-17 16:00:00','2026-02-17 17:00:00','#28a745','2026-02-17 14:49:28','2026-02-17 14:49:28'),(11,11,'work',NULL,'社内研修','社内研修',1,0,'2026-02-17 19:20:00','2026-02-17 19:40:00','#007bff','2026-02-17 16:13:43','2026-02-17 16:13:43'),(12,1,'work',NULL,'田中さんに電話','田中さんに電話',1,1,'2026-02-17 09:20:00','2026-02-17 09:25:00','#007bff','2026-02-17 16:20:14','2026-02-17 19:38:25'),(13,1,'work',NULL,'あああ','あああ',1,0,'2026-02-17 00:50:00','2026-02-17 01:50:00','#007bff','2026-02-18 00:50:52','2026-02-18 00:50:52'),(14,1,'care','A001','田中　太郎','通院介助',1,0,'2026-02-18 11:00:00','2026-02-18 12:00:00','#28a745','2026-02-18 11:59:19','2026-02-18 11:59:19'),(15,1,'work',NULL,'朝活','朝活',0,0,'2026-02-19 08:45:00','2026-02-19 09:00:00','#007bff','2026-02-19 14:55:23','2026-02-19 14:55:23'),(16,1,'care','A001','田中　太郎','排泄介助',1,0,'2026-02-19 17:00:00','2026-02-19 18:00:00','#28a745','2026-02-19 14:56:33','2026-02-19 14:56:33'),(17,1,'care','A001','田中　太郎','食事介助',1,0,'2026-02-20 17:30:00','2026-02-20 18:30:00','#28a745','2026-02-20 19:53:46','2026-02-20 19:53:46'),(18,11,'work',NULL,'カンファレンス','カンファレンス',1,0,'2026-02-20 22:20:00','2026-02-20 23:20:00','#007bff','2026-02-20 22:17:41','2026-02-20 22:17:41'),(19,1,'care','A001','田中　太郎','入浴、食事、排泄介助',1,0,'2026-02-21 16:00:00','2026-02-21 17:00:00','#28a745','2026-02-21 14:14:14','2026-02-21 14:14:14'),(20,1,'work',NULL,'カンファレンス','カンファレンス',1,0,'2026-02-22 18:20:00','2026-02-22 19:20:00','#007bff','2026-02-22 16:45:06','2026-02-22 16:45:06');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('k3yDxTbsaOino487efQIAvZD1hfxG9hscScVjWIT',1,'172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiWXE2ZHZUOUlHNUdNVVhncTNlR29kQUoyaW8xY205SENuUEdOWU5YMyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDg6Imh0dHA6Ly9sb2NhbGhvc3Qvd2ViLWFwaS9zdGFmZi1jaGF0L3VucmVhZC1jb3VudCI7czo1OiJyb3V0ZSI7Tjt9czozOiJ1cmwiO2E6MDp7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==',1771749823);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_messages`
--

DROP TABLE IF EXISTS `staff_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sender_id` bigint unsigned NOT NULL,
  `receiver_id` bigint unsigned DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_messages_sender_id_foreign` (`sender_id`),
  KEY `staff_messages_receiver_id_foreign` (`receiver_id`),
  CONSTRAINT `staff_messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `staff_messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_messages`
--

LOCK TABLES `staff_messages` WRITE;
/*!40000 ALTER TABLE `staff_messages` DISABLE KEYS */;
INSERT INTO `staff_messages` VALUES (1,1,2,'田中さんが微熱があるので入浴停止しています',NULL,0,'2026-02-20 19:46:42','2026-02-20 19:46:42'),(2,11,1,NULL,'chat_images/1ypwT7HhyYY8fOV3MLANyZdt7zRr5pa8UiQPWBOR.png',1,'2026-02-20 20:01:36','2026-02-20 22:01:10'),(3,11,1,'書籍をここに保存しています',NULL,1,'2026-02-20 20:02:08','2026-02-20 22:01:10'),(4,11,1,'カンファレンスは20時からになりました',NULL,1,'2026-02-20 22:18:21','2026-02-20 22:18:46'),(5,11,1,'田中さんの娘さんから伝言です。\r\nおむつのｻﾝﾌﾟﾙを次回見たいです',NULL,1,'2026-02-20 22:27:24','2026-02-20 22:27:40'),(6,1,NULL,'今日の18時より全体会議です',NULL,0,'2026-02-20 22:28:19','2026-02-20 22:28:19'),(7,11,NULL,'各自PCを持参ください',NULL,0,'2026-02-21 14:17:12','2026-02-21 14:17:12'),(8,11,1,'施設長より17時からミーティングとのことです第一会議室です',NULL,1,'2026-02-21 14:17:58','2026-02-21 14:18:18'),(9,1,NULL,'今日のカンファレンスの時間は18:00からです',NULL,0,'2026-02-22 17:01:25','2026-02-22 17:01:25'),(10,11,1,'ありがとう💓',NULL,1,'2026-02-22 17:02:04','2026-02-22 17:02:26'),(11,11,1,'👍',NULL,1,'2026-02-22 17:02:05','2026-02-22 17:02:26'),(12,11,NULL,'第二会議室からミーティングルームに変更です',NULL,0,'2026-02-22 17:06:03','2026-02-22 17:06:03'),(13,1,NULL,'🙇',NULL,0,'2026-02-22 17:22:36','2026-02-22 17:22:36');
/*!40000 ALTER TABLE `staff_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `office_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_office_id_foreign` (`office_id`),
  CONSTRAINT `users_office_id_foreign` FOREIGN KEY (`office_id`) REFERENCES `offices` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'kyo','kyoukonomura@emsystems.co.jp',NULL,'$2y$12$OjCP5Hf675a5hCfnih/NLuQdDz8c9q7qdYDtXfVg1fiaHTb5wb/uy','CsnqdPSxKaSBmcMkb48WbuLUXpg8NfzPAFY4BefUZJ8iYtA9H8DtjqDGVYDK','2025-12-29 21:09:18','2026-01-03 15:03:20'),(2,1,'職員　ハナコ','hanako@co.jp',NULL,'$2y$12$og.mJ7jxtT0m2YNnuoP8J.2E8YlrcmVvJpuOz4I/2DGzTeUOzcZXW',NULL,'2026-01-02 16:23:35','2026-01-02 16:23:35'),(11,1,'職員　タロウ','taro@test',NULL,'$2y$12$VpMcJJOjZ47I00D3eEjuVuVuq11lAMMPOucaYucpYAPuK60MjDT/W',NULL,'2026-01-11 11:30:22','2026-01-11 11:30:22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-24  5:41:51
