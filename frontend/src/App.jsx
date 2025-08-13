import { useState, useEffect, useRef } from "react";
import "./App.css"
import NewChatScreen from "./components/NewChatScreen";
import CopyButton from "./components/CopyButton";
import FeaturesPanel from "./components/FeaturesPanel";
import MarkdownRenderer from "./components/MarkdownRenderer ";
import { MoveDown } from "lucide-react";
import DrawerBasic from "./components/Drawer/Drawer";

import {
  Bot,
  Brain,
  Calculator,
  Check,
  Copy,
  FileText,
  Mail,
  Menu,
  Send,
  Sparkles,
  Twitter,
  Zap,
} from "lucide-react";

import { Badge } from "./components/ui/Badge";
import { Options } from "./components/Options";


function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setIsNewChat(false);
    const newHistory = [...history, { role: "user", parts: [{ text: input }] }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
        signal,
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error("Server returned non-200 response:", resp.status, text);
        throw new Error("API request failed");
      }
      const data = await resp.json();

      setHistory((h) => {
        const updated = [
          ...h,
          {
            role: "model",
            parts: [
              { text: data?.data?.text || data?.data?.[0] || data.parts },
            ],
          },
        ];
        localStorage.setItem("chatHistory", JSON.stringify(updated));
        return updated;
      });
      console.log("data.data.text: ", data.data.text);
      console.log("data.data.content: ", data.data[0]);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    abortControllerRef.current = null;
  };

  const stopLoading = () => {
    console.log(
      "Stop button clicked, abortControllerRef:",
      abortControllerRef.current
    );
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      console.log("Stopped the AI from overthinking!");
    }
  };
  useEffect(() => {
    const getItem = JSON.parse(localStorage.getItem("chatHistory"));
    if (getItem) {
      setHistory(getItem);
      setIsNewChat(getItem.length === 0);
    }
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollable = container.scrollHeight - container.clientHeight;
      const scrolled = container.scrollTop;
      setShowScrollButton(scrollable - scrolled > 10);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setShowScrollButton(false);
    }
  };
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, loading]);

  const deleteHistory = () => {
    setHistory([]);
    setIsNewChat(true);
    localStorage.removeItem("chatHistory");
  };
  return (
    <>
      <div className="bg-[#0f1115] h-fit body">
        <div className=" fixed inset-0 bg-[radial-gradient(70%_60%_at_30%_0%,rgba(16,185,129,0.14),rgba(0,0,0,0)_60%),radial-gradient(60%_50%_at_80%_10%,rgba(147,51,234,0.12),rgba(0,0,0,0)_55%)]" />
        <header className="sticky top-0 z-30 w-full h-[9%] pb-3 flex  justify-between pt-2 px-8  border-b border-white/5 bg-[#0d0f13]/50 backdrop-blur-3xl backdrop-opacity-90">
          <h2 className="text-2xl font-bold text-white flex gap-2 items-center">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-base text-white font-semibold">MS Agent</span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="hidden lg:block mt-3">
              <Badge>
                Model:{" "}
                <span className="ml-1 font-medium text-emerald-300">
                  Gemini-1.5-flash
                </span>
              </Badge>
            </div>
            <div className="block lg:hidden xl:hidden mt-3">
              <DrawerBasic />
            </div>
          </div>
        </header>
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-0 md:px-4 pb-8 pt-2 lg:grid-cols-[200px_minmax(0,1fr)_300px] md:gap-6 lg:gap-8">
          <aside className="hidden lg:block">
            <Options method={deleteHistory} />
          </aside>

          <main
            ref={chatContainerRef}
            className="rounded-2xl relative w-full min-h-0 flex flex-col flex-1 "
          >
            <div className="flex relative w-full min-h-0 flex-1 h-[78dvh] md:h-[84dvh] lg:h-[86dvh] flex-col">
              {/* <header className="flex items-center justify-between border-b border-white/5 px-4 py-4">
          <span className="text-sm font-medium text-neutral-300 tracking-tight">Conversation</span>
           <Badge className="bg-black/40">Today</Badge>
         </header> */}
              <div className="flex min-h-0 flex-1 flex-col pb-40 px-4 py-4  scrollhid">
                <div className="flex-1 min-h-0 overflow-y-auto scroll-thin ">
                  <ul className="space-y-4 mx-auto grid w-full max-w-3xl gap-4 px-4 py-6 ">
                    {isNewChat ? (
                     <NewChatScreen />
                    ) : (
                      <>
                        {history.map((m, i) => (
                          <li
                            key={i}
                            className={`flex w-full ${
                              m.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`relative max-w-[100%] group ${
                                m.role === "user"
                                  ? "border border-white/10 bg-white/10 text-[#e7e5e5] shadow rounded-2xl px-3 pt-2 break-words whitespace-pre-wrap"
                                  : "mt-6 mb-4  pt-2  rounded-2xl text-[#e7e5e5]"
                              }`}
                            >
                              {m.parts?.[0]?.text?.type === "resource_link" ? (
                                <a
                                  href={m.parts?.[0].text.uri}
                                  download={
                                    m.parts?.[0].text.name || "output.pdf"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-200 ml-2"
                                >
                                  Now you can download your PDF :{" "}
                                  <span className="text-blue-400 hover:text-blue-500">
                                    📄{m.parts?.[0].text.name || "your PDF"}
                                  </span>
                                </a>
                              ) : (
                                <MarkdownRenderer
                                  content={m.parts?.[0]?.text}
                                />
                              )}

                              <CopyButton
                                text={m.parts?.[0]?.text || ""}
                                user={m.role}
                                pdf={m.parts?.[0]?.text?.type}
                              />
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                    {loading && (
                      <div className="flex justify-start w-4">
                        <div className="bubble-loader"></div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </ul>
                </div>
              </div>
            </div>
       
              <div className="w-[97%] max-w-[798px] lg:w-[52%] xl:w-[52%] self-center fixed bottom-8 lg:ml-1 mx-auto mb-0 max-h-40 flex items-center gap-2 rounded-full border border-white/10 bg-[#12151b] p-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && sendMessage()
                  }
                  disabled={loading}
                  placeholder="Ask something..."
                  autoFocus
                  autoComplete="true"
                  autoSave="true"
                  autoCorrect="true"
                  autoCapitalize="true"
                  className="flex-1 rounded-lg px-4 py-2 text-sm text-white outline-none appearance-none resize-none h-9 focus:ring-0 focus:border-transparent z-10"
                ></textarea>
                {loading ? (
                 
                    <div
                    className="w-6 h-6 bg-white flex justify-center items-center scale-90 rounded-full self-center mr-2 cursor-pointer hover:bg-gray-300"
                    onClick={stopLoading}
                  >
                    <span className="text-lg scale-75 text-black">■</span>
                    
                  </div>
                  
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="flex items-start justify-center py-2 pb-3 px-4 bg-black/30 hover:bg-transparent text-white rounded-full transition-colors "
                  >
                    <span className="text-xl font-extrabold text-white">
                      {">>>"}
                    </span>
                  </button>
                )}
              </div>
       
          </main>
          <aside className="hidden lg:block">
            <FeaturesPanel />
          </aside>

         {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="sticky bottom-40  mx-auto font-extralight bg-[#0e0d0d] scale-90 border border-zinc-600  text-white p-1 rounded-full shadow-md transition-all duration-200 z-50"
            >
              <MoveDown className="scale-75" />
            </button>
        )}
        </div>
      </div>
    </>
  );
}

export default App;





// import { useState, useEffect, useRef } from "react";
// import "./App.css"
// import NewChatScreen from "./components/NewChatScreen";
// import CopyButton from "./components/CopyButton";
// import FeaturesPanel from "./components/FeaturesPanel";
// import MarkdownRenderer from "./components/MarkdownRenderer ";
// import { MoveDown } from "lucide-react";
// import DrawerBasic from "./components/Drawer/Drawer";

// import {
//   Bot,
//   Brain,
//   Calculator,
//   Check,
//   Copy,
//   FileText,
//   Mail,
//   Menu,
//   Send,
//   Sparkles,
//   Twitter,
//   Zap,
// } from "lucide-react";

// import { Badge } from "./components/ui/Badge";
// import { Options } from "./components/Options";


// function App() {
//   const [input, setInput] = useState("");
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isNewChat, setIsNewChat] = useState(true);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const chatEndRef = useRef(null);
//   const chatContainerRef = useRef(null);
//   const abortControllerRef = useRef(null);

//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     setIsNewChat(false);

//     // Keep the same message shape your backend expects (role + parts array)
//     const newHistory = [...history, { role: "user", content: input}];
//     setHistory(newHistory);
//     setInput("");
//     setLoading(true);

//     abortControllerRef.current = new AbortController();
//     const signal = abortControllerRef.current.signal;

//     try {
//       const resp = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         // backend expects { messages: [...] } in the old format (role + parts)
//         body: JSON.stringify({ messages: newHistory }),
//         signal,
//       });

//       if (!resp.ok) {
//         const text = await resp.text();
//         console.error("Server returned non-200 response:", resp.status, text);
//         throw new Error("API request failed");
//       }

//       const data = await resp.json();
//       // backend returns various shapes:
//       // - { data: message } where message = { role, content }  (OpenAI-style)
//       // - { data: [ ... ] }  (tool result content array)
//       // - { data: "string" } or older shapes
//       const payload = data?.data;

//       let assistantParts = [{ text: "" }];

//       // Case 1: tool result array (e.g., [{ type: 'resource_link', uri, name }, ...])
//       if (Array.isArray(payload)) {
//         // keep the object as-is so renderer can detect resource_link etc.
//         assistantParts = [{ text: payload[0] }];
//       }
//       // Case 2: direct OpenAI-style message object
//       else if (payload && typeof payload === "object") {
//         // payload might be { role, content } or { message: { content } } or other nested forms
//         const content =
//           payload.content ??
//           payload.message?.content ??
//           // earlier server sometimes returned { content: [{...}] }
//           (Array.isArray(payload.content) ? payload.content[0] : undefined) ??
//           // fallback to text field if present
//           payload.text;

//         if (typeof content === "string") {
//           assistantParts = [{ text: content }];
//         } else if (content !== undefined) {
//           // content might be an object (e.g., resource_link) or array — preserve it
//           assistantParts = [{ text: content }];
//         } else {
//           // If object but no obvious content, stringify safely (last resort)
//           assistantParts = [{ text: JSON.stringify(payload) }];
//         }
//       }
//       // Case 3: primitive string
//       else if (typeof payload === "string") {
//         assistantParts = [{ text: payload }];
//       } else {
//         assistantParts = [{ text: "Received an unexpected response shape from server." }];
//       }

//       // Append assistant message using the same shape (role + parts[])
//       setHistory((h) => {
//         const updated = [
//           ...h,
//           {
//             role: "assistant",
//             parts: assistantParts,
//           },
//         ];
//         localStorage.setItem("chatHistory", JSON.stringify(updated));
//         return updated;
//       });

//       console.log("Server payload:", payload);
//     } catch (e) {
//       console.error("sendMessage error:", e);
//     } finally {
//       setLoading(false);
//       abortControllerRef.current = null;
//     }
//   };

//   const stopLoading = () => {
//     console.log(
//       "Stop button clicked, abortControllerRef:",
//       abortControllerRef.current
//     );
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//       setLoading(false);
//       console.log("Stopped the AI from overthinking!");
//     }
//   };
//   useEffect(() => {
//     try {
//       const getItem = JSON.parse(localStorage.getItem("chatHistory"));
//       if (getItem) {
//         setHistory(getItem);
//         setIsNewChat(getItem.length === 0);
//       }
//     } catch (err) {
//       console.warn("Failed to parse chatHistory from localStorage:", err);
//       localStorage.removeItem("chatHistory");
//     }

//     const container = chatContainerRef.current;
//     if (!container) return;

//     const handleScroll = () => {
//       const scrollable = container.scrollHeight - container.clientHeight;
//       const scrolled = container.scrollTop;
//       setShowScrollButton(scrollable - scrolled > 10);
//     };

//     container.addEventListener("scroll", handleScroll);
//     return () => container.removeEventListener("scroll", handleScroll);
//   }, []);
//   const scrollToBottom = () => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTo({
//         top: chatContainerRef.current.scrollHeight,
//         behavior: "smooth",
//       });
//       setShowScrollButton(false);
//     }
//   };
//   useEffect(() => {
//     if (chatEndRef.current) {
//       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [history, loading]);

//   const deleteHistory = () => {
//     setHistory([]);
//     setIsNewChat(true);
//     localStorage.removeItem("chatHistory");
//   };
//   return (
//     <>
//       <div className="bg-[#0f1115] h-fit body">
//         <div className=" fixed inset-0 bg-[radial-gradient(70%_60%_at_30%_0%,rgba(16,185,129,0.14),rgba(0,0,0,0)_60%),radial-gradient(60%_50%_at_80%_10%,rgba(147,51,234,0.12),rgba(0,0,0,0)_55%)]" />
//         <header className="sticky top-0 z-30 w-full h-[9%] pb-3 flex  justify-between pt-2 px-8  border-b border-white/5 bg-[#0d0f13]/60 backdrop-blur-xl backdrop-opacity-80">
//           <h2 className="text-2xl font-bold text-white flex gap-2 items-center">
//             <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-600">
//               <Bot className="h-4 w-4 text-white" />
//             </div>
//             <span className="text-base text-white font-semibold">MS Agent</span>
//           </h2>
//           <div className="flex items-center gap-2">
//             <div className="hidden lg:block mt-3">
//               <Badge>
//                 Model:{" "}
//                 <span className="ml-1 font-medium text-emerald-300">
//                   {import.meta.env.VITE_MODEL_NAME || "gpt-5"}
//                 </span>
//               </Badge>
//             </div>
//             <div className="block lg:hidden xl:hidden mt-3">
//               <DrawerBasic />
//             </div>
//           </div>
//         </header>
//         <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-0 md:px-4 pb-8 pt-2 lg:grid-cols-[200px_minmax(0,1fr)_300px] md:gap-6 lg:gap-8">
//           <aside className="hidden lg:block">
//             <Options method={deleteHistory} />
//           </aside>

//           <main
//             ref={chatContainerRef}
//             className="rounded-2xl relative w-full min-h-0 flex flex-col flex-1 "
//           >
//             <div className="flex relative w-full min-h-0 flex-1 h-[78dvh] md:h-[84dvh] lg:h-[86dvh] flex-col">
//               <div className="flex min-h-0 flex-1 flex-col pb-40 px-4 py-4  scrollhid">
//                 <div className="flex-1 min-h-0 overflow-y-auto scroll-thin ">
//                   <ul className="space-y-4 mx-auto grid w-full max-w-3xl gap-4 px-4 py-6 ">
//                     {isNewChat ? (
//                      <NewChatScreen />
//                     ) : (
//                       <>
//                         {history.map((m, i) => (
//                           <li
//                             key={i}
//                             className={`flex w-full ${
//                               m.role === "user"
//                                 ? "justify-end"
//                                 : "justify-start"
//                             }`}
//                           >
//                             <div
//                               className={`relative max-w-[100%] group ${
//                                 m.role === "user"
//                                   ? "border border-white/10 bg-white/10 text-[#e7e5e5] shadow rounded-2xl px-3 pt-2 break-words whitespace-pre-wrap"
//                                   : "mt-6 mb-4  pt-2  rounded-2xl text-[#e7e5e5]"
//                               }`}
//                             >
//                               {m.content?.type === "resource_link" ? (
//                                 <a
//                                   href={m.content?.uri}
//                                   download={
//                                     m.content?.name || "output.pdf"
//                                   }
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="text-gray-200 ml-2"
//                                 >
//                                   Now you can download your PDF :{" "}
//                                   <span className="text-blue-400 hover:text-blue-500">
//                                     📄{m.content?.name || "your PDF"}
//                                   </span>
//                                 </a>
//                               ) : (
//                                 <MarkdownRenderer
//                                   content={m.content || "No response "}
//                                 />
//                               )}

//                               <CopyButton
//                                 text={m.content || ""}
//                                 user={m.role}
//                                 pdf={m.content?.type}
//                               />
//                             </div>
//                           </li>
//                         ))}
//                       </>
//                     )}
//                     {loading && (
//                       <div className="flex justify-start w-4">
//                         <div className="bubble-loader"></div>
//                       </div>
//                     )}

//                     <div ref={chatEndRef} />
//                   </ul>
//                 </div>
//               </div>
//             </div>
       
//               <div className="w-[97%] max-w-[798px] lg:w-[52%] xl:w-[52%] self-center fixed bottom-8 lg:ml-1 mx-auto mb-0 max-h-40 flex items-center gap-2 rounded-full border border-white/10 bg-[#12151b] p-2">
//                 <textarea
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={(e) =>
//                     e.key === "Enter" && !e.shiftKey && sendMessage()
//                   }
//                   disabled={loading}
//                   placeholder="Ask something..."
//                   autoFocus
//                   autoComplete="true"
//                   autoSave="true"
//                   autoCorrect="true"
//                   autoCapitalize="true"
//                   className="flex-1 rounded-lg px-4 py-2 text-sm text-white outline-none appearance-none resize-none h-9 focus:ring-0 focus:border-transparent z-10"
//                 ></textarea>
//                 {loading ? (
                 
//                     <div
//                     className="w-6 h-6 bg-white flex justify-center items-center scale-90 rounded-full self-center mr-2 cursor-pointer hover:bg-gray-300"
//                     onClick={stopLoading}
//                   >
//                     <span className="text-lg scale-75 text-black">■</span>
                    
//                   </div>
                  
//                 ) : (
//                   <button
//                     onClick={sendMessage}
//                     disabled={loading}
//                     className="flex items-start justify-center py-2 pb-3 px-4 bg-white/10 hover:bg-transparent text-white rounded-full transition-colors "
//                   >
//                     <span className="text-xl font-extrabold text-white">
//                       {">>>"}
//                     </span>
//                   </button>
//                 )}
//               </div>
       
//           </main>
//           <aside className="hidden lg:block">
//             <FeaturesPanel />
//           </aside>

//          {showScrollButton && (
//             <button
//               onClick={scrollToBottom}
//               className="sticky bottom-40  mx-auto font-extralight bg-[#0e0d0d] scale-90 border border-zinc-600  text-white p-1 rounded-full shadow-md transition-all duration-200 z-50"
//             >
//               <MoveDown className="scale-75" />
//             </button>
//         )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default App;
