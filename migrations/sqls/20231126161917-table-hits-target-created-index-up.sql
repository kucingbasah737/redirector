ALTER TABLE `hits` ADD INDEX IF NOT EXISTS  `target_created` (`target_uuid`, `created`);
