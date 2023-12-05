ALTER TABLE `user_hostnames` ADD PRIMARY KEY (`email`, `hostname`);
ALTER TABLE `user_hostnames` DROP INDEX `email_hostname`;
