ALTER TABLE `hits`
  DROP INDEX IF EXISTS `created_date`,
  DROP INDEX IF EXISTS `created_date_hour`,
  DROP IF EXISTS `created_date`,
  DROP IF EXISTS `created_date_hour`;
