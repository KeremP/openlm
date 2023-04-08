import { useState } from "react";

export const DEFAULT_PARAMETERS = {
    temperature: 1.0,
    maxLength: 200,
    topP:1,
    frequencyPenalty: 0,
    presencePenalty: 0.01
};
export interface Model {
    modelName: string,
    author: string,
    provided:string,
    version: string,
    parameters: typeof DEFAULT_PARAMETERS
}

interface ModelOptionProps {
    model:Model,
    defaultModel: boolean,
    onSelect: (selected: boolean, model:Model) => void
}

export const ModelOption= (props: ModelOptionProps) => {
    const {model, defaultModel, onSelect} = props;
    const [isChecked, setIsChecked] = useState(defaultModel);

    const onClick = () => {
        let checked = isChecked;
        setIsChecked(!isChecked);
        onSelect(!checked, model);
    }

    // const onClick = () => {
    //     if(isChecked) {
    //         console.log(model);
    //         if(removeModel){
    //           updateStateDict(model.id, "", false);
    //           removeModel(model.id);
    //         }
    //     } else {
    //         if(addModel){
    //           updateStateDict(model.id, "IDLE");
    //           addModel(model);
    //         }
    //     }
    //     setIsChecked(!isChecked);
    // }
    return(
        <button onClick={onClick} className={`${isChecked ? "bg-slate-100": ""} w-52 rounded-md border py-2 px-4 flex flex-row justify-between relative items-center hover:border-black text-left`}>
            <div className="flex flex-col">
                <h2 className="text-md font-semibold">{model.author}/{model.modelName}</h2>
                <span className="text-sm font-light">Added by: {model.provided}</span>
            </div>
            <input
                type="checkbox"
                checked={isChecked}
                readOnly
            />
        </button>
    )
}