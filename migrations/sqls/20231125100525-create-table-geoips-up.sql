CREATE TABLE IF NOT EXISTS `geoips` (
  `ip` INET6 NOT NULL , 
  `ts` TIMESTAMP on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `range0` INET6 NULL DEFAULT NULL , 
  `range1` INET6 NULL DEFAULT NULL , 
  `country` CHAR(2) NULL DEFAULT NULL , 
  `region` CHAR(2) NULL DEFAULT NULL , 
  `eu` TINYINT(1) NULL DEFAULT NULL , 
  `timezone` VARCHAR(64) NULL DEFAULT NULL , 
  `city` VARCHAR(64) NULL DEFAULT NULL , 
  `latitude` FLOAT NULL DEFAULT NULL , 
  `longitude` FLOAT NULL DEFAULT NULL , 
  `metro` INT UNSIGNED NULL DEFAULT NULL , 
  `area` INT UNSIGNED NULL DEFAULT NULL , 

  PRIMARY KEY (`ip`)
) ENGINE = InnoDB;

ALTER TABLE `geoips` ADD INDEX IF NOT EXISTS `range` (`range0`, `range1`);
ALTER TABLE `geoips` ADD INDEX IF NOT EXISTS `country_region_city` (`country`, `region`, `city`);
ALTER TABLE `geoips` ADD INDEX IF NOT EXISTS `country_city` (`country`, `city`);
ALTER TABLE `geoips` ADD INDEX IF NOT EXISTS `metro` (`metro`);
ALTER TABLE `geoips` ADD INDEX IF NOT EXISTS `timezone` (`timezone`);

-- ALTER TABLE `targets` ADD CONSTRAINT `ibfk_geoips_ip` FOREIGN KEY (`ip`) REFERENCES `hits`(`ip`) ON DELETE CASCADE ON UPDATE CASCADE;
