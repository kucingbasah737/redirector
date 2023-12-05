ALTER TABLE `hostnames`
  ADD IF NOT EXISTS `exclusive` TINYINT(1) NOT NULL DEFAULT '0' AFTER `disabled`,
  ADD INDEX IF NOT EXISTS `exclusive` (`exclusive`) USING BTREE
;