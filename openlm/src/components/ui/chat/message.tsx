import { useState, Dispatch, SetStateAction } from "react";

import SelectDropdown from "../select/select";

interface MessageProps {
    role: string,
    setRole: Dispatch<SetStateAction<string>>,
    text: string,
    setText: Dispatch<SetStateAction<string>>
}

const Message = (props: MessageProps) => {
    const {role, setRole, text, setText} = props;
    const opts = ["user","assistant"];

    return (
        <div className="w-full h-[150px] border-b flex flex-row justify-between p-4">
            <div className="w-24 h-full mr-2">
                <SelectDropdown
                    label={"Role"}
                    options={opts}
                    value={role}
                    setValue={setRole}
                />
            </div>
            <textarea
                className="text-md w-full h-full resize-none focus:outline-none overflow-y-auto"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a message"
            />
        </div>
    )
}

export default Message;