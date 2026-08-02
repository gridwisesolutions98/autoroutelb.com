CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'BASIC',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'WHISH',
    "transactionRef" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("billingCycle", "expiresAt", "id", "paymentMethod", "paymentStatus", "plan", "status", "transactionRef", "userId") SELECT "billingCycle", "expiresAt", "id", "paymentMethod", "paymentStatus", "plan", "status", "transactionRef", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VENDOR',
    "companyName" TEXT,
    "whishNumber" TEXT,
    "omtNumber" TEXT,
    "whatsappNumber" TEXT,
    "contactEmail" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "phoneNumber" TEXT,
    "workingHours" TEXT,
    "couponCode" TEXT,
    "couponPercent" INTEGER,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("address", "approvalStatus", "companyName", "contactEmail", "couponCode", "couponPercent", "createdAt", "description", "id", "logoUrl", "omtNumber", "password", "phoneNumber", "role", "username", "whatsappNumber", "whishNumber", "workingHours") SELECT "address", "approvalStatus", "companyName", "contactEmail", "couponCode", "couponPercent", "createdAt", "description", "id", "logoUrl", "omtNumber", "password", "phoneNumber", "role", "username", "whatsappNumber", "whishNumber", "workingHours" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_role_approvalStatus_idx" ON "User"("role", "approvalStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

