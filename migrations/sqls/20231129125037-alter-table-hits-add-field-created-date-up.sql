ALTER TABLE `hits`
  ADD IF NOT EXISTS `created_date` CHAR(10) AS (DATE(created)) STORED AFTER `created`,
  ADD IF NOT EXISTS `created_date_hour` CHAR(13) AS (CONCAT(DATE(created), ' ', HOUR(created))) STORED
AFTER `created_date`;

ALTER TABLE `hits` ADD INDEX IF NOT EXISTS `created_date` (`created_date`, `target_uuid`);
ALTER TABLE `hits` ADD INDEX IF NOT EXISTS `created_date_hour` (`created_date_hour`, `target_uuid`);
