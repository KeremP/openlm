import { useState, useContext, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import ChatBar from "src/components/ui/chat/chatbar";
import Message from "~/components/ui/chat/message";
import * as Slider from '@radix-ui/react-slider';
import { MessageContext, MessageType } from "./_app";
import { Model, ModelOption, DEFAULT_PARAMETERS } from "~/components/model";



const DEFAULT_PROMPT = "You are a chat assistant.";

const DEFAULT_MODEL: Model ={
    modelName:"dolly",
    author:"databricks",
    provided:"kerpr",
    version:"1",
    parameters: DEFAULT_PARAMETERS
}

const GPT4ALL: Model = {
    modelName: "gpt4all",
    author:"nomicai",
    provided:"kerpr",
    version: "2",
    parameters: DEFAULT_PARAMETERS
}


const MODELS: Model[] = [
    DEFAULT_MODEL,
    GPT4ALL,
    
];


const defaultMessages: MessageType[] = [
    {
      id: 0, role: "system", text:DEFAULT_PROMPT
    },
    {
      id: 1, role: "user", text:""
    }
];

const reqCompletion = async (messages: MessageType[], modelName: string, params: typeof DEFAULT_PARAMETERS) => {
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

const Chat: NextPage = () => {
    const {data: sessionData } = useSession();
    const [selectedModels, setSelectedModels] = useState<Model[]>([DEFAULT_MODEL]);
    const [selectedModel, setSelectedModel] = useState<Model | null>(DEFAULT_MODEL);
    const [messages, setMessages] = useState<MessageType[]>(defaultMessages);
    const [formValue, setFormValue] = useState("");
    const [sysMessage, setSysMessage] = useState(defaultMessages[0]?.text);
    const [maxTokens, setMaxTokens] = useState(500);
    const [outputs, setOutputs] = useState<OutputType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        if(sysMessage)
        updateMessage(0, sysMessage);
    }, [sysMessage])

    useEffect(() => {
        console.log(outputs)
    }, [outputs])

    const addMessage = (assistant: boolean, text: string, modelName?: string ) => {
        assistant ? 
        setMessages(prev => [...prev, {id:messages.length+1, role:"assistant", text:""}])
        :
        setMessages(prev => [...prev, {id:messages.length+1, role:"user", text:text}])
      }
    
    const removeMessage = (id: number) => {
        if(messages.length !== 1) {
            setMessages(
                messages.filter(m => 
                    m.id !== id && m.role !== "system"
                )
            )
        }
    }

    const changeRole = (id: number, role: string) => {
        const newRoles = messages.map(msg => {
            if(msg.id === id) {
                return {
                    ...msg, role:role
                }
            } else {
                return msg
            }
        })
        setMessages(newRoles);
    }

    const updateMessage = (id: number, text: string) => {
        const newRoles = messages.map(msg => {
            if(msg.id === id) {
                return {
                    ...msg, text:text
                }
            } else {
                return msg
            }
        })
        setMessages(newRoles);
    }

    const updateParams = (model: Model, params: typeof DEFAULT_PARAMETERS) => {
        const newParams = selectedModels.map(m => {
            if(m.modelName === model.modelName && m.version === model.version) {
                return {
                    ...m, parameters:params
                }
            } else {
                return m
            }
        })
        setSelectedModels(newParams);
    }

    const toggleSelectedModel = (selected: boolean, model: Model) => {
        if(selected) {
            setSelectedModels(prev => [...prev, model]);
        } else {
            setSelectedModels(
                selectedModels.filter(m => 
                    m.modelName !== model.modelName && m.version !== model.version    
                )
            )
            setOutputs(
                outputs.filter(output =>
                    output.modelName !== model.modelName    
                )
            )
            if (model === selectedModel || model === DEFAULT_MODEL) setSelectedModel(null)
        }
    }

    // const addLoading = (modelName: string) => {
    //     setLoading(prev => [...prev, modelName]);
    // }

    // const removeLoading = (modelName: string) => {
    //     setLoading(
    //         loading.filter(name => name !== modelName)
    //     );
    // }
    const handleResult = (result: PromiseSettledResult<any>) => {
        if (result.status === "fulfilled") {
            let res = result.value;
            if(res.status === 200) {
                addMessage(true, res.result, res.modelName);
            } else {
                addMessage(true, "There was a problem with calling this model: "+res.message, res.modelName);
            }
        } else {
            addMessage(true, "There was a problem with calling a model");
        }
        // addMessage(true, result)
    } 

    const submitMessages = () => {

        const promises: Promise<any>[] = [];
        setLoading(true);
        selectedModels.forEach(model => {
            console.log(model)
            let promise = reqCompletion(messages, model.modelName, model.parameters);
            promises.push(promise);
            // .then((res) =>{
            //     const inOutputs = outputs.filter(output =>
            //         output.modelName === model.modelName    
            //     );
            //     if(inOutputs.length !== 0) {
            //         const newOutputs = outputs.map(output => {
            //             if(output.modelName === model.modelName) {
            //                 return {
            //                     ...output, text:res
            //                 }
            //             } else {
            //                 return output
            //             }
            //         })
            //         setOutputs(newOutputs)
            //     } else {
            //         setOutputs(prev => [...prev, {modelName:model.modelName, text:res}]);
            //     }
            // });
        });
        Promise.allSettled(promises).
            then((results) => results.forEach((result) => handleResult(result)));
    }

    return (
        <>
        <Head>
            <title>OpenLM</title>
            <meta name="description" content="Compare the outputs of open source LLMs" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-w-screen min-h-screen bg-white">
            <div className="flex flex-col justify-between gap-6 px-4 py-4 h-screen">
                <header className="h-20 w-full flex flex-row justify-between border p-2 items-center -mt-2">
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
                <div className="w-full h-full max-h-[90%] flex flex-row gap-2 justify-between">
                    <div className="h-full w-[300px] border -mt-4 relative flex flex-col p-4">
                        <h2 className="text-sm font-semibold mb-2">PROMPT/SYSTEM</h2>
                        <textarea
                            value={sysMessage}
                            onChange={(e) => setSysMessage(e.target.value)}
                            placeholder={DEFAULT_PROMPT}
                            className="text-md w-full h-full resize-none focus:outline-none overflow-y-auto"
                        />
                    </div>
                    <div className="flex flex-col w-full h-full justify-between">
                        <div className="flex flex-col w-full max-h-[600px] overflow-y-auto gap-4">
                            {
                                messages.map((msg, idx) =>
                                    msg.role != "system" &&
                                    <Message
                                        key={idx}
                                        id={msg.id}
                                        role={msg.role}
                                        text={msg.text}
                                        setText={updateMessage}
                                        setRole={changeRole}
                                        deleteMessage={removeMessage}
                                    />
                                )
                            }
                            <button onClick={() => addMessage(false, "")} className="hover:bg-slate-100 py-4 px-1 flex flex-row gap-2 items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    Add Message
                                </span>
                            </button>
                        </div>
                        <div className="w-full flex flex-col">
                            <button onClick={submitMessages} className="rounded-md px-4 py-2 bg-green-400 text-white w-24 mt-4">
                                Submit
                            </button>
                        </div>
                    </div>
                    <div className="h-full max-h-[95%] overflow-y-auto overflow-x-hidden w-[450px] flex flex-col px-4 py-2 gap-14">
                        <div className="flex flex-col">
                            <h2 className="text-md font-semibold mb-2">
                                Selected Models
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {
                                    selectedModels.map((model, idx) =>
                                        <button onClick={() => setSelectedModel(model)} key={idx} className={`px-4 py-2 flex flex-col ${ selectedModel?.modelName === model.modelName && selectedModel?.version === model.version ? "bg-slate-200": "bg-slate-50"} rounded-md`}>
                                            <h2 className="text-xs font-semibold">{model.author}/{model.modelName}</h2>
                                            
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                       { <div className="flex flex-col">
                            <h2 className="text-md font-semibold mb-2">
                                Parameters
                            </h2>
                            <ModelStats
                                model={selectedModel}
                                updateParams={updateParams}
                            />
                        </div>}

                        <div className="flex flex-col">
                            <h2 className="text-md font-semibold mb-2">
                                Models
                            </h2>
                            <ModelOptions
                                models={MODELS}
                                onSelect={toggleSelectedModel}
                            />
                        </div>
                    </div>

                </div>
                {/* <div className="w-full">
                    
                    <ChatBar
                        formValue={formValue}
                        setFormValue={setFormValue}
                        onSubmit={() => console.log("submit")}
                    />
                </div> */}
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