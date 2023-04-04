import { prisma } from "../src/server/db";

async function main() {
    const id = "fe699f6290c55cb6bac0f023f5d88a8faba35e2761954e4e0fa030e2fdecafea";
    await prisma.languageModel.upsert({
        where: {
            id,
        },
        create: {
            id:id,
            modelName:"cjwbw/dolly",
            author: "cjwbw",
            state: "warm"
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