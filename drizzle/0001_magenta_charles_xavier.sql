CREATE TABLE `generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('cold_email','knowledge_base','proposal') NOT NULL,
	`businessName` varchar(255),
	`niche` varchar(255),
	`websiteUrl` varchar(512),
	`inputData` text,
	`outputContent` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
