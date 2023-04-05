/*
  Warnings:

  - You are about to drop the column `state` on the `LanguageModel` table. All the data in the column will be lost.
  - Added the required column `paramsId` to the `LanguageModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `LanguageModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warmState` to the `LanguageModel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ModelParams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "temperature" REAL NOT NULL,
    "maximumLength" INTEGER NOT NULL,
    "topP" REAL NOT NULL,
    "topK" REAL NOT NULL,
    "repetitionPenalty" REAL NOT NULL,
    "presencePenalty" REAL NOT NULL,
    "stopSequences" TEXT
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LanguageModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "warmState" TEXT NOT NULL,
    "paramsId" TEXT NOT NULL,
    CONSTRAINT "LanguageModel_id_fkey" FOREIGN KEY ("id") REFERENCES "ModelParams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LanguageModel" ("author", "id", "modelName") SELECT "author", "id", "modelName" FROM "LanguageModel";
DROP TABLE "LanguageModel";
ALTER TABLE "new_LanguageModel" RENAME TO "LanguageModel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
