CREATE TABLE IF NOT EXISTS `hits` (
  `uuid` CHAR(36) NOT NULL DEFAULT uuid() ,
  `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
  `target_uuid` CHAR(36) NOT NULL ,
  `ip` INET6 NOT NULL ,
  `user_agent` VARCHAR(512) NULL DEFAULT NULL ,
  PRIMARY KEY (`uuid`)
) ENGINE = InnoDB;

ALTER TABLE `hits` ADD INDEX IF NOT EXISTS `created` (`created`);
ALTER TABLE `hits` ADD INDEX IF NOT EXISTS `ip_created` (`ip`, `created`);
ALTER TABLE `hits` ADD INDEX IF NOT EXISTS  `ip_user_agent` (`ip`, `user_agent`);
ALTER TABLE `hits` ADD CONSTRAINT `ibfk_hits_target_uuid` FOREIGN KEY (`target_uuid`) REFERENCES `targets`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
