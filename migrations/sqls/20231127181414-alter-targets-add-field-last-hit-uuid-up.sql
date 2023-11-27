ALTER TABLE `targets` ADD IF NOT EXISTS `last_hit_uuid` CHAR(36) NULL DEFAULT NULL AFTER `hit_count`;

UPDATE `targets` t
SET
  t.last_hit_uuid = (
    SELECT h.uuid FROM hits h
    WHERE h.target_uuid = t.uuid
    ORDER BY h.created DESC
    LIMIT 1
  )
;
