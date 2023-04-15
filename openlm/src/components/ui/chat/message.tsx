// TODO: move this to components
import { ModelAvatar, ModelAvatarProps } from "~/pages/chat";
import { Model } from "~/components/model";
import { Avatar } from "../avatar";

export interface MessageProps {
    id: number,
    role: string,
    text: string,
    model?: Model
}

const Message = (props: MessageProps) => {
    const {id, role, text, model} = props;
    
    return (
        <div className="w-full border-b flex flex-row p-4 relative">
            {/* <button onClick={onDelete} className="absolute top-2 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button> */}
            
            <div className="w-24 h-full mr-2 flex flex-col gap-2">
                {/* <SelectDropdown
                    label={"Role"}
                    options={opts}
                    value={role}
                    setValue={setValue}
                /> */}
                {
                    role === "assistant" && model &&
                    <ModelAvatar
                        model={model}
                    />
                }
                {
                    role === "user" &&
                    <Avatar>
                        <div className="w-full h-full bg-slate-100 rounded-full"></div>
                    </Avatar>
                }
            </div>
            <p
                className="text-md w-full h-full overflow-y-auto leading-normal break-words whitespace-pre pt-2"
            >
                {text}
            </p>
        </div>
    )
}

export default Message;