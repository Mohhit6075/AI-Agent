import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import CopyButton from "./CopyButton";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="max-w-none text-white text-sm">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-3xl font-bold mt-6 mb-2" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl font-semibold mt-5 mb-2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-xl font-medium mt-3 mb-2" {...props} />
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-gray-200" {...props}>
              {children}
            </em>
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-inside  ml-5 my-2 text-sm tracking-wider"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside ml-5 my-2 text-xs tracking-wider "
              {...props}
            />
          ),
          li: ({ children, ...props }) => (
            <li
              className="mb-1 leading-relaxed text-xs tracking-wider "
              {...props}
            >
              {children}
            </li>
          ),
           code: ({ inline, className, children, ...props }) => {
       
            return inline ? (
              <code className=" text-zinc-300 px-1 pb-1 rounded" {...props}>
                {children}
              </code>
            ) : (
              <code
                className={`px-2 text-[13px] bg-[#353535] tracking-wide pb-1 rounded-md ${className}`}
                {...props}
              >
                {children}
                
              </code>
              
            );
          },
          pre: ({ children }) => {

            const className = children?.props?.className || "";
            const language = className.replace("hljs language-", "") || "text";

            return (
              <div className="mb-5 mt-5 bg-[#0d1117] rounded-lg overflow-hidden border border-zinc-700">
                {/* 🏷️ Language Label */}
                <div className="relative px-4 py-1 text-xs font-mono bg-zinc-800 text-zinc-400 border-b border-zinc-700 tracking-wider">
                  <span>{language}</span>
                  <CopyButton text={children} user="" model="model"  />
                </div>

                {/* 💻 Actual Code Block */}
                <pre className="overflow-x-auto">
                  {children}
                </pre>
              </div>
            );
          },
         
          p: ({ node, ...props }) => {
            const isInsideList = node?.parent?.tagName === "li";
            return (
              <p
                className={
                  isInsideList
                    ? "" // don't style list paragraph
                    : "mb-3 leading-relaxed text-gray-100 text-xs tracking-wide"
                }
                {...props}
              />
            );
          },
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline hover:underline-offset-4 transition-colors duration-200"
              {...props}
            >
              {children}
            </a>
          ),

        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
