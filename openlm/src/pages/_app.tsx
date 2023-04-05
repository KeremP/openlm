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
  removeModel?: (id: string) => void
}

export const ModelsStateContext = React.createContext<ModelsStateContextType>({models:[]});

const ModelsStateContextWrapper = ({children}: any) => {
  const [models, setModels] = useState<Model[]>([]);

  const addModel = ({id, modelName, author, version, warmState, parameters=DEFAULT_PARAMETERS_STATE}:Model) => {
    setModels(prev =>
      [...prev, {id, modelName, author, version, warmState, parameters}]
    );
  }

  const removeModel = (id: string) => {
    const currentModels = models;
    let idx: number | null = null;
    for(let i=0;i<currentModels.length;i++){
      let m = currentModels[i]; // @ts-ignore
      if(m.id === id) {
        idx = i;
        break;
      }
    }

    if (idx === null) {
      return;
    }

    currentModels.splice(idx, 1);

    setModels(currentModels);
  }

  return (
    <ModelsStateContext.Provider value={{models, addModel, removeModel}}>
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
      <ModelsStateContextWrapper>
        <Component {...pageProps} />
      </ModelsStateContextWrapper>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
