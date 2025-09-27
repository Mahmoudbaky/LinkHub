-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "appearInSlider" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "icon" TEXT,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "bannerImage" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_links" ("backgroundColor", "clicks", "createdAt", "description", "icon", "id", "isActive", "position", "textColor", "title", "updatedAt", "url", "userId") SELECT "backgroundColor", "clicks", "createdAt", "description", "icon", "id", "isActive", "position", "textColor", "title", "updatedAt", "url", "userId" FROM "links";
DROP TABLE "links";
ALTER TABLE "new_links" RENAME TO "links";
CREATE INDEX "links_userId_idx" ON "links"("userId");
CREATE INDEX "links_position_idx" ON "links"("position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
