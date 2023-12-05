CREATE TABLE IF NOT EXISTS `user_hostnames` (
  `email` VARCHAR(256) NOT NULL , 
  `hostname` VARCHAR(128) NOT NULL , 
  `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

ALTER TABLE `user_hostnames`
  ADD UNIQUE IF NOT EXISTS `email_hostname` (`email`, `hostname`);

ALTER TABLE `user_hostnames`
  ADD CONSTRAINT `ibfk_user_hostames_email` FOREIGN KEY IF NOT EXISTS (`email`) REFERENCES `users`(`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ibfk_user_hostames_hostname` FOREIGN KEY IF NOT EXISTS (`hostname`) REFERENCES `hostnames`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;
