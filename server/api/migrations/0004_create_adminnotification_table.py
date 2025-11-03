# Migration to create AdminNotification table manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_kidscertificate_adminnotification'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                """
                CREATE TABLE IF NOT EXISTS `api_adminnotification` (
                    `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                    `notification_type` varchar(50) NOT NULL,
                    `priority` varchar(20) NOT NULL,
                    `title` varchar(255) NOT NULL,
                    `message` longtext NOT NULL,
                    `link` varchar(200) NULL,
                    `is_read` tinyint(1) NOT NULL DEFAULT 0,
                    `read_at` datetime(6) NULL,
                    `metadata` json NULL,
                    `created_at` datetime(6) NOT NULL,
                    `expires_at` datetime(6) NULL,
                    `read_by_id` integer NULL,
                    `user_id` integer NULL,
                    CONSTRAINT `api_adminnotification_read_by_id_bd8b7d34_fk_auth_user_id` 
                        FOREIGN KEY (`read_by_id`) REFERENCES `auth_user` (`id`) ON DELETE SET NULL,
                    CONSTRAINT `api_adminnotification_user_id_4f7d8f4a_fk_auth_user_id` 
                        FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                """,
                """
                CREATE INDEX `api_adminno_user_id_d97447_idx` 
                    ON `api_adminnotification` (`user_id`, `is_read`, `created_at`);
                """,
                """
                CREATE INDEX `api_adminno_is_read_5856b7_idx` 
                    ON `api_adminnotification` (`is_read`, `created_at`);
                """,
                """
                CREATE INDEX `api_adminno_expires_c52829_idx` 
                    ON `api_adminnotification` (`expires_at`);
                """
            ],
            reverse_sql="DROP TABLE IF EXISTS `api_adminnotification`;"
        ),
    ]

