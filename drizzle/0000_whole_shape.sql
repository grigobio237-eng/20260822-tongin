CREATE TABLE `contract_images` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`image_url` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contract_items` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`room_type` text NOT NULL,
	`item_name` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`volume` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contract_options` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`option_name` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` integer DEFAULT 0 NOT NULL,
	`total_price` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`contract_date` text NOT NULL,
	`packing_date` text NOT NULL,
	`moving_date` text NOT NULL,
	`departure_address` text NOT NULL,
	`departure_floor` integer,
	`departure_conditions` text,
	`arrival_address` text NOT NULL,
	`arrival_floor` integer,
	`arrival_conditions` text,
	`arrival_status` text,
	`service_type` text NOT NULL,
	`total_cbm` real NOT NULL,
	`vehicle_count` text NOT NULL,
	`worker_count_male` integer DEFAULT 0 NOT NULL,
	`worker_count_female` integer DEFAULT 0 NOT NULL,
	`moving_cost` integer DEFAULT 0 NOT NULL,
	`option_cost` integer DEFAULT 0 NOT NULL,
	`total_cost` integer DEFAULT 0 NOT NULL,
	`deposit` integer DEFAULT 0 NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`stt_memo` text,
	`signature_url` text,
	`pdf_url` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
