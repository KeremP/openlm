/*
  Warnings:

  - Added the required column `frequencyPenalty` to the `ModelParams` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ModelParams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "temperature" REAL NOT NULL,
    "maximumLength" INTEGER NOT NULL,
    "topP" REAL NOT NULL,
    "topK" REAL NOT NULL,
    "frequencyPenalty" REAL NOT NULL,
    "repetitionPenalty" REAL NOT NULL,
    "presencePenalty" REAL NOT NULL,
    "stopSequences" TEXT
);
INSERT INTO "new_ModelParams" ("id", "maximumLength", "presencePenalty", "repetitionPenalty", "stopSequences", "temperature", "topK", "topP") SELECT "id", "maximumLength", "presencePenalty", "repetitionPenalty", "stopSequences", "temperature", "topK", "topP" FROM "ModelParams";
DROP TABLE "ModelParams";
ALTER TABLE "new_ModelParams" RENAME TO "ModelParams";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
