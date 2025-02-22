/*
  Warnings:

  - Added the required column `annotatedFilePath` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFilePath` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Upload` ADD COLUMN `annotatedFilePath` VARCHAR(191) NOT NULL,
    ADD COLUMN `mimeType` VARCHAR(191) NOT NULL,
    ADD COLUMN `originalFilePath` VARCHAR(191) NOT NULL;
