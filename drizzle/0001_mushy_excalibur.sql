CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`strengths` json,
	`weaknesses` json,
	`improvements` json,
	`sentiment` varchar(50),
	`score` decimal(3,2),
	`aiSummary` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerDomains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`customDomain` varchar(255),
	`status` enum('pending','verified','active','failed') NOT NULL DEFAULT 'pending',
	`deploymentUrl` varchar(2048),
	`dnsRecords` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`deployedAt` timestamp,
	CONSTRAINT `customerDomains_id` PRIMARY KEY(`id`),
	CONSTRAINT `customerDomains_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
CREATE TABLE `emailNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`previewToken` varchar(255),
	`subject` varchar(255),
	`status` enum('pending','sent','failed','bounced') NOT NULL DEFAULT 'pending',
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`sentAt` timestamp,
	CONSTRAINT `emailNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generationPrompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`prompt` longtext NOT NULL,
	`industry` varchar(100),
	`style` varchar(100),
	`features` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generationPrompts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `previews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`previewToken` varchar(255) NOT NULL,
	`html` longtext,
	`css` longtext,
	`expiresAt` timestamp,
	`accessCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `previews_id` PRIMARY KEY(`id`),
	CONSTRAINT `previews_previewToken_unique` UNIQUE(`previewToken`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`sourceUrl` varchar(2048),
	`status` enum('input','analyzing','analyzed','building','preview','approved','launching','launched','failed') NOT NULL DEFAULT 'input',
	`projectType` enum('rebuild','generate') NOT NULL DEFAULT 'rebuild',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`author` varchar(255),
	`rating` int,
	`text` longtext,
	`sentiment` enum('positive','neutral','negative'),
	`source` varchar(50) DEFAULT 'google',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`sectionType` enum('header','hero','features','testimonials','footer','custom') NOT NULL,
	`title` varchar(255),
	`content` longtext,
	`order` int DEFAULT 0,
	`included` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);
