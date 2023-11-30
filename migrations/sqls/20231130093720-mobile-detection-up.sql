ALTER TABLE `hits` ADD IF NOT EXISTS `sec_ch_ua_mobile` VARCHAR(3) AS (
  JSON_VALUE(`headers`, '$.sec-ch-ua-mobile') = '?1'
) STORED;

ALTER TABLE `hits` ADD IF NOT EXISTS `sec_ch_ua_platform` VARCHAR(512) AS (
  JSON_VALUE(`headers`, '$.sec-ch-ua-platform')
) STORED;
