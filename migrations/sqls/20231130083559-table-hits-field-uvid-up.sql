ALTER TABLE `hits` ADD IF NOT EXISTS `uvid` VARCHAR(64) NULL DEFAULT NULL AFTER `ip`;

UPDATE `hits`
  SET uvid = ip
  WHERE uvid IS NULL;

ALTER TABLE `hits` ADD INDEX IF NOT EXISTS `uvid` (`uvid`, `created`);

ALTER TABLE `hits`
  DROP INDEX IF EXISTS `created_date`,
  ADD INDEX `created_date` (`created_date`, `target_uuid`, `uvid`) USING BTREE;

ALTER TABLE `hits`
  DROP INDEX IF EXISTS `created_date_hour`,
  ADD INDEX `created_date_hour` (`created_date_hour`, `target_uuid`, `uvid`) USING BTREE;

ALTER TABLE `hits` ADD INDEX IF NOT EXISTS `target_uvid` (`target_uuid`, `uvid`);
