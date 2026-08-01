/*
  Warnings:

  - You are about to drop the column `year` on the `Booking` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "renterName" TEXT NOT NULL,
    "renterPhone" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalPrice" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionRef" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("carId", "createdAt", "endDate", "id", "paymentStatus", "renterName", "renterPhone", "startDate", "totalPrice", "transactionRef") SELECT "carId", "createdAt", "endDate", "id", "paymentStatus", "renterName", "renterPhone", "startDate", "totalPrice", "transactionRef" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VENDOR',
    "companyName" TEXT,
    "whishNumber" TEXT,
    "whatsappNumber" TEXT,
    "contactEmail" TEXT,
    "address" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("address", "companyName", "contactEmail", "createdAt", "id", "password", "role", "username", "whatsappNumber", "whishNumber") SELECT "address", "companyName", "contactEmail", "createdAt", "id", "password", "role", "username", "whatsappNumber", "whishNumber" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
