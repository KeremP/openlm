import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { env } from "~/env.mjs";

import Replicate from "replicate";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { MessageType } from "~/pages/_app";

import { toTitleCase } from "~/utils/formatting";
import { DEFAULT_PARAMETERS } from "~/components/model";
import { MessageProps } from "~/components/ui/chat/message";

const replicate = new Replicate({
    auth: env.REPLICATE_API_TOKEN
});

const model = "replicate/llama-7b:455d66312a66299fba685548fe24f66880f093007b927abd19f4356295f8577c";

const compilePrompt = (messages: MessageType[]) => {
    let prompt = "";
    
    const sysMessage = messages.filter(msg => msg.role === "system")[0];
    
    prompt = sysMessage?.text + "\n\n";

    messages.forEach((msg) => {
        if(msg.role !== "system") {
            let textToAdd = "- "+toTitleCase(msg.role)+": "+msg.text + "\n";
            prompt+=textToAdd;
        }
    });

    if(messages[messages.length-1]?.role === "user") {
        prompt+="- Assistant:";
    }
    else {
        prompt+="- User:";
    }
    console.log(prompt)
    return prompt;
}

function convertToNumber(value: any, float?:boolean){
    let out = value;
    if(typeof value === "string"){
        float ? out = parseFloat(value): out = parseInt(value)
    }
    return out;
}

export const getCompletionLlama = async (messages: MessageProps[], params: typeof DEFAULT_PARAMETERS) => {
    const prompt = compilePrompt(messages);
    console.log("compiled",prompt)
    let maxLength = convertToNumber(params.maxLength);
    let topP = convertToNumber(params.topP, true);
    let temperature = convertToNumber(params.temperature, true);
    let repetition_penalty = convertToNumber(params.presencePenalty, true);

    const input = {
        prompt: prompt,
        max_length: maxLength,
        top_p: topP,
        temperature: temperature,
        repetition_penalty: repetition_penalty,
     };
     console.log(input)
    const output = await replicate.run(model, {input});
    return output;
}


