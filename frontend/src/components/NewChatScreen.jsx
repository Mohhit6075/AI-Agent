
const NewChatScreen = () => {
  return (
    <div className="flex flex-col items-center justify-end text-center text-gray-200">
      <h1 className="text-4xl font-bold mb-4">Welcome to <span className="text-green-400">MS Agent</span> 🤖</h1>
      <p className="text-lg max-w-xl">
        Ask me anything tech, code, AI, or roast-worthy — I'm your AI buddy 😊
      </p>
      <div className="mt-6 text-sm opacity-60">
        <p>Try: "Build me a MERN project idea"</p>
        <p>Or: "What's the difference between AI and ML?"</p>
      </div>
    </div>
  );
};

export default NewChatScreen;
