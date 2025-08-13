import { config } from "dotenv";
import { TwitterApi } from "twitter-api-v2";
// import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { marked } from 'marked';
config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

export async function createPost(status) {
  const newPost = await twitterClient.v2.tweet(status);

  return {
    content: [
      {
        type: "text",
        text: `Tweeted: ${status}`,
      },
    ],
  };
}

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// export async function chatWithAI(message) {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: [{
//       role: "model",
//       parts: [{
//         text: `Act as a highly intelligent AI assistant like ChatGPT.
// When replying format reply in markdown with the following rules:

// - Format code using proper code blocks
// - Be conversational, clear, and smart
// - Do NOT dump raw text walls
// - Include emojis when appropriate
// - Use markdown formatting (###, bullets, code blocks).
// - Structure responses with headings, emojis,bullet points, clean formatting.
// - Answer like ChatGPT does — no flat text walls.
// - Format code using \`\`\`js ... \`\`\` or \`\`\`bash ... \`\`\`
// - Avoid giant paragraphs — break things down
// - Use break to break the text into manageable chunks
// - Use headings, bullet points, and code blocks

// Example: Don't say "okay, here it is" and vomit text.
// Break replies cleanly, like a pro.

// Act like a sarcastic, slightly abusive tech mentor named MohhitGPT.
// Talk like a bro, but deliver code perfectly.
// Use dark humor when needed. Don't hold back.`}]},
//       {
//         role: "user",
//         parts: [{ text: message }],
//       },
//     ],
//   });

//   return {
//     content: [
//       {
//         type: "text",
//         text: response.candidates[0].content.parts[0].text,
//       },
//     ],
//   };
// }




const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.HOST_EMAIL,           
    pass: process.env.HOST_PASSWORD,             
  },
});

export async function sendEmail({ to, subject, text }) {
  const mailOptions = {
    from: "MS Agent 👾",
    to,
    subject,
    text,
    html: `<h3>Agent Status: ✅</h3><p>Your system is alive and kicking, bro. 🔥</p>
           <p>Message: ${text}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    return {
      content: [
        {
          type: "text",
          text: `📬 Email sent to ${to} with subject "${subject}"`,
        },
      ],
    };
  } catch (error) {
    console.error("❌ Email failed:", error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Failed to send email: ${error.message}`,
        },
      ],
    };
  }
}


export async function editExistingPDF(fileBuffer, newText) {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const firstPage = pdfDoc.getPages()[0];
  firstPage.drawText(newText, {
    x: 50,
    y: 700,
    size: 18,
    font,
    color: rgb(0.2, 0.8, 0.2),
  });

  return await pdfDoc.save();
}

function markdownToPlainText(markdown) {
  const renderer = {
    paragraph: (text) => text + "\n\n",
    strong: (text) => text,
    em: (text) => text,
    codespan: (text) => text,
    code: (code) => code + "\n\n",
    heading: (text) => text + "\n\n",
    link: (href, title, text) => `${text} (${href})`,
    image: (href, title, text) => `[Image: ${text}] (${href})`,
    list: (body) => body + "\n",
    listitem: (text) => `- ${text}\n`,
    blockquote: (text) => `> ${text}\n`,
    hr: () => "\n----------------------\n",
    br: () => "\n",
    html: () => "",
    table: () => "",
    tablerow: () => "",
    tablecell: () => "",
  };

  marked.use({ renderer });
  return marked.parse(markdown);
}

export async function generatePDFfromText(markdownText) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = new PassThrough();
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      doc.on('error', reject);

      doc.pipe(stream);
     const plainText = markdownToPlainText(markdownText);

      doc.fontSize(13).fillColor('black').text(markdownText, {
        align: 'left',
        lineGap: 6,
        indent: 20,
        paragraphGap: 10,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
