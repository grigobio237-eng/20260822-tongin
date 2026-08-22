CREATE TABLE `system_settings` (
	`id` text PRIMARY KEY DEFAULT 'global_config' NOT NULL,
	`vehicle_prices` text NOT NULL,
	`worker_prices` text NOT NULL,
	`updated_at` text NOT NULL
);
