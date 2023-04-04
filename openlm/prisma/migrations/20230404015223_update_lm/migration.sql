/*
  Warnings:

  - Added the required column `author` to the `LanguageModel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LanguageModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelName" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "state" TEXT NOT NULL
);
INSERT INTO "new_LanguageModel" ("id", "modelName", "state") SELECT "id", "modelName", "state" FROM "LanguageModel";
DROP TABLE "LanguageModel";
ALTER TABLE "new_LanguageModel" RENAME TO "LanguageModel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
