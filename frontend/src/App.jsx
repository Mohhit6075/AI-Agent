import { useState, useEffect, useRef } from "react";
import "./App.css";
import NewChatScreen from "./components/NewChatScreen";
import CopyButton from "./components/CopyButton";
import FeaturesPanel from "./components/FeaturesPanel";
import MarkdownRenderer from "./components/MarkdownRenderer ";
import { MoveDown } from 'lucide-react';


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
          { role: "model", parts: [{ text: data?.data?.text || data?.data?.[0] || data.parts}] },
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
    setShowScrollButton(scrollable - scrolled > 100);
  };

  container.addEventListener("scroll", handleScroll);
  return () => container.removeEventListener("scroll", handleScroll);
  }, []);
const scrollToBottom = () => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth"
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
    <div className="h-screen body flex flex-col bg-[#1e1e1e] w-full">
      <header className=" w-full h-[9%] pb-3 flex items-center pt-2 border-b pl-8 border-zinc-800">
        <h2 className="text-2xl font-bold text-white">🤖 MohhitGPT</h2>
      </header>
      <div className="flex relative flex-col items-center h-[90%] bg-[#212121] ">
        <div
          className="w-56 absolute -left-2 bottom-28 text-sm text-center text-gray-300 bg-[#141313] hover:bg-[#242424] border border-zinc-500 tracking-widest p-4 rounded-lg cursor-pointer transition-colors"
           onClick={deleteHistory}
        >
          
            New Chat
        </div>
        <div
          className="w-56 absolute -left-2 bottom-10 text-sm text-gray-300 bg-[#141313] hover:bg-[#242424] border border-zinc-500 tracking-widest p-4 rounded-lg cursor-pointer transition-colors"
        
        >
          Model: <span className="text-yellow-200">Gemini-1.5-flash</span>
        </div>
        <FeaturesPanel />
        <main  ref={chatContainerRef} className="flex-1 w-2xl overflow-y-auto px-0 sm:px-0 md:px-0 lg:px-0 xl:px-0">
          <div className="w-2xl mx-auto py-6">
            <ul className="space-y-4 w-full body">
              {isNewChat ? (
                <NewChatScreen />
              ) : (
                <>
                  {history.map((m, i) => (
                    <li
                      key={i}
                      className={`flex w-full ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`relative max-w-[100%] group ${
                          m.role === "user"
                            ? "bg-[#303030] text-[#e7e5e5] shadow rounded-2xl px-3 pt-2 break-words whitespace-pre-wrap"
                            : "mt-6 mb-4 bg-transparent text-gray-100 "
                        }`}
                      >
                        {m.parts?.[0]?.text?.type === "resource_link" ? (
                          <a
                            href={m.parts?.[0].text.uri}
                            download={m.parts?.[0].text.name || "output.pdf"}
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
                          <MarkdownRenderer content={m.parts?.[0]?.text} />
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
        </main>
        

        <div className=" w-2xl mx-auto p-1 mb-10 flex border border-zinc-800 bg-[#303030]  rounded-full">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading}
            placeholder="Ask something..."
            autoFocus
            autoComplete="true"
            autoSave="true"
            autoCorrect="true"
            autoCapitalize="true"
            className="flex-1 rounded-lg px-4 py-2 text-sm text-white outline-none appearance-none resize-none h-10 focus:ring-0 focus:border-transparent z-10"
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
              className="flex items-center justify-center px-4 pb-1 bg-[#1e1e1e] hover:bg-transparent text-white rounded-full transition-colors "
            >
              <span className="text-xl font-extrabold text-white">{">>>"}</span>
            </button>
          )}
        </div>
       {showScrollButton && (
  <button
    onClick={scrollToBottom}
    className="fixed bottom-32 mx-auto font-extralight bg-[#0e0d0d] scale-90 border border-zinc-600  text-white p-1 rounded-full shadow-md transition-all duration-200 z-50"
  >
     <MoveDown className="scale-75"  /> 
  </button>
)}

      </div>
    </div>
  );
}

export default App;
