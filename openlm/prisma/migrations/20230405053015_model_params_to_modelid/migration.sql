/*
  Warnings:

  - You are about to drop the column `paramsId` on the `LanguageModel` table. All the data in the column will be lost.
  - Added the required column `modelId` to the `ModelParams` table without a default value. This is not possible if the table is not empty.

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
    "stopSequences" TEXT,
    "modelId" TEXT NOT NULL,
    CONSTRAINT "ModelParams_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "LanguageModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ModelParams" ("frequencyPenalty", "id", "maximumLength", "presencePenalty", "repetitionPenalty", "stopSequences", "temperature", "topK", "topP") SELECT "frequencyPenalty", "id", "maximumLength", "presencePenalty", "repetitionPenalty", "stopSequences", "temperature", "topK", "topP" FROM "ModelParams";
DROP TABLE "ModelParams";
ALTER TABLE "new_ModelParams" RENAME TO "ModelParams";
CREATE UNIQUE INDEX "ModelParams_modelId_key" ON "ModelParams"("modelId");
CREATE TABLE "new_LanguageModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "warmState" BOOLEAN NOT NULL
);
INSERT INTO "new_LanguageModel" ("author", "id", "modelName", "version", "warmState") SELECT "author", "id", "modelName", "version", "warmState" FROM "LanguageModel";
DROP TABLE "LanguageModel";
ALTER TABLE "new_LanguageModel" RENAME TO "LanguageModel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
