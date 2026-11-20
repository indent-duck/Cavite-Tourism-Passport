CREATE TABLE IF NOT EXISTS `auth_users` (
	`id` INTEGER AUTO_INCREMENT,
	`email` VARCHAR(255),
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `municipalities` (
	`id` INTEGER AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL UNIQUE,
	`caption` TEXT,
	`latitude` DOUBLE,
	`longitude` DOUBLE,
	`zoom` FLOAT,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `promo_periods` (
	`id` INTEGER AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`starts_on` DATE NOT NULL,
	`ends_on` DATE NOT NULL,
	`is_active` BOOLEAN NOT NULL DEFAULT false,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `categories` (
	`category_id` INTEGER UNIQUE,
	`category` VARCHAR(100) NOT NULL,
	`points` INTEGER NOT NULL,
	PRIMARY KEY(`category_id`)
);


CREATE TABLE IF NOT EXISTS `app_settings` (
	`key` VARCHAR(100),
	`value` JSON NOT NULL,
	PRIMARY KEY(`key`)
);


CREATE TABLE IF NOT EXISTS `accounts` (
	`id` INTEGER,
	`passport_id` VARCHAR(32) NOT NULL UNIQUE,
	`first_name` VARCHAR(255),
	`last_name` VARCHAR(255),
	`address` TEXT,
	`contact_number` VARCHAR(32),
	`contact_verified_at` DATETIME,
	`notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
	`role` ENUM('tourist', 'officer', 'admin') NOT NULL DEFAULT 'tourist',
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `sites` (
	`id` INTEGER AUTO_INCREMENT,
	`municipality_id` INTEGER NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`category_id` INTEGER NOT NULL,
	`description` TEXT,
	`address` TEXT NOT NULL,
	`latitude` DOUBLE NOT NULL,
	`longitude` DOUBLE NOT NULL,
	`operating_hours` TEXT,
	`verify_radius_m` INTEGER,
	`is_visible` BOOLEAN NOT NULL DEFAULT true,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `site_images` (
	`id` INTEGER AUTO_INCREMENT,
	`site_id` INTEGER NOT NULL,
	`storage_path` VARCHAR(500) NOT NULL,
	`sort_order` SMALLINT NOT NULL DEFAULT 0,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `events` (
	`id` INTEGER AUTO_INCREMENT,
	`municipality_id` INTEGER,
	`title` VARCHAR(255) NOT NULL,
	`category` ENUM('festival', 'cultural') NOT NULL DEFAULT 'festival',
	`description` TEXT,
	`address` TEXT,
	`latitude` DOUBLE,
	`longitude` DOUBLE,
	`starts_at` DATETIME NOT NULL,
	`ends_at` DATETIME NOT NULL,
	`is_annual` BOOLEAN NOT NULL DEFAULT false,
	`offers_stamp` BOOLEAN NOT NULL DEFAULT false,
	`verify_radius_m` INTEGER,
	`is_visible` BOOLEAN NOT NULL DEFAULT true,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `event_images` (
	`id` INTEGER AUTO_INCREMENT,
	`event_id` INTEGER NOT NULL,
	`storage_path` VARCHAR(500) NOT NULL,
	`sort_order` SMALLINT NOT NULL DEFAULT 0,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `qr_codes` (
	`code` VARCHAR(64),
	`site_id` INTEGER UNIQUE,
	`event_id` INTEGER UNIQUE,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`code`)
);


CREATE TABLE IF NOT EXISTS `itineraries` (
	`id` INTEGER AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL UNIQUE,
	`type` ENUM('day', 'overnight') NOT NULL,
	`description` TEXT,
	`sort_order` SMALLINT NOT NULL DEFAULT 0,
	`is_visible` BOOLEAN NOT NULL DEFAULT true,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `itinerary_stops` (
	`itinerary_id` INTEGER NOT NULL,
	`site_id` INTEGER NOT NULL,
	`stop_order` SMALLINT NOT NULL,
	PRIMARY KEY(`itinerary_id`, `stop_order`),
	CONSTRAINT `itinerary_stops_unique_0` UNIQUE (`itinerary_id`, `site_id`)
);


CREATE TABLE IF NOT EXISTS `rewards` (
	`id` INTEGER AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`description` TEXT,
	`points_cost` INTEGER NOT NULL,
	`image_path` VARCHAR(500),
	`is_limited` BOOLEAN NOT NULL DEFAULT false,
	`quantity_total` INTEGER,
	`is_visible` BOOLEAN NOT NULL DEFAULT true,
	`sort_order` SMALLINT NOT NULL DEFAULT 0,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `stamps` (
	`id` INTEGER AUTO_INCREMENT,
	`account_id` INTEGER NOT NULL,
	`promo_period_id` INTEGER NOT NULL,
	`site_id` INTEGER,
	`event_id` INTEGER,
	`category` ENUM('dining', 'staycation', 'adventure', 'heritage', 'festival') NOT NULL,
	`points` INTEGER NOT NULL,
	`earned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`),
	CONSTRAINT `stamps_unique_0` UNIQUE (`account_id`, `promo_period_id`, `site_id`),
	CONSTRAINT `stamps_unique_1` UNIQUE (`account_id`, `promo_period_id`, `event_id`)
);


CREATE TABLE IF NOT EXISTS `reward_claims` (
	`id` INTEGER AUTO_INCREMENT,
	`account_id` INTEGER NOT NULL,
	`reward_id` INTEGER NOT NULL,
	`promo_period_id` INTEGER NOT NULL,
	`token` VARCHAR(64) NOT NULL UNIQUE,
	`status` ENUM('generated', 'claimed', 'expired', 'cancelled') NOT NULL DEFAULT 'generated',
	`points_spent` INTEGER NOT NULL,
	`generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`expires_at` DATETIME NOT NULL,
	`claimed_at` DATETIME,
	`claimed_by` INTEGER,
	PRIMARY KEY(`id`)
);


-- Physical passport stamps sent for admin review (sites without a QR station
-- on-site, or when it was unavailable). Approving a request creates the stamp.
--
-- Postgres/Supabase notes:
--   * One pending request per account, site and promo period:
--       CREATE UNIQUE INDEX stamp_requests_one_pending
--         ON stamp_requests (account_id, site_id, promo_period_id)
--         WHERE status = 'pending';
--   * Approve in ONE transaction: insert into `stamps` (stamps_unique_0 blocks
--     duplicates, e.g. if the site was scanned via QR meanwhile), then set
--     status = 'approved', stamp_id, reviewed_by, reviewed_at.
--   * Photos live in a private Storage bucket at
--     stamp-requests/{account_id}/{request_id}.jpg (photo_path).
--   * result_seen_at is set by the app once the user has seen the result.
CREATE TABLE IF NOT EXISTS `stamp_requests` (
	`id` INTEGER AUTO_INCREMENT,
	`account_id` INTEGER NOT NULL,
	`site_id` INTEGER NOT NULL,
	`promo_period_id` INTEGER NOT NULL,
	`visited_on` DATE NOT NULL,
	`photo_path` VARCHAR(500) NOT NULL,
	`note` TEXT,
	`status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
	`rejection_reason` TEXT,
	`reviewed_by` INTEGER,
	`reviewed_at` DATETIME,
	`stamp_id` INTEGER UNIQUE,
	`result_seen_at` DATETIME,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`id`)
);


ALTER TABLE `accounts`
ADD FOREIGN KEY(`id`) REFERENCES `auth_users`(`id`)
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE `sites`
ADD FOREIGN KEY(`municipality_id`) REFERENCES `municipalities`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `site_images`
ADD FOREIGN KEY(`site_id`) REFERENCES `sites`(`id`)
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE `events`
ADD FOREIGN KEY(`municipality_id`) REFERENCES `municipalities`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `event_images`
ADD FOREIGN KEY(`event_id`) REFERENCES `events`(`id`)
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE `qr_codes`
ADD FOREIGN KEY(`site_id`) REFERENCES `sites`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `qr_codes`
ADD FOREIGN KEY(`event_id`) REFERENCES `events`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `itinerary_stops`
ADD FOREIGN KEY(`itinerary_id`) REFERENCES `itineraries`(`id`)
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE `itinerary_stops`
ADD FOREIGN KEY(`site_id`) REFERENCES `sites`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `stamps`
ADD FOREIGN KEY(`account_id`) REFERENCES `accounts`(`id`)
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE `stamps`
ADD FOREIGN KEY(`promo_period_id`) REFERENCES `promo_periods`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `stamps`
ADD FOREIGN KEY(`site_id`) REFERENCES `sites`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `stamps`
ADD FOREIGN KEY(`event_id`) REFERENCES `events`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `reward_claims`
ADD FOREIGN KEY(`account_id`) REFERENCES `accounts`(`id`)
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE `reward_claims`
ADD FOREIGN KEY(`reward_id`) REFERENCES `rewards`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `reward_claims`
ADD FOREIGN KEY(`promo_period_id`) REFERENCES `promo_periods`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `reward_claims`
ADD FOREIGN KEY(`claimed_by`) REFERENCES `auth_users`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `sites`
ADD FOREIGN KEY(`category_id`) REFERENCES `categories`(`category_id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `stamp_requests`
ADD FOREIGN KEY(`account_id`) REFERENCES `accounts`(`id`)
ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE `stamp_requests`
ADD FOREIGN KEY(`site_id`) REFERENCES `sites`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `stamp_requests`
ADD FOREIGN KEY(`promo_period_id`) REFERENCES `promo_periods`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `stamp_requests`
ADD FOREIGN KEY(`reviewed_by`) REFERENCES `auth_users`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `stamp_requests`
ADD FOREIGN KEY(`stamp_id`) REFERENCES `stamps`(`id`)
ON UPDATE NO ACTION ON DELETE SET NULL;