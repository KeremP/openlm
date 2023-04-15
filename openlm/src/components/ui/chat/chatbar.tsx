import {
    Dispatch, 
    SetStateAction,
} from "react"

interface ChatBarProps {
    formValue: string,
    setFormValue: Dispatch<SetStateAction<string>>,
    onSubmit: () => void,
    loading: boolean
}

const ChatBar = (props: ChatBarProps) => {
    const {formValue, setFormValue, onSubmit, loading} = props;
    return (
        <div className="w-full border p-4 rounded-md bg-gray-700 text-white flex flex-row">
            <textarea
                tabIndex={0}
                rows={1}
                className="max-h-[200px] m-0 w-full h-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 focus:outline-none focus:ring-0 focus-visible:ring-0 md:pl-0"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
            />
            <button onClick={onSubmit} className="ml-2">
                {!loading && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>}
                {loading && 
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                }

            </button>

        </div>
    )
}

export default ChatBar;