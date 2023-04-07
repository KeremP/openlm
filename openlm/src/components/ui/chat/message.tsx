import { useState, Dispatch, SetStateAction } from "react";

import SelectDropdown from "../select/select";

interface MessageProps {
    id: number,
    role: string,
    text: string,
    setRole: (id: number, role: string) => void,
    setText: (id: number, text: string) => void,
    deleteMessage: (id: number) => void,
}

const Message = (props: MessageProps) => {
    const {id, role, setRole, text, setText, deleteMessage} = props;
    const opts = ["user","assistant"];

    const setValue = (value: string) => {
        setRole(id, value);
    }

    const onChange = (value: string) => {
        setText(id, value);
    }

    const onDelete = () => {
        deleteMessage(id);
    }
    
    return (
        <div className="w-full min-h-[150px] h-[150px] border-b flex flex-row justify-between p-4 relative">
            <button onClick={onDelete} className="absolute top-2 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            
            <div className="w-24 h-full mr-2">
                <SelectDropdown
                    label={"Role"}
                    options={opts}
                    value={role}
                    setValue={setValue}
                />
            </div>
            <textarea
                className="text-md w-full h-full resize-none focus:outline-none overflow-y-auto"
                value={text}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter a message"
            />
        </div>
    )
}

export default Message;