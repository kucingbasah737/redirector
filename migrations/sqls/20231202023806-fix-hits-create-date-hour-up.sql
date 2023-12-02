ALTER TABLE `hits` CHANGE `created_date_hour` `created_date_hour` CHAR(13) CHARACTER SET latin1 AS (
  concat(
    cast(`created` as date),
    ' ',
    LPAD(hour(`created`), 2, '0')
  )
) STORED;
