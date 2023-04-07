import { prisma } from "../src/server/db";
import { DEFAULT_PARAMETERS_STATE } from "~/pages/_app";

async function main() {
    const version = "fe699f6290c55cb6bac0f023f5d88a8faba35e2761954e4e0fa030e2fdecafea";
    await prisma.languageModel.upsert({
        where: {
            id:"TESTING",
        },
        create: {
            version: version,
            modelName:"dolly",
            author: "cjwbw",
            warmState: true,
            parameters: {
              create: {
                temperature: 1.0,
                maximumLength: 200,
                topP: 0.9,
                topK: 0,
                repetitionPenalty: 1.0,
                frequencyPenalty: 0.0,
                presencePenalty: 0.0,
                stopSequences: "",
              }
            }

        },
        update: {}
    });
    await prisma.languageModel.upsert({
      where: {
          id:"TESTING",
      },
      create: {
          version: version,
          modelName:"dolly",
          author: "cjwbw",
          warmState: true,
          parameters: {
            create: {
              temperature: 1.0,
              maximumLength: 200,
              topP: 0.9,
              topK: 0,
              repetitionPenalty: 1.0,
              frequencyPenalty: 0.0,
              presencePenalty: 0.0,
              stopSequences: "",
            }
          }

      },
      update: {}
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });