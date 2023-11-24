CREATE TABLE IF NOT EXISTS `redirector`.`users` (
  `email` VARCHAR(256) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL , 
  `password` VARCHAR(69) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL , 
  `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , 
  `disabled` TINYINT(1) NOT NULL DEFAULT '0' , 
  PRIMARY KEY (`email`)
) ENGINE = InnoDB;
