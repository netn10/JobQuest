-- AlterTable
ALTER TABLE "missions" ADD COLUMN "elapsedTime" INTEGER DEFAULT 0;

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
    "theme" TEXT NOT NULL DEFAULT 'light',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "focusSettings" JSONB,
    "openaiApiKey" TEXT
);
INSERT INTO "new_users" ("createdAt", "currentStreak", "email", "focusSettings", "id", "image", "lastActiveDate", "level", "longestStreak", "name", "notifications", "openaiApiKey", "password", "theme", "totalXp", "updatedAt", "xp") SELECT "createdAt", "currentStreak", "email", "focusSettings", "id", "image", "lastActiveDate", "level", "longestStreak", "name", "notifications", "openaiApiKey", "password", "theme", "totalXp", "updatedAt", "xp" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
