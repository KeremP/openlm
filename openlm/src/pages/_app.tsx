import React, { useEffect, useState } from "react";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { LanguageModel } from "@prisma/client";


export const DEFAULT_PARAMETERS_STATE = {
  temperature: 1.0,
  maximumLength: 200,
  topP: 0.9,
  topK: 0,
  repetitionPenalty: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  stopSequences: "",
  // highlightModels: true,
  // showProbabilities: false
};

// TODO: update role type to be list of viable string literals
export interface MessageType {
  id: number,
  role: string,
  text: string
}

export interface MessageContextType {
  messages: MessageType[],
  addMessage: (message: MessageType) => void,
  removeMessage: (id: number) => void,
  changeRole: (id: number, role: string) => void,
  updateMessage: (id: number, text: string) => void
}

const defaultMessages: MessageType[] = [
  {
    id: 0, role: "system", text:"You are a helpful assistant"
  },
  {
    id: 1, role: "user", text:""
  }
]

export const MessageContext = React.createContext<MessageContextType>({
  messages: defaultMessages,
  addMessage: (message: MessageType) => {},
  removeMessage: (id: number) => {},
  changeRole: (id: number, role: string) => {},
  updateMessage: (id: number, text: string) => {}
});

export const MessageContextWrapper = ({children}: any) => {
  const [messages, setMessages] = useState<MessageType[]>(defaultMessages);

  useEffect(() => {
    console.log(messages)
  },[messages])

  const addMessage = (message: MessageType) => {
    setMessages(prev => [...prev, message]);
  }

  const removeMessage = (id: number) => {
    const temp = messages;
    temp.splice(id, 1);
    setMessages(temp);
  }

  const changeRole = (id: number, role: string) => {
    console.log(id,role)
    const temp = messages;
    let msg = temp[id]
    let text = "";
    msg? text = msg.text : text = "";
    let newMsg = {
      id:id, role:role, text:text
    }
    temp.splice(id, 1, newMsg);
    setMessages(temp);
  }

  const updateMessage = (id: number, text: string) => {
    const temp = messages;
    let msg = temp[id];
    if (msg) {
      let newMsg = {
        id:id, role:msg.role, text:text
      };
      
      temp.splice(id, 1, newMsg)
      setMessages(temp);
    }

  }

  return (
    <MessageContext.Provider value={{messages, addMessage, removeMessage, changeRole, updateMessage}}>
      {children}
    </MessageContext.Provider>
  )

}

export interface Model {
  id: string,
  modelName: string,
  author: string,
  version: string,
  warmState: boolean,
  parameters: typeof DEFAULT_PARAMETERS_STATE
};

export interface ModelsStateContextType {
  models: Model[],
  addModel?: ({id, modelName, author, version, parameters=DEFAULT_PARAMETERS_STATE}:Model) => void,
  removeModel?: (id: string) => void,
  updateModelParameters?: (id: string, parameters: typeof DEFAULT_PARAMETERS_STATE) => void,
}

export const ModelsStateContext = React.createContext<ModelsStateContextType>({models:[]});

const ModelsStateContextWrapper = ({children}: any) => {
  const [models, setModels] = useState<Model[]>([]);

  const getModelIdx = (id: string, currentModels: Model[]) => {
    let idx: number | null = null;
    for(let i=0;i<currentModels.length;i++){
      let m = currentModels[i]; // @ts-ignore
      if(m.id === id) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  const addModel = ({id, modelName, author, version, warmState, parameters=DEFAULT_PARAMETERS_STATE}:Model) => {
    setModels(prev =>
      [...prev, {id, modelName, author, version, warmState, parameters}]
    );
  }

  const removeModel = (id: string) => {
    const currentModels = models;
    let idx = getModelIdx(id, currentModels);
    if (idx === null) return;

    currentModels.splice(idx, 1);
    setModels(currentModels);
  }

  const updateModelParameters = (id: string, parameters: typeof DEFAULT_PARAMETERS_STATE) => {
    const currentModels = models;
    let idx = getModelIdx(id, currentModels);
    if (idx === null) return;

    let modelToChange = currentModels.splice(idx, 1);
    if (modelToChange[0] != undefined) {
      let model = modelToChange[0];
      model['parameters'] = parameters;
      currentModels.splice(idx, 0 , model);
    }
    setModels(currentModels);
  }

  return (
    <ModelsStateContext.Provider value={{models, addModel, removeModel, updateModelParameters}}>
      {children}
    </ModelsStateContext.Provider>
  )

}



const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <MessageContextWrapper>
        <ModelsStateContextWrapper>
          <Component {...pageProps} />
        </ModelsStateContextWrapper>
      </MessageContextWrapper>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
