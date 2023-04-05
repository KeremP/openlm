/*
  Warnings:

  - You are about to alter the column `warmState` on the `LanguageModel` table. The data in that column could be lost. The data in that column will be cast from `String` to `Boolean`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LanguageModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "warmState" BOOLEAN NOT NULL,
    "paramsId" TEXT NOT NULL,
    CONSTRAINT "LanguageModel_id_fkey" FOREIGN KEY ("id") REFERENCES "ModelParams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LanguageModel" ("author", "id", "modelName", "paramsId", "version", "warmState") SELECT "author", "id", "modelName", "paramsId", "version", "warmState" FROM "LanguageModel";
DROP TABLE "LanguageModel";
ALTER TABLE "new_LanguageModel" RENAME TO "LanguageModel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
