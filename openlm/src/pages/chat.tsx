import { useState, useContext, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import ChatBar from "src/components/ui/chat/chatbar";
import Message, { MessageProps } from "~/components/ui/chat/message";
import * as Slider from '@radix-ui/react-slider';
import { MessageContext, MessageType } from "./_app";
import { Model, ModelOption, DEFAULT_PARAMETERS } from "~/components/model";
import {  Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";


const DEFAULT_PROMPT = "You are a chat assistant.";

// const DEFAULT_MODEL: Model ={
//     modelName:"dolly",
//     author:"databricks",
//     provided:"kerpr",
//     version:"1",
//     color:"blue",
//     icon:"",
//     parameters: DEFAULT_PARAMETERS
// }


const LLAMA: Model = {
    modelName: "LLaMa",
    author: "Meta",
    provided: "kerpr",
    version: "455d66312a66299fba685548fe24f66880f093007b927abd19f4356295f8577c",
    color: "purple",
    icon: "",
    // parameters: DEFAULT_PARAMETERS
}
const DEFAULT_MODEL = LLAMA;

const GPT4ALL: Model = {
    modelName: "gpt4all",
    author:"nomicai",
    provided:"kerpr",
    version: "2",
    color:"blue",
    icon:"",
    // parameters: DEFAULT_PARAMETERS
}


const MODELS: Model[] = [
    DEFAULT_MODEL,
    GPT4ALL,
    
];


const defaultMessage: MessageProps =
    {
      id: 0, role: "system", text:DEFAULT_PROMPT, model: undefined
    }

const reqCompletion = async (messages: MessageProps[], modelName: string, params: typeof DEFAULT_PARAMETERS) => {
    const response = await fetch("/api/completions/completion", {
      method: "POST",
      body: JSON.stringify({messages:messages, modelName:modelName, params:params })
    });
    return response.json();
  }

interface OutputType {
    text: string,
    modelName: string
}



interface ModelParams {
    model: Model,
    params: typeof DEFAULT_PARAMETERS
}

const DEFAULT_MODEL_PARAMS: ModelParams = {
    model: DEFAULT_MODEL,
    params: DEFAULT_PARAMETERS
}

const Chat: NextPage = () => {
    const {data: sessionData } = useSession();
    const [selectedModels, setSelectedModels] = useState<Model[]>([DEFAULT_MODEL]);
    // const [selectedModel, setSelectedModel] = useState<Model | null>(DEFAULT_MODEL);
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const [formValue, setFormValue] = useState("");
    const [sysMessage, setSysMessage] = useState(defaultMessage);
    const [maxTokens, setMaxTokens] = useState(500);
    const [outputs, setOutputs] = useState<OutputType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingStates, setLoadingStates] = useState<Model[]>([]);
    const [modelParams, setModelParams] = useState<ModelParams[]>([DEFAULT_MODEL_PARAMS]);


    // useEffect(() => {
    //     if(sysMessage)
    //     updateMessage(0, sysMessage);
    // }, [sysMessage])

    useEffect(() => {
        console.log(outputs)
    }, [outputs])

    const updateParams = (modelName: string, paramsToUpdate: typeof DEFAULT_PARAMETERS) => {
        const newParams = modelParams.map(obj => {
            if(obj.model.modelName === modelName) {
                return {
                    ...obj, params:paramsToUpdate
                }
            } else {
                return obj
            }
        });
        setModelParams(newParams);
    }

    const addMessage = (assistant: boolean, text: string, model?: Model ) => {
        let role: string;
        assistant ? role = "assistant": role = "user";
        const newMsg: MessageProps = {id:messages.length+1, role:role, text:text, model:model}
        const newMsgs = [...messages, newMsg]
        setMessages(prev => [...prev, newMsg]);
        return newMsgs
      }
    
    const updateLoading = (model: Model, state: boolean) => {
        if(state) {
            setLoadingStates(prev => [...prev, model]);
        } else {
            setLoadingStates(
                loadingStates.filter(m => m.modelName !== model.modelName)
            );
        }
    }

    const addModel = (model: Model) => {
        setSelectedModels(prev => [...prev, model]);
    }

    const removeModel = (model: Model) => {
        setSelectedModels(
            selectedModels.filter(m => m.modelName !== model.modelName)
        );
    }
    
    // TODO: pass error message from replicate
    const handleResult = (result: PromiseSettledResult<any>) => {
        let newMsgState;
        if (result.status === "fulfilled") {
            let res = result.value;
            console.log(res)
            const model = selectedModels.filter(m => m.modelName === res.model)[0];
            if (model) {
                if (res.message) {
                    newMsgState = addMessage(true, res.message, model);
                } else {
                    newMsgState = addMessage(true, res.result, model);
                }
                updateLoading(model, false);
                console.log(newMsgState)
            }
        } else {
            newMsgState = addMessage(true, "There was a problem with calling a model");
        }
        // addMessage(true, result)
    } 

    const submitMessages = async (msgs: MessageProps[]) => {
        const prompt: MessageProps[] = [sysMessage, ...msgs];
        console.log("prompt",prompt)
        const promises: Promise<any>[] = [];
        setLoading(true);
        selectedModels.forEach(model => {
            console.log(model)
            updateLoading(model, true);
            console.log(model)
            let params = modelParams.filter(param => param.model.modelName === model.modelName)[0];
            if(params){
                let promise = reqCompletion(prompt, model.modelName, params.params);
                promises.push(promise);
            }
        });
        Promise.allSettled(promises).
            then((results) => results.forEach((result) => handleResult(result))).then(() => setLoading(false));
    }

    const submitUserMessage = async () => {
        if (loading){
            return;
        }
        const msg = formValue;
        setFormValue("");
        const newMsgs = addMessage(false, msg);
        console.log(newMsgs);
        await submitMessages(newMsgs);
    }
    return (
        <>
        <Head>
            <title>OpenLM</title>
            <meta name="description" content="Compare the outputs of open source LLMs" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-w-screen min-h-screen bg-white">
            <div className="flex flex-col h-screen py-2">
                <header className="h-12 w-full flex flex-row justify-between border-b py-4 px-6 items-center -mt-2">
                    <div>
                        <Link href={"#"}>
                            <Image
                                src={"/github-mark.svg"}
                                height={20}
                                width={35}
                                alt={"Github logo"}
                            />
                        </Link>
                    </div>
                    <div>
                        <Image
                            className="rounded-full"
                            src={sessionData ? `${sessionData.user.image}` : "/favicon.ico"}
                            height={20}
                            width={35}
                            alt={"Google profile picture"}
                        />
                    </div>

                </header>
                <RequireAuth>
                    
                </RequireAuth>
                    <div className="flex flex-col w-full h-full max-h-[99%] justify-between relative overflow-hidden">
                        <div className="w-full h-16 flex flex-row border-b bg-slate-50 py-4 px-6 gap-2">
                            {
                                selectedModels.map((model, index) => 
                                    <ModelAvatar
                                        key={index}
                                        model={model}
                                    />
                                )
                            }
                            
                            {/* TODO: add model */}
                            <Avatar className="ml-4">
                                <button className="border-black border rounded-full border-dashed w-full h-full flex justify-center items-center">
                                    <PlusIcon
                                        width="18px"
                                    />
                                </button>
                            </Avatar>
                            
                        </div>
                        <div className="flex flex-col w-full h-[90%] overflow-y-auto gap-4 p-4">
                            {
                                messages.map((msg, idx) =>
                                    msg.role != "system" &&
                                    <Message
                                        key={idx}
                                        id={msg.id}
                                        role={msg.role}
                                        text={msg.text}
                                        model={msg.model}
                                    />
                                )
                            }
                            { loading && <div className="flex flex-col gap-2">
                                {
                                    loadingStates.map((model, index) => 
                                        <LoadingDots
                                            key={index}
                                            model={model}
                                        />
                                    )
                                }
                            </div>}
                        </div>
                        <div className="w-full h-24"></div>
                        <div className="absolute bottom-0 left-0 w-full px-6 bg-transparent">
                            <ChatBar
                                formValue={formValue}
                                setFormValue={setFormValue}
                                onSubmit={submitUserMessage}
                                loading={loading}
                            />
                        </div>
                    </div>
            </div>
        </main>
        </>
    )
}

export default Chat;

interface AuthProps {
    children?: React.ReactNode
}

const RequireAuth: React.FC<AuthProps> = ({children}) => {
    
    const {data: sessionData } = useSession();

    return(
        <>
        {
            !sessionData && 
            <div className="h-screen w-screen z-10 absolute top-0 left-0 flex justify-center items-center bg-gray-50/50 backdrop-blur-sm">
                <div className="w-1/3 h-1/3 rounded-lg bg-gray-100/50 flex flex-col justify-center items-center">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold text-center">
                            Please Sign-in
                        </h3>
                        <span>This is required to prevent abuse</span>
                    </div>
                    <button
                        className="mt-4 inline-flex items-center px-4 py-2 mr-3 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        onClick={sessionData ? () => void signOut() : () => void signIn()}
                    >
                        <Image
                            className="mr-2"
                            src={"/google_btn.svg"}
                            height={15}
                            width={15}
                            alt={"Google logo"}
                        />
                        {"Sign in with Google"}
                    </button>
                </div>
            </div>
        }
        </>
    )
}


interface ModelOptionsProps {
    models: Model[],
    onSelect: (selected: boolean, model:Model) => void
}

const ModelOptions = (props: ModelOptionsProps) => {
    const {models, onSelect} = props;
    const [searchInput, setSearchInput] = useState("");

    return (
        <div className="h-full w-full flex flex-col overflow-y-auto gap-2">
            <input
                className="py-2 text-md focus:outline-none w-full mb-4 border rounded-md px-2"
                placeholder="Search for a model..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            {
            models.filter(model => {
                if(searchInput === "") return true;
                else if (model.modelName.toLocaleLowerCase().includes(searchInput) || model.author.toLocaleLowerCase().includes(searchInput)) {
                    return true;
                }
            }).map((model, idx) =>
                <ModelOption
                    key={idx}
                    model={model}
                    defaultModel={model.modelName === "dolly"}
                    onSelect={onSelect}
                />    
            )}
        </div>
    )
}

interface ModelStatsProps {
    model?: Model | null,
    updateParams: (model: Model, param: typeof DEFAULT_PARAMETERS) => void
}

const ModelStats = (props: ModelStatsProps) => {
    const {model, updateParams} = props;

    const [temperature, setTemperature] = useState(DEFAULT_PARAMETERS.temperature);
    const [maxLength, setMaxLength] = useState(DEFAULT_PARAMETERS.maxLength);
    const [topP, setTopP] = useState(DEFAULT_PARAMETERS.topP);
    const [freqPenalty, setFreqPenalty] = useState(DEFAULT_PARAMETERS.frequencyPenalty);
    const [presencePenalty, setPresencePenalty] = useState(DEFAULT_PARAMETERS.presencePenalty);

    const onUpdate = () => {
        const newParams: typeof DEFAULT_PARAMETERS = {
            temperature:temperature,
            maxLength:maxLength,
            topP:topP,
            frequencyPenalty:freqPenalty,
            presencePenalty:presencePenalty
        }
        
        if(model) updateParams(model, newParams);
    };
    
    useEffect(()=> {
        console.log(model)
    }, [model])
    const onReset = () => {
        setTemperature(DEFAULT_PARAMETERS.temperature);
        setMaxLength(DEFAULT_PARAMETERS.maxLength);
        setTopP(DEFAULT_PARAMETERS.topP);
        setFreqPenalty(DEFAULT_PARAMETERS.frequencyPenalty);
        setPresencePenalty(DEFAULT_PARAMETERS.presencePenalty);
        if(model) updateParams(model, DEFAULT_PARAMETERS);
    }

    return (
        <div className="flex flex-col w-full px-2">
            <h2 className="text-md font-bold">
                {
                    model? model.modelName : "NA"
                }
            </h2>
            <span className="text-xs font-light text-slate-900 mb-2">
                {model? model.version : "Select a model above to adjust params"}
            </span>
            <div className="flex flex-col w-full">
                <Params
                    name="temperature"
                    value={temperature}
                    max={1.0}
                    min={0.0}
                    step={0.1}
                    disabled={model ? false: true}
                    updateValue={setTemperature}
                />
                <Params
                    name="max length"
                    value={maxLength}
                    max={1000}
                    min={0}
                    step={1}
                    disabled={model ? false: true}
                    updateValue={setMaxLength}
                />
                <Params
                    name="top p"
                    value={topP}
                    max={1.0}
                    min={0.01}
                    step={0.01}
                    disabled={model ? false: true}
                    updateValue={setTopP}
                />
                <Params
                    name="frequency penalty"
                    value={freqPenalty}
                    max={2.0}
                    min={0.0}
                    step={0.01}
                    disabled={model ? false: true}
                    updateValue={setFreqPenalty}
                />
                <Params
                    name="presence penalty"
                    value={presencePenalty}
                    max={2.0}
                    min={0.0}
                    step={0.01}
                    disabled={model ? false: true}
                    updateValue={setPresencePenalty}
                />
            </div>
            <div className="flex flex-row justify-between w-full mt-2">
                <button onClick={onUpdate} className="px-4 py-2 bg-slate-500 text-white text-sm rounded-md">
                    Update
                </button>
                <button onClick={onReset} className="px-4 py-2 bg-slate-100 text-black text-sm rounded-md">
                    Reset
                </button>

            </div>

        </div>
    )
}

interface ParamsProps {
    name: string,
    value: any,
    max: any,
    min: any,
    step: any,
    disabled: boolean,
    updateValue: Dispatch<SetStateAction<any>>
}

const Params = (props: ParamsProps) => {
    const {name, value, max, min, step,  disabled, updateValue} = props;

    return (
        <div className="flex flex-col">
            <div className="flex flex-row justify-between">
                <span>{name}</span>
                <input
                    onChange={(e) => updateValue(e.target.value)}
                    max={max}
                    min={min}
                    step={step}
                    disabled={disabled}
                    className="w-[40px] px-2 text-right text-xs border border-white hover:border-slate-100 focus:outline focus:outline-slate-100"
                    value={value}
                />
            </div>
            <SliderUI
                name={name}
                value={value}
                max={max}
                min={min}
                step={step}
                disabled={disabled}
                updateValue={updateValue}
            />
        </div>
    )
}

const SliderUI = (props: ParamsProps) => {

    const {name, value, max, min, step, disabled, updateValue} = props;
    return (
        <form>
            <Slider.Root
            className={`${disabled?"opacity-30":"opacity-100"} relative flex items-center select-none touch-none w-[200px] h-5`}
            value={[value]}
            max={max}
            min={min}
            step={step}
            aria-label={name}
            disabled={disabled}
            onValueChange={(val) => updateValue(val[0])}
            >
            <Slider.Track className="bg-slate-400 relative grow rounded-full h-[3px]">
                <Slider.Range className="absolute bg-black rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block cursor-pointer border-2 w-3 h-3 bg-white rounded-[10px] hover:bg-slate-100 focus:outline-none" />
            </Slider.Root>
        </form>
    )
}

export interface ModelAvatarProps {
    model: Model
}

const ModelAvatar = (props: ModelAvatarProps) => {
    return (
        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    )
}

export {ModelAvatar}

const LoadingDots = ({model}: {model: Model}) => {
    return (
        <div className="flex flex-row items-center gap-6">
            <ModelAvatar
                model={model}
            />
            <div className="dot-flashing"></div>
        </div>
    )
}