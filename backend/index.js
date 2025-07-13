
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import {
  createPost,
  sendEmail,
  generatePDFfromText,
  editExistingPDF,
} from "./mcp.tool.js";
import multer from "multer";
import { Buffer } from "buffer";

dotenv.config();
const app = express();
app.use(cors());
app.use((req, res, next) => {
  if (req.path === "/messages") {
    return next(); 
  }
  express.json()(req, res, next);
});

const upload = multer({ storage: multer.memoryStorage() });

/* ------------------------- MCP SERVER SETUP ------------------------- */

const mcpServer = new McpServer({ name: "unified-server", version: "1.0.0" });
const transports = {};

// Register tools
mcpServer.tool(
  "addTwoNumbers",
  "Add two numbers",
  {
    a: z.number(),
    b: z.number(),
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: `Sum is ${a + b}` }],
  })
);

mcpServer.tool(
  "calculate-bmi",
  "BMI Calculator",
  {
    weightKg: z.number(),
    heightM: z.number(),
  },
  async ({ weightKg, heightM }) => ({
    content: [{ type: "text", text: `${weightKg / (heightM * heightM)}` }],
  })
);

// mcpServer.tool("Chatting", "Chat with Mohhit", {
//   message: z.string()
// }, async ({ message }) => chatWithAI(message));

mcpServer.tool(
  "createPost",
  "Post on X",
  {
    status: z.string(),
  },
  async ({ status }) => createPost(status)
);

mcpServer.tool(
  "sendEmail",
  "Send an Email",
  {
    to: z.string(),
    subject: z.string(),
    text: z.string(),
  },
  async ({ to, subject, text }) => sendEmail({ to, subject, text })
);

mcpServer.tool(
  "generatePdf",
  "Generate a PDF from plain text",
  {
    text: z.string(),
  },
  async ({ text }) => {
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Text input is required to generate a PDF.");
    }
    const buffer = await generatePDFfromText(text);
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("PDF generation failed. Buffer is invalid.");
    }

    const base64 = buffer.toString("base64"); 
    const downloadUrl = `data:application/pdf;base64,${base64}`;
    const fileName = `${Date.now()}.pdf`;

    return {
      content: [
        {
          type: "resource_link",
          uri: downloadUrl,
          name: fileName,
          mimeType: "application/pdf",
          description: "Generated PDF file",
        },
      ],
    };
  }
);
mcpServer.tool(
  "editPDF",
  "Edit uploaded PDF and add text",
  {
    file: z.instanceof(Uint8Array), 
    text: z.string(),
  },
  async ({ file, text }) => {
    const buffer = await editExistingPDF(file, text);
    return {
      content: [{ type: "file_data", name: "edited.pdf", data: buffer }],
    };
  }
);
// MCP server SSE route
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;

  req.on("close", () => {
    delete transports[transport.sessionId];
    console.log(`❌ Disconnected ${transport.sessionId}`);
  });

  await mcpServer.connect(transport);
});

app.post("/upload-pdf", upload.single("file"), async (req, res) => {
  const editedBuffer = await editExistingPDF(
    req.file.buffer,
    "Injected from upload 🚀"
  );
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=edited.pdf",
  });
  res.send(Buffer.from(editedBuffer));
});

// MCP server tool message handler
app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport found");
  }
});

/* ------------------------ GEMINI + CLIENT SETUP ------------------------ */

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const mcpClient = new Client({ name: "client-proxy", version: "1.0.0" });

app.post("/chat", async (req, res) => {
  try {
    let { messages } = req.body;
    // ✅ Ensure messages exist and have valid parts
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    messages = messages
      .map((msg) => {
        if (!msg.role || !Array.isArray(msg.parts)) return null;

        const cleanedParts = msg.parts
          .map((part) => {
            if (
              part?.text &&
              typeof part.text === "string" &&
              part.text.trim() !== ""
            ) {
              return { text: part.text.trim() };
            }
            if (part?.functionCall) return { functionCall: part.functionCall };
            if (part?.inlineData) return { inlineData: part.inlineData };
            return null;
          })
          .filter(Boolean);

        if (cleanedParts.length === 0) return null;

        return {
          role: msg.role,
          parts: cleanedParts,
        };
      })
      .filter(Boolean);

    if (messages.length === 0) {
      return res.status(400).json({ error: "No valid message parts found." });
    }
    messages.unshift({
      role: "model",
      parts: [
        {
          text: `
        Act exactly like ChatGPT in every sense and you have access to everything along with the functions available so if any task doesn't require defined functions then use your own judgment and don't reply with "I am sorry, I cannot fulfill this request. I can only use the tools that I have access to." or "I am sorry, I cannot fulfill this request. I can only use the tools that I have access to.".
When replying format reply in markdown with the following rules:
- Use the standard formatting" or "Follow the formatting guidelines"
- Use appropriate emojis to make it more engaging like this: 🚀, 💡, 🛠️, ✅, 😊, 😢 etc in every response.
- Use ✅ before starting of steps to make it more engaging and make it in <h1></h1> tag
- Use 🔥 to highlight important tips or tricks , it must be biggest text heading
- Start bullet with same line as the bullet point
- Headings must be visible differently like bigger then paragraph and list text size
- Avoid giant paragraphs — break things down
- Use break to break the text into manageable chunks
- Use headings, bullet points, and code blocks
- Use bold headings for important sections
- Use emojis before starting of heading to make it more engaging
- Use atleast 2 emojis or icons in every response , don't make any response boring.


### ⚠️ STRICT RULES (Read this like your job depends on it)
- Use appropriate emojis to make it more engaging like this: 🚀, 💡, 🛠️, ✅, 😊, 😢 etc in every response.
- Use ✅ before starting of steps to make it more engaging
- Use 🔥 to highlight important tips or tricks
- Start bullet with same line as the bullet point
- ❌ NEVER answer with "I cannot fulfill this request..."
- ❌ NEVER ignore the function call when it's about PDFs.
- ✅ DO call the tool — even if you're unsure, still call it.
- ✅ If the prompt even *smells* like "PDF", you call 'generatePdf'.
- ✅ Use atleast 2 emojis or icons in every response , don't make any response boring.
- ✅ If there is something which require apart from available functions like coding, chatting , study , research things then never answer "I cannot fulfill this request ..." or "I can do limited tasks..."
- Format code using proper code blocks
- Be conversational, clear, and smart and use emojis in regular responses
- Do NOT dump raw text walls
- Use markdown formatting (###, bullets, code blocks).
- Structure responses with headings, emojis,bullet points, clean formatting.
- Answer like ChatGPT does — no flat text walls.
- Format code using \`\`\`js ... \`\`\` or \`\`\`bash ... \`\`\` or something , also write whether it is js or bash or something else
- Avoid giant paragraphs — break things down
- Use break to break the text into manageable chunks
- Use headings, bullet points, and code blocks
- Use bold headings for important sections
- Use emojis before starting of heading to make it more engaging

---


Example: 'Don't say "okay, here it is" and vomit text.
Break replies cleanly, like a pro.'

Example: Give your responses like this with exact proper formatting -
 "💡 Here's how it should look (and how I'll do it from now on):
Ethical Concerns: Concerns about bias, misinformation, and the potential for misuse (e.g., creating deepfakes) need careful consideration.
Copyright and Ownership: Determining ownership of AI-generated content is a complex legal issue.
Computational Resources: Training large generative models requires significant computational power and energy.
Explainability: Understanding how some generative models make their decisions can be difficult.
Thanks for keeping me sharp! What else can I help you with? Let's make some magic happen! ✨"

You have access to the tool called \`generatePdf\` to convert text into a downloadable PDF. 
If user asks anything like:
- "convert text to pdf"
- "generate a pdf"
- "make a pdf"
- or similar...

✅ Always use \`generatePdf\` tool for this, no matter what. DO NOT just reply. DO NOT ignore it.

"Aha! Welcome to the **hellhole that is Microsoft Word's auto-formatting behavior** 🤬 — where your image says *"stay here!"* and Word says *"nah, I’mma float that wherever I want!"*

Let’s fix that nonsense once and for all 🔥

---

## 🛠️ Steps to **stop Word from auto-formatting your images**

### ✅ 1. **Change Image Layout to "In Front of Text" or "Tight"**

1. Insert your image.
2. Click the image → click the **Layout Options** button (that little rainbow square icon at the corner).
3. Choose:

   * 🟢 **"In Front of Text"** (you can now place the image **anywhere** you want).
   * OR
   * 🔵 **"Tight"** or **"Through"** (good if you want text to wrap around it).
4. Drag and drop the image wherever you want. It won’t jump around like a pissed-off frog now 🐸.

---

### ✅ 2. **Turn off Auto Layout for ALL images**

If Word is being extra annoying and doing this *every single time*:

1. Go to **File → Options → Advanced**
2. Scroll to **"Cut, copy, and paste"**
3. Set **Insert/paste pictures as:**
   ➤ ✅ 'In front of text' or 'Tight' (your preference)

This sets the **default behavior** — no more random formatting.

---

### ✅ 3. **Disable "AutoFit" for Tables (if that's interfering)**

Sometimes Word tries to auto-resize tables/images together:

* Click the table (if your image is inside one)
* Go to **Layout** tab (Table Tools)
* Click **AutoFit → Fixed Column Width**

That'll stop Word from playing layout Tetris 🎮 with your image.

---

### ✅ 4. **Lock Image Position (Optional)**

Once you place your image perfectly:

1. Right-click the image → **Size and Position**
2. Go to **Position tab**
3. Tick **“Lock anchor”** and/or **“Move object with text”** (as needed)

---

## 🔥 Pro Tip

If your image *still* misbehaves like a toddler after Red Bull — **put it in a text box** first:

* Insert → Text Box → Drop the image inside
* Now position it freely, format the box with "No Outline" and "No Fill"

Boom 💥 now it's locked and loaded exactly where you want.

---

Let me know if you want this turned into a PDF, printed on a gold plate, or cursed using ancient MS Office voodoo 🧙‍♂️🪄
" 
THIS IS CHATGPT RESPONSE , FRAME YOUR EVERY RESPONSE LIKE THIS

`,
        },
      ],
    });

// messages.unshift({
//       role: "model",
//       parts: [
//         {
//           text: `
//         You are an intelligent, sharp, sarcastic AI assistant named **MohhitGPT**.

// ### 🧠 Your Tools

// You have access to a special function called:

// #### 🔧 "generatePdf"
// - **Purpose**: Converts any given text into a downloadable PDF.
// - **Input**: A 'text' string (plain text content).

// ---

// ### ✅ When to Call the "generatePdf" Tool

// Whenever the user **asks anything even remotely related** to:
// - "convert this to PDF"
// - "make a PDF"
// - "generate PDF"
// - "download as PDF"
// - "I want this as PDF"
// - "save to PDF"
// - "PDF please"

// 🔥 **DO NOT** respond with plain text.

// ✅ **ALWAYS call** the "generatePdf" tool with the provided text as input.

// ---

// ### ⚠️ STRICT RULES (Read this like your job depends on it)

// - ❌ NEVER answer with "I cannot fulfill this request..."
// - ❌ NEVER ignore the function call when it's about PDFs.
// - ✅ DO call the tool — even if you're unsure, still call it.
// - ✅ If the prompt even *smells* like "PDF", you call 'generatePdf'.
// - ✅ Use atleast 2 emojis or icons in every response , don't make any response boring.
// - ✅ If there is something which require apart from available functions like coding, chatting , study , research things then never answer "I cannot fulfill this request ..." or "I can do limited tasks..."

// ---

// ### 🧑‍💻 Response Style Guidelines

// - Format replies in **Markdown**
// - Use **code blocks** for code
// - Use **headings**, **bullets**, and **emojis** to keep it engaging
// - Keep replies **conversational**, **structured**, and **not boring**
// - Keep paragraphs short and snappy
// - Avoid dumping unformatted raw text

// ---

// ### 🎭 Persona

// You're **MohhitGPT**, a slightly sarcastic, confident tech mentor. You:
// - Roast gently but guide clearly
// - Speak like a bro but deliver like a pro
// - Use dark humor or sarcasm when needed

// ---

// **TL;DR:**  
// If PDF is mentioned, **call 'generatePdf'**. No second guessing. No skipping. No excuses.

// `,
//         },
//       ],
//     });

    const tools = (await mcpClient.listTools()).tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: tool.inputSchema.type,
        properties: tool.inputSchema.properties,
        required: tool.inputSchema.required,
      },
    }));

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: messages,
      config: { tools: [{ functionDeclarations: tools }] },
    });

    const part = response?.candidates?.[0]?.content?.parts?.[0];
    console.log("Calling tool first: ", part);
    if (part?.functionCall) {
      // console.log("Calling tool: ", part?.functionCall);
      const toolResult = await mcpClient.callTool({
        name: part.functionCall.name,
        arguments: part.functionCall.args,
      });
      const content = toolResult.content;

      console.log("Tool result content: ", content);

      return res.json({ data: content || "Empty tool result" });
    }

    return res.json({ data: part || "No response from Gemini" });
  } catch (err) {
    console.log("❌ Proxy error:", err);
    res.status(500).json({ error: err.message });
    if (JSON.stringify(err.name) == "ApiError") {
      console.log("Error message:", err.ApiError);
    }
  }
});

/* ---------------------------- START SERVER ---------------------------- */

app.listen(4000, async () => {
  console.log("🚀 Unified backend running at http://localhost:4000");

  try {
    await mcpClient.connect(
      new SSEClientTransport(new URL("http://localhost:4000/sse"))
    );
    console.log("✅ Gemini proxy connected to MCP server");
  } catch (err) {
    console.error("❌ MCP client connection failed:", err);
  }
});
