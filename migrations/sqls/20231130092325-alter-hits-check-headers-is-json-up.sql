ALTER TABLE `hits` ADD CONSTRAINT IF NOT EXISTS `headers_is_json` CHECK(`headers` IS NULL OR JSON_VALID(`headers`));
