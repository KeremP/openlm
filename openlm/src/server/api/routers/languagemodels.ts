import { z } from "zod";
import Replicate from "replicate";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

import { env } from "~/env.mjs";

const replicate = new Replicate({
    auth: env.REPLICATE_API_TOKEN
})

export const languageModelRouter = createTRPCRouter({
    getAll:
    publicProcedure.query(({ctx}) => {
        return ctx.prisma.languageModel.findMany();
    }),
    getById:
    publicProcedure.input(z.string()).query(({ ctx, input}) => {
      return ctx.prisma.languageModel.findFirst({
        where:{
          id: input
        }
      })
    })
    // getModelOutput:
    // publicProcedure.input(z.object({
    //     author: z.string(), modelName: z.string(), version: z.string(), prompt: z.string()
    // })).query(async ({input}) => {
    // //   const endpoint = `${input.modelName}:${input.modelId}` 
    //   const output = await replicate.run(
    //     `${input.author}/${input.modelName}:${input.version}`,
    //     {
    //         input:{
    //             prompt:input.prompt
    //         }
    //     }
    //   )
    //   return output
    // })

});