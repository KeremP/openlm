import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { env } from "~/env.mjs";

import Replicate from "replicate";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { MessageType } from "~/pages/_app";
import { getCompletionDolly } from "./models/dolly";

const replicate = new Replicate({
    auth: env.REPLICATE_API_TOKEN
})


// const modelCompletionByIdHandler = async (req: NextApiRequest, res: NextApiResponse) => {
//     const ctx = await createTRPCContext({req, res});

//     const caller = appRouter.createCaller(ctx);
//     try {
//         console.log(req.body)
//         const { id, prompt } = JSON.parse(req.body);
//         if (typeof id === "string") {
//             const model = await caller.languageModel.getById(id);
//             console.log(model)
//             if (model){

//                 const output = await replicate.run(
//                     `${model.author}/${model.modelName}:${model.version}`,
//                     {
//                         input:{
//                             prompt:prompt
//                         }
//                     }
//                 );
//                 console.log(output)
//                 res.status(200).json(output);
//             } else {
//                 res.status(404);
//             }
//         } else {
//             res.status(500).json({message:"model id must be a string"});
//         }
//     } catch (cause) {
//         if (cause instanceof TRPCError) {
//             const httpCode = getHTTPStatusCodeFromError(cause);
//             return res.status(httpCode).json(cause);
//         }
//         console.error(cause);
//         res.status(500).json({message: "Internal server error"});
//     }
// };

// export default modelCompletionByIdHandler;




const modelCompletion = async (messages: MessageType[], modelName: string) => {
    switch (modelName) {
        case "dolly":
            return await getCompletionDolly(messages);
        default:
            break;
    }
}

interface ModelCompletionReq {
    messages: MessageType[], modelName: string
}

const modelCompletionHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const ctx = await createTRPCContext({req, res});

    const caller = appRouter.createCaller(ctx);
    try {
        console.log(req.body)
        const { messages, modelName }: ModelCompletionReq = JSON.parse(req.body);
        const output = await modelCompletion(messages, modelName);
        res.status(200).json(output);
    } catch (cause) {
        if (cause instanceof TRPCError) {
                const httpCode = getHTTPStatusCodeFromError(cause);
                return res.status(httpCode).json(cause);
            }
            console.error(cause);
            res.status(500).json({message: "Internal server error"});
    }


}

export default modelCompletionHandler