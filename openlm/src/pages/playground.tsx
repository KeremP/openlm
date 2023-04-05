import React, { 
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    Dispatch, 
    SetStateAction,
 } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../utils/api";
import { styleMap, getDecoratedStyle } from "lib/editor-styles";
import chroma from "chroma-js";
import { Popover } from "react-tiny-popover";
import {
    Loader2,
    Settings2,
    AlertTriangle,
  } from "lucide-react"
import {
    Editor,
    EditorState,
    convertFromRaw,
    convertToRaw,
    CompositeDecorator,
    SelectionState,
    Modifier,
    ContentState,
    RichUtils,
    getDefaultKeyBinding,
} from "draft-js"
import "draft-js/dist/Draft.css"

import { DEFAULT_PARAMETERS_STATE, Model, ModelsStateContext, ModelsStateContextType } from "./_app";
import { Tooltip, TooltipTrigger, TooltipContent } from "components/ui/tooltip";

interface OutputDict {
    [key: string]:string
}

const reqCompletion = async (id: string, prompt: string) => {
  const response = await fetch("/api/completions/completion", {
    method: "POST",
    body: JSON.stringify({id:id, prompt:prompt})
  });
  return response.json();
}

interface ModelStates {
  [key: string]:string
}

const Playground: NextPage = () =>
{
    const {data: sessionData } = useSession();
    const [formValue, setFormValue] = useState("");
    const {models, addModel, removeModel} = useContext(ModelsStateContext);
    const [modelOutputs, setModelOutputs] = useState<OutputDict>({});
    const [modelsState, setModelState] = useState<ModelStates>({});
    const [showSidebar, setShowSidebar] = useState(false);
    
    
    const allModels = api.languageModel.getAll.useQuery();
    const modelsToAdd: Model[] = [];
    allModels.data?.forEach(
      model => {
        let m = {
          ...model,
          parameters:DEFAULT_PARAMETERS_STATE
        }
        modelsToAdd.push(m);
        }
    )

    useEffect(() => {
      console.log(modelsState)
    },[modelsState])

    useEffect(() => {
      console.log(modelOutputs)
    },[modelOutputs])

    const setLoadingState = (id: string) => {
      setModelState(prev => (
        {...prev, [id]:"LOADING"}
      ));
    }

    const setIdleState = (id: string) => {
      setModelState(prev => (
        {...prev, [id]:"IDLE"}
      ));
    }

    const setFinishedState = (id: string) => {
      setModelState(prev => (
        {...prev, [id]:"FINISHED"}
      ));
    }

    const setErrorState = (id: string) => {
      setModelState(prev => (
        {...prev, [id]:"ERROR"}
      ))
    }

    const setOutputState = (id: string, completion: string) => {
      setModelOutputs(prev => (
        {...prev, [id]:completion}
      ))
    }

    const getCompletion = async (id: string, prompt: string) => {
      setLoadingState(id);
      try{
        const result = await reqCompletion(id, prompt);
        setOutputState(id, result);
        setFinishedState(id);
      } catch {
        setOutputState(id, "");
        setErrorState(id);
      }
    }

    const updateStateDict = (id: string, status: string, remove?: boolean) => {
      if (remove === true) {
        let temp = modelsState;
        delete temp[id];
      }
      else {
        switch (status) {
          case "LOADING":
            setLoadingState(id);
            break;
          case "FINISHED":
            setFinishedState(id);
            break;
          case "ERROR":
            setErrorState(id);
            break;
          default:
            setIdleState(id);
            break;
        }
      }
    }
    
    
    const getCompletions = async () => {
      // TODO: collect these async calls
        models.forEach(async model => {
            const prompt = formValue;
            getCompletion(model.id, prompt);
        })
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
                availableModels={modelsToAdd}
                updateStateDict={updateStateDict}
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

                <div className="h-[300px] border -mt-4 relative">
                    <textarea
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                        className="text-md w-full h-full resize-none focus:outline-none p-4 overflow-y-auto"
                    />
                    <button onClick={getCompletions} className="rounded-md px-4 py-2 bg-green-500 text-white absolute bottom-4 right-2">
                        Submit
                    </button>
                </div>
                <div className="h-2/3 w-full grid grid-cols-2 md:grid-cols-3 overflow-y-auto gap-4">
                    {
                      models.length === 0 && 
                      <div className="w-[500px] h-full border flex flex-col justify-center items-center">
                            <button onClick={() => setShowSidebar(true)} className="text-md rounded-md bg-black px-4 py-2 text-white">
                                Add a model
                            </button>
                      </div>
                    }
                    
                    {
                      models.map((model,idx) => 
                        <ModelCard
                          key={idx}
                          model={model}
                          modelState={modelsState[model.id]}
                          showHighlights={false}
                          showProbabilities={false}
                          completion={modelOutputs[model.id]}
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





interface ModelOutputProps {
    id: string,
    modelName: string,
    author: string,
    output: string | null | undefined
}

const ModelOutput: React.FC<ModelOutputProps> = ({id, modelName, author, output}) => {
    

    return (
        <div className="max-w-[400px] w-full h-full border flex flex-col">
            <div className="h-[90%] w-full p-4">
                <p className="leading-normal text-xs">
                    {output}
                </p>
            </div>
            <div className="w-full">
                <span className="w-full text-right">
                    {author}/{modelName}
                </span>
            </div>
        </div>
    )
}


interface ModelSearchOpts {
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
    addModel?: ({id, modelName, author, version, warmState, parameters}:Model) => void,
    removeModel?: (id: string) => void,
    availableModels: Model[],
    updateStateDict: (id: string, status: string, remove?: boolean) => void
}

const ModelSearch: React.FC<ModelSearchOpts> = ({show, addModel, removeModel, setShow, availableModels, updateStateDict}) => {
    
    const [searchInput, setSearchInput] = useState("");

    return (
        <div className={`${show ? "": "hidden"} z-10 absolute top-0 right-0 h-screen w-screen bg-slate-100/50 backdrop-blur-sm flex justify-center items-center`}>
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
                            else if (model.modelName.toLocaleLowerCase().includes(searchInput) || model.author.toLocaleLowerCase().includes(searchInput)) {
                                return true;
                            }
                        }).map((model, idx) =>
                            <ModelOption
                                key={idx}
                                model={model}
                                addModel={addModel}
                                removeModel={removeModel}
                                updateStateDict={updateStateDict}
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
    model:Model,
    warmState: string,
}

interface ModelOptionProps {
    model:Model,
    addModel?: ({id, modelName, author, version, warmState, parameters}:Model) => void,
    removeModel?: (id: string) => void,
    updateStateDict: (id: string, status: string, remove?: boolean) => void
}

const ModelOption: React.FC<ModelOptionProps> = ({
    model, addModel, removeModel, updateStateDict
}) => {
    const [isChecked, setIsChecked] = useState(false);

    const onClick = () => {
        if(isChecked) {
            console.log(model);
            if(removeModel){
              updateStateDict(model.id, "", false);
              removeModel(model.id);
            }
        } else {
            if(addModel){
              updateStateDict(model.id, "IDLE");
              addModel(model);
            }
        }
        setIsChecked(!isChecked);
    }
    return(
        <button onClick={onClick} className="w-52 rounded-md border py-2 px-4 flex flex-row justify-between relative items-center hover:border-black text-left">
            <div className="flex flex-col">
                <h2 className="text-md font-semibold">{model.author}/{model.modelName}</h2>
                <span className="text-sm font-light">Provided by: {model.author}</span>
            </div>
            <input
                type="checkbox"
                checked={isChecked}
                readOnly
            />
            <span className={`absolute top-0 right-0 translate-x-2 -translate-y-2 rounded-full ${model.warmState ? "bg-orange-400 text-orange-700": "bg-slate-100 text-gray-600"} px-2 text-xs`}>
                {model.warmState ? "warm": "cold"}
            </span>
        </button>
    )
}


const normalize_parameter = (parameter: number) => {
    if (parameter > 1) return parameter
    else return parameter.toFixed(1)
}

interface ModelCardStatsProps {
    model: Model,
    errorMessage: string | null,
    is_running: boolean,
    totalCharacters: number
}

const ModelCardStats = (props: ModelCardStatsProps) => {
    const {model, errorMessage, is_running, totalCharacters} = props
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
    const intervalRef = useRef<any>(null);
    const [time, setTime] = useState(0);
    
    useEffect(() => {
      if (is_running && isTimerRunning === false) {
        startTimer()
      } else if (!is_running && isTimerRunning === true) {
        stopTimer()
      }
    }, [is_running])
  
  
    const startTimer = () => {
      setIsTimerRunning(true)
      setTime(0)
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }
  
    const stopTimer = () => {
      clearInterval(intervalRef.current)
      setIsTimerRunning(false)
    }
  
    function insertLineBreaks(str: string | null) {
      if (str === undefined || str === null) return [];
  
      const words = str.split(" ");
      const result = [];
      let accumulator = "";
  
      for (let i = 0; i < words.length; i++) {
        accumulator += `${words[i]} `;
        
        if ((i + 1) % 4 === 0 || i === words.length - 1) {
          result.push(accumulator);
          accumulator = "";
        }
      }
      return result;
    }
  
    const paragraphs = insertLineBreaks(errorMessage).map((words, index) => (
      <span className = "block text-center" key={index}>{words}</span>
    ));
  
    const token_per_second =
      totalCharacters > 0 ? Math.floor(totalCharacters / Math.max(time, 1)) : 0
  
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60)
        .toString()
        .padStart(2, "0")
      const seconds = (time % 60).toString().padStart(2, "0")
      return `${minutes}:${seconds}`
    }
  
    return (
        <div className="flex flex-col">
            <span className="font-semibold text-md">{model.author}/{model.modelName}</span>
            <div className="flex font-medium text-sm">
                <span>{formatTime(time)}</span>
                <span className="flex-1"></span>
                <span>
                <Tooltip delayDuration={300} skipDelayDuration={150} open={errorMessage ? true : false}>
                    <TooltipTrigger asChild>
                    <div style = {{display: (errorMessage ) ? "block" : "none"}}>
                        <AlertTriangle color = "#f56760"/>
                    </div>
                    </TooltipTrigger>
                    <TooltipContent side={"top"}>
                    <>{paragraphs}</>
                    </TooltipContent>
                </Tooltip>
                    
                {token_per_second === 0 || errorMessage ? "" : `${token_per_second} chars/s`}{" "}
                </span>
                <span className="flex-1"></span>
                <span>{totalCharacters} chars</span>
            </div>
        </div>
    )
  }
  


const ModelEditor = React.memo((props: any) => {
    const {
      editorState,
      setEditorState
    } = props
  
    return (
      <Editor
        customStyleMap={styleMap}
        editorState={editorState}
        onChange={(editorState) => {
          setEditorState(editorState)
        }}
      />
    )
})

interface ModelCardProps {
    model:Model,
    modelState?: string,
    showHighlights: boolean,
    showProbabilities: boolean,
    completion?: string
}

const ModelCard = forwardRef((props: ModelCardProps, ref: any) => {
    const token_index = useRef(0)
    const {model, modelState, showHighlights, showProbabilities, completion} = props
    const [errorMessage, setErrorMessage] = useState(null);
    const [totalCharacters, setTotalCharacters] = useState(0);
    const [output, setOutput] = React.useState<string>("")
    const [status, setStatus] = React.useState<string[]>([])
  
    const showProbabilitiesRef = useRef(showProbabilities)
    const showHighlightsRef = useRef(showHighlights)
    
    useEffect(() => {
      console.log(modelState)
    }, [modelState])

    useEffect(() => {
      setEditorState(
        EditorState.forceSelection(editorState, editorState.getSelection())
      )
    }, [showProbabilities, showHighlights])
    
    useEffect(() => {
      showProbabilitiesRef.current = showProbabilities
      showHighlightsRef.current = showHighlights
    })
    
    useEffect(() => {
        if(completion) {
          if (completion.length > token_index.current) {
            let completion_slice = completion.slice(token_index.current, completion.length)
            token_index.current = completion.length;
            setOutput(completion_slice)
          }
        }
    }, [completion])
  
    const Decorated = (props: any) => {
      const children = props.children
      const entity = props.contentState.getEntity(props.entityKey)
      const entityData = entity.getData()
      const style = getDecoratedStyle(entityData.modelProvider, showHighlightsRef.current)
      const probabilitiesMap = entityData.topNDistribution
      const tokensMap = probabilitiesMap ? probabilitiesMap["tokens"] : []
  
      const [popoverOpen, setPopoverOpen] = React.useState<boolean>(false)
      if (entityData.message === props.decoratedText) {
        let content = (
          <span style={style} key={children[0].key} data-offset-key={children[0].key}>
            {children}
          </span>
        )
        
        if (probabilitiesMap && (tokensMap[props.decoratedText] != undefined && tokensMap[props.decoratedText].length > 0)) {
          let percentage = Math.min(tokensMap[props.decoratedText][1] / probabilitiesMap.simpleProbSum, 1.0)
          let f = chroma.scale(["#ff8886", "ffff00", "#96f29b"])
          let highlight_color = f(percentage)
  
          let custom_style = showProbabilitiesRef.current ? {
            backgroundColor: highlight_color.css(),
            padding: "2px 0",
          } : style
  
          let popoverContent = 
          (
            <div className="shadow-xl shadow-inner rounded-sm bg-white mb-2" data-container="body">
              <ul key={children[0].key} className="grid pt-4">
                {
                  Object.entries(tokensMap).map((item, index) => {
                    return (
                      <li key={item + "-" + index + "-" + children[0].key} className={item[0] === entityData.message ? "bg-highlight-tokens w-full font-base text-white pl-4" : "pl-4 text-bg-slate-800"}>
                        {item[0]} = {tokensMap[item[0]][1]}%
                      </li>
                    )
                  })
                }
              </ul>
              <div className="m-4 pb-4">
                <div className="text-base">Total: {probabilitiesMap.logProbSum} logprob on 1 tokens</div>
                <div className="text-xs">({probabilitiesMap.simpleProbSum}% probability covered in top {Object.keys(probabilitiesMap.tokens).length} logits)</div>
              </div>
            </div>
          )
          content = (
            <Popover 
              isOpen={popoverOpen} 
              onClickOutside={() => setPopoverOpen(false)}
              positions={["bottom", "top", "left", "right"]}
              content={popoverContent}
              containerStyle={{zIndex: "1000"}}
            >
              <span style={custom_style} className={popoverOpen ? "font-bold" : ""} id={children[0].key} key={children[0].key} data-offset-key={children[0].key} onClick={() => {showProbabilitiesRef.current ? setPopoverOpen(!popoverOpen) : null}}>
                {children}
              </span>
            </Popover>
          )
        }
  
        return content
      } else {
        return <span data-offset-key={children[0].key}>{children}</span>
      }
    }
    
    const getEditorState = useCallback((): EditorState => editorStateRef.current, [])
  
    const createDecorator = () => new CompositeDecorator([{
      strategy: findEntityRangesByType("HIGHLIGHTED_WORD"),
      component: Decorated,
      props: {
        getEditorState,
      }
    }])
  
    const [editorState, setEditorState] = React.useState(EditorState.createEmpty(createDecorator()))
    const editorStateRef = useRef<EditorState>(editorState)
  
    function findEntityRangesByType(entityType: any) {
      return (contentBlock: any, callback: any, contentState: any) => {
        contentBlock.findEntityRanges((character: any) => {
          const entityKey = character.getEntity()
          if (entityKey === null) {
            return false
          }
          return contentState.getEntity(entityKey).getType() === entityType
        }, callback)
      }
    }
  
    useEffect(() => {
      let current_editor_state = editorState;
      let aggregate_new_chars = 0;
  
      try {
        for(const output_entry of output) {
  
          aggregate_new_chars += output_entry.split("").length
          const currentContent = current_editor_state.getCurrentContent()
          const blockMap = currentContent.getBlockMap()
          const key = blockMap.last().getKey()
          const length = blockMap.last().getLength()
          const selection = new SelectionState({
            anchorKey: key,
            anchorOffset: length,
            focusKey: key,
            focusOffset: length,
          })
  
          currentContent.createEntity("HIGHLIGHTED_WORD", "MUTABLE", output_entry)
  
          const entityKey = currentContent.getLastCreatedEntityKey()
  
          const textWithInsert = Modifier.insertText(
            currentContent,
            selection,
            output_entry,
            undefined,
            entityKey
          )
          const editorWithInsert = EditorState.push(
            editorState,
            textWithInsert,
            "insert-characters"
          )
          current_editor_state = editorWithInsert
        }
      } catch (e) {
      }
      setTotalCharacters(totalCharacters + aggregate_new_chars)
      setEditorState(current_editor_state)
    }, [output])
  
    // useEffect(() => {
    //   if (status === "[INITIALIZING]") {
    //     setServerModelState("INITIALIZED")
    //     setTotalCharacters(0)
    //     setErrorMessage(null)
    //     return
    //   }
    //   if (status && status.message.indexOf("[ERROR] ") === 0 && (serverModelState !== "COMPLETED" && serverModelState !== "IDLE")) {
    //     setServerModelState("ERROR")
    //     setErrorMessage(status.message.replace("[ERROR] ", ""))
    //     return
    //   }
    //   if (status.message === "[COMPLETED]") {
    //     setServerModelState("COMPLETED")
    //     return
    //   }
    // }, [status])
  
    // const handleNotification = (output: any) => {
    //   setOutput(output)
    // }
  
    // const handleNotificationStatus = (status: any) => {
    //   setStatus(status)
    // }
  
    const handleUndo = (output: any) => {
      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromText(""),
          createDecorator()
        )
      )
    }
  
    useImperativeHandle(ref, () => ({
    //   handleNotification,
      handleUndo,
    //   handleNotificationStatus
    }))
  
    let border_class = ""
    switch (modelState) {
      case "INITIALIZED":
        border_class = "border_inference_pending border_inference_animate"
        break
      case "LOADING":
        border_class = "border_inference_animate"
        break
      case "FINISHED":
        border_class = "border_inference_complete"
        break
      case "ERROR":
        border_class = "border_inference_error"
        break
      default:
        break
    }
  
    return (
      <div className={`w-full flex flex-col items-center text-gray-600 text-lg font-bold h-96`}
        style = { {
          transition: "all 0.3s ease",
          backgroundColor: "#ffffff",
          borderRadius: 0,
          padding: 0
        } }>
        <div className="relative editor-container h-full w-full text-base flex mt-2" style = {{clipPath: "inset(-1px)"}}>
          <div
            className={`font-medium relative p-3 overflow-hidden flex-1 flex flex-col justify-between loading_border ${border_class}`}
          >
            <ModelEditor {...props} editorState ={editorState} setEditorState ={setEditorState} />
            <ModelCardStats
                model={model}
                errorMessage={errorMessage}
                totalCharacters={totalCharacters}
                is_running = {modelState !== "ERROR" && modelState !== "FINISHED" && modelState !== "INITIALIZED" && modelState !== "IDLE"}
            />
         </div>
        </div>
      </div>
    )
})