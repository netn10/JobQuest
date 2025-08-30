/*
  Warnings:

  - You are about to drop the column `dashboardLayout` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" BIGINT NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "notificationPreferences" JSONB,
    "focusSettings" JSONB,
    "dailyChallengeSettings" JSONB,
    "openaiApiKey" TEXT
);
INSERT INTO "new_users" ("createdAt", "currentStreak", "email", "focusSettings", "id", "image", "lastActiveDate", "level", "longestStreak", "name", "notificationPreferences", "notifications", "openaiApiKey", "password", "theme", "timezone", "totalXp", "updatedAt", "xp") SELECT "createdAt", "currentStreak", "email", "focusSettings", "id", "image", "lastActiveDate", "level", "longestStreak", "name", "notificationPreferences", "notifications", "openaiApiKey", "password", "theme", "timezone", "totalXp", "updatedAt", "xp" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
