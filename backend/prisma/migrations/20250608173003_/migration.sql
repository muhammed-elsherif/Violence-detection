-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'DEVELOPER') NOT NULL DEFAULT 'USER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UploadsHistory` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fileType` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `processingStatus` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `detectionStatus` ENUM('VIOLENCE_DETECTED', 'NON_VIOLENCE', 'INCONCLUSIVE', 'GUN_DETECTED', 'NO_GUN', 'FIRE_DETECTED', 'NO_FIRE') NULL,
    `overallConfidence` DOUBLE NULL,
    `duration` DOUBLE NULL,
    `fileSize` INTEGER NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `annotatedFilePath` VARCHAR(191) NULL,

    INDEX `UploadsHistory_userId_idx`(`userId`),
    INDEX `UploadsHistory_processingStatus_idx`(`processingStatus`),
    INDEX `UploadsHistory_detectionStatus_idx`(`detectionStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetectionResult` (
    `id` VARCHAR(191) NOT NULL,
    `uploadId` VARCHAR(191) NOT NULL,
    `timestamp` DOUBLE NULL,
    `confidence` DOUBLE NOT NULL,
    `label` VARCHAR(191) NULL,
    `severity` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DetectionResult_uploadId_idx`(`uploadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserStats` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `totalUploads` INTEGER NOT NULL DEFAULT 0,
    `averageDuration` DOUBLE NULL,
    `lastDetectionStatus` ENUM('VIOLENCE_DETECTED', 'NON_VIOLENCE', 'INCONCLUSIVE', 'GUN_DETECTED', 'NO_GUN', 'FIRE_DETECTED', 'NO_FIRE') NULL,
    `lastUploadDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserStats_userId_key`(`userId`),
    INDEX `UserStats_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `category` ENUM('CV', 'NLP') NOT NULL,
    `price` DOUBLE NOT NULL,
    `features` VARCHAR(191) NOT NULL,
    `requirements` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `demoVideo` VARCHAR(191) NULL,
    `documentation` VARCHAR(191) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `supportedPlatforms` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceRequest` (
    `id` VARCHAR(191) NOT NULL,
    `serviceName` VARCHAR(191) NOT NULL,
    `serviceDescription` VARCHAR(191) NOT NULL,
    `serviceCategory` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `developerId` VARCHAR(191) NOT NULL,
    `useCase` VARCHAR(191) NOT NULL,
    `expectedTimeline` VARCHAR(191) NOT NULL,
    `specificRequirements` VARCHAR(191) NULL,
    `budget` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companyType` VARCHAR(191) NOT NULL,
    `purchasedModels` JSON NOT NULL,
    `contactNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `hasChangedPassword` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Customer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Developer` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Developer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UploadsHistory` ADD CONSTRAINT `UploadsHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetectionResult` ADD CONSTRAINT `DetectionResult_uploadId_fkey` FOREIGN KEY (`uploadId`) REFERENCES `UploadsHistory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserStats` ADD CONSTRAINT `UserStats_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRequest` ADD CONSTRAINT `ServiceRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRequest` ADD CONSTRAINT `ServiceRequest_developerId_fkey` FOREIGN KEY (`developerId`) REFERENCES `Developer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
