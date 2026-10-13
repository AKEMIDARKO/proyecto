CREATE TABLE `editorial_news` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`article_json` text NOT NULL,
	`checked_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `editorial_news_source` ON `editorial_news` (`source`);--> statement-breakpoint
CREATE TABLE `public_updates` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text NOT NULL
);
