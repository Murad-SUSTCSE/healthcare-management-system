/*
  Warnings:

  - You are about to drop the `DoctorApplication` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DoctorApplication` DROP FOREIGN KEY `DoctorApplication_userId_fkey`;

-- DropTable
DROP TABLE `DoctorApplication`;
