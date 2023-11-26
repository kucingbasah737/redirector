UPDATE `targets` t
SET
  t.hit_count = (
    SELECT COUNT(1) FROM hits h WHERE h.target_uuid = t.uuid
  )
;
