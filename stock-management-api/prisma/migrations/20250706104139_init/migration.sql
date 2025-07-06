-- CreateTable
CREATE TABLE `Product`
(
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR
(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `entryDate` DATETIME
(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
(3),
    `expirationDate` DATETIME
(3) NULL,
    `purchasePrice` FLOAT NOT NULL,
    `salePrice` FLOAT NOT NULL,
    `description` VARCHAR
(191) NULL,
    `category` VARCHAR
(191) NULL,
    `supplier` VARCHAR
(191) NULL,
    `barcode` VARCHAR
(191) NULL,
    `minStock` INTEGER NULL DEFAULT 5,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `imageUrl` TEXT NULL,
    `createdAt` DATETIME
(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
(3),
    `updatedAt` DATETIME
(3) NOT NULL,
    UNIQUE INDEX `Product_barcode_key`
(`barcode`),

    PRIMARY KEY
(`id`)
) DEFAULT CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci;
