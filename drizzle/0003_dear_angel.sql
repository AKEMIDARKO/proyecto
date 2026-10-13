CREATE TABLE `achievement_progress` (
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`completed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `achievement_id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `growth_plans` (
	`user_id` text PRIMARY KEY NOT NULL,
	`plan_json` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `showcase_builds` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kioku_id` text NOT NULL,
	`build_json` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `showcase_user_kioku` ON `showcase_builds` (`user_id`,`kioku_id`);--> statement-breakpoint
CREATE INDEX `showcase_updated` ON `showcase_builds` (`updated_at`);--> statement-breakpoint
CREATE TABLE `showcase_votes` (
	`user_id` text NOT NULL,
	`build_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `build_id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`build_id`) REFERENCES `showcase_builds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `showcase_votes_build` ON `showcase_votes` (`build_id`);--> statement-breakpoint
CREATE TABLE `support_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`page` text DEFAULT '' NOT NULL,
	`language` text NOT NULL,
	`public` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`reply` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `support_user_updated` ON `support_requests` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `support_public_kind` ON `support_requests` (`public`,`kind`);