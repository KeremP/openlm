import { useState, useContext, useEffect, useRef } from "react";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import ChatBar from "src/components/ui/chat/chatbar";
import Message from "~/components/ui/chat/message";
import { MessageContext, MessageType } from "./_app";

const DEFAULT_PROMPT = "You are a chat assistant.";

const defaultMessages: MessageType[] = [
    {
      id: 0, role: "system", text:"You are a helpful assistant"
    },
    {
      id: 1, role: "user", text:""
    }
];

const Chat: NextPage = () => {
    const {data: sessionData } = useSession();
    const [messages, setMessages] = useState<MessageType[]>(defaultMessages);
    const [formValue, setFormValue] = useState("");
    const [sysMessage, setSysMessage] = useState(defaultMessages[0]?.text);
    const [maxTokens, setMaxTokens] = useState(500);

    useEffect(() => {
        if(sysMessage)
        updateMessage(0, sysMessage);
    }, [sysMessage])

    const addMessage = () => {
        setMessages(prev => [...prev, {id:messages.length+1, role:"user", text:""}]);
      }
    
    const removeMessage = (id: number) => {
        console.log(id)
        setMessages(
            messages.filter(m => 
                m.id !== id && m.role !== "system"
            )
        )
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
                <div className="w-full h-full flex flex-row gap-2 justify-between">
                    <div className="h-full w-[300px] border -mt-4 relative flex flex-col p-4">
                        <h2 className="text-sm font-semibold mb-2">PROMPT/SYSTEM</h2>
                        <textarea
                            value={sysMessage}
                            onChange={(e) => setSysMessage(e.target.value)}
                            placeholder={DEFAULT_PROMPT}
                            className="text-md w-full h-full resize-none focus:outline-none overflow-y-auto"
                        />
                        <div className="h-12 border w-full flex-row justify-between">
                            
                        </div>
                    </div>
                    <div className="flex flex-col w-full h-full gap-4">
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
                        <button onClick={addMessage} className="hover:bg-slate-100 py-4 px-1 flex flex-row gap-2 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                                Add Message
                            </span>
                        </button>
                        
                        {/* <Message
                            role={role}
                            setRole={setRole}
                            text={msg}
                            setText={setMsg}
                        /> */}
                    </div>

                </div>
                <div className="w-full">
                    <ChatBar
                        formValue={formValue}
                        setFormValue={setFormValue}
                        onSubmit={() => console.log("submit")}
                    />
                </div>
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
