ALTER TABLE `hits` ADD `referrer` VARCHAR(2048) CHARACTER SET utf16 COLLATE utf16_general_ci NULL DEFAULT NULL AFTER `user_agent`;