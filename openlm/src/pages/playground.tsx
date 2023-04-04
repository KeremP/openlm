import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { api } from "../utils/api";

const testModels: AvailableModelProps[] = [
    {
        model: {
            modelName: "test-GPT-4",
            id:"00001"
        },
        warmState: "warm",
        author: "Kerem"
    },
    {
        model: {
            modelName: "test-GPT-5",
            id:"00002"
        },
        warmState: "cold",
        author: "Kerem"
    }
];

interface ModelState {
    id: string,
    modelName: string
}

interface OutputDict {
    [key: string]:string
}

interface addModelProps {
    id: string,
    modelName: string
}

const Playground: NextPage = () =>
{
    const {data: sessionData } = useSession();
    const [formValue, setFormValue] = useState("");
    const [models, setModels] = useState<ModelState[]>([]);
    const [modelOutputs, setModelOutputs] = useState<OutputDict>({});
    const [showSidebar, setShowSidebar] = useState(false);
    const [availableModels, setAvailableModels] = useState<AvailableModelProps[]>(testModels);
    
    const allModels = api.languageModel.getAll.useQuery();
    useEffect(() => {
        const modelsToAdd: AvailableModelProps[] = [];
        allModels.data?.forEach(m => {
            modelsToAdd.push(
                {
                    model: {
                        id:m.id,
                        modelName:m.modelName,
                    },
                    warmState:m.state,
                    author:m.author
                }
            )
        });
        setAvailableModels(modelsToAdd);

    },[])

    const addModel = ({id, modelName}: addModelProps) => {
        setModels(prev => [
            ...prev, {id:id, modelName:modelName}
        ]);
    };

    const removeModel = ({id, modelName}: addModelProps) => {
        const modelArr = models;
        for(let i=0;i<modelArr.length;i++) {
            const m = modelArr[i]; // @ts-ignore
            if (m.id === id) {
                // console.log(m)
                modelArr.splice(i, 1);
                break;
            }
        }
        setModels(modelArr);
    }

    return (
        <>
        <Head>
            <title>OpenLM</title>
            <meta name="description" content="Compare the outputs of open source LLMs" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-w-screen min-h-screen bg-white">
            <ModelSearch
                show={showSidebar}
                setShow={setShowSidebar}
                addModel={addModel}
                removeModel={removeModel}
                availableModels={availableModels}
            />
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

                <div className="h-[300px] border -mt-4">
                    <textarea
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                        className="text-md w-full h-full resize-none focus:outline-none p-4 overflow-y-auto"
                    />
                </div>
                <div className="h-2/3 w-full flex flex-wrap overflow-y-auto gap-4">
                    {
                        models.length === 0 && 
                        <div className="w-[500px] h-full border flex flex-col justify-center items-center">
                            <button onClick={() => setShowSidebar(true)} className="text-md rounded-md bg-black px-4 py-2 text-white">
                                Add a model
                            </button>
                        </div>
                    }
                    {
                       models.length > 0 && models.map((model, idx) =>
                            <ModelOutput
                                key={idx}
                                modelName={model.modelName}
                                id={model.id}
                                output={modelOutputs[model.id]}
                            />
                        )
                    }
                </div>
            </div>
        </main>
        </>
    )
}

export default Playground;

interface AuthProps {
    children?: React.ReactNode
}

const RequireAuth: React.FC<AuthProps> = ({children}) => {
    
    const {data: sessionData } = useSession();

    return(
        <>
        {
            !sessionData && 
            <div className="h-screen w-screen absolute top-0 left-0 flex justify-center items-center bg-gray-50/50 backdrop-blur-sm">
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

interface ModelOutputProps {
    id: string,
    modelName: string,
    output: string | null | undefined
}

const ModelOutput: React.FC<ModelOutputProps> = ({id, modelName, output}) => {
    

    return (
        <div className="max-w-[400px] w-full h-full border flex flex-col">
            <div className="h-[90%] w-full p-4">
                <p className="leading-normal text-xs">
                    {output}
                </p>
            </div>
            <div className="w-full">
                <span className="w-full text-right">
                    {modelName}
                </span>
            </div>
        </div>
    )
}


interface ModelSearchOpts {
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
    addModel: ({id,modelName}:addModelProps) => void,
    removeModel: ({id,modelName}:addModelProps) => void,
    availableModels: AvailableModelProps[]
}

const ModelSearch: React.FC<ModelSearchOpts> = ({show, addModel, removeModel, setShow, availableModels}) => {
    
    const [searchInput, setSearchInput] = useState("");

    return (
        <div className={`${show ? "": "hidden"} absolute top-0 right-0 h-screen w-screen bg-slate-100/50 backdrop-blur-sm flex justify-center items-center`}>
            <div className="rounded-md bg-white p-4 flex flex-col w-[750px] h-[400px] relative">
                <div className="w-full border-b focus-within:border-black">
                    <input
                        className="py-4 text-md focus:outline-none w-full h-full"
                        placeholder="Search for a model..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                    {
                        availableModels.filter(model => {
                            if(searchInput === "") return true;
                            else if (model.model.modelName.toLocaleLowerCase().includes(searchInput) || model.author.toLocaleLowerCase().includes(searchInput)) {
                                return true;
                            }
                        }).map((model, idx) =>
                            <ModelOption
                                key={idx}
                                model={model.model}
                                warmState={model.warmState}
                                author={model.author}
                                addModel={addModel}
                                removeModel={removeModel}
                            />
                        )
                    }
                </div>
                <button onClick={() => setShow(false)} className="absolute top-2 right-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

interface AvailableModelProps {
    model:ModelState,
    warmState: string,
    author: string,
}

interface ModelOptionProps {
    model:ModelState,
    warmState: string,
    author: string,
    addModel: ({id,modelName}:addModelProps) => void,
    removeModel: ({id,modelName}:addModelProps) => void
}

const ModelOption: React.FC<ModelOptionProps> = ({
    model, warmState, author, addModel, removeModel
}) => {
    const [isChecked, setIsChecked] = useState(false);

    const onClick = () => {
        if(isChecked) {
            console.log(model)
            removeModel(model);
        } else {
            addModel(model);
        }
        setIsChecked(!isChecked);
    }
    return(
        <button onClick={onClick} className="w-52 rounded-md border py-2 px-4 flex flex-row justify-between relative items-center hover:border-black text-left">
            <div className="flex flex-col">
                <h2 className="text-md font-semibold">{model.modelName}</h2>
                <span className="text-sm font-light">Provided by: {author}</span>
            </div>
            <input
                type="checkbox"
                checked={isChecked}
                readOnly
            />
            <span className={`absolute top-0 right-0 translate-x-2 -translate-y-2 rounded-full ${warmState === 'warm' ? "bg-orange-400 text-orange-700": "bg-slate-100 text-gray-600"} px-2 text-xs`}>
                {warmState}
            </span>
        </button>
    )
}