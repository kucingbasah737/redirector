CREATE TABLE IF NOT EXISTS `targets` (
  `name` VARCHAR(32) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
  `hostname` VARCHAR(128) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
  `user_email` VARCHAR(256) NOT NULL ,
  `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `target_url` VARCHAR(2048) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL , 
  `disabled` TINYINT(1) NOT NULL DEFAULT '0'
) ENGINE = InnoDB;

ALTER TABLE `targets` ADD PRIMARY KEY (`name`, `hostname`);
ALTER TABLE `targets` ADD INDEX (`user_email`, `name`, `hostname`);
ALTER TABLE `targets` ADD INDEX (`target_url`, `user_email`);

ALTER TABLE `targets` ADD CONSTRAINT `ibfk_targets_hostname` FOREIGN KEY (`hostname`) REFERENCES `hostnames`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `targets` ADD CONSTRAINT `ibfk_targets_user_email` FOREIGN KEY (`user_email`) REFERENCES `users`(`email`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `targets` ADD `full_url` VARCHAR(256) AS (CONCAT(hostname, '/', name)) VIRTUAL AFTER `hostname`;
