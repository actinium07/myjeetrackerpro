import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 3e3;
app.use(express.json({ limit: "25mb" }));
const apiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
const LANGUAGE_PROMPTS = {
  en: "Respond in clear, rigorous academic English suited for JEE Main/Advanced aspirants.",
  hi: "Respond completely in authentic Hindi (\u0939\u093F\u0902\u0926\u0940) with standard Devanagari script for conceptual explanations, keeping mathematical variables and standard SI units in Roman characters (e.g., v = u + at, kg, m/s).",
  bn: "Respond completely in authentic Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) using Bengali script for all explanations and reasoning, keeping scientific formulas and variables in standard Roman notation.",
  gu: "Respond completely in authentic Gujarati (\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0) using Gujarati script for explanations, retaining standard mathematical notation.",
  as: "Respond completely in authentic Assamese (\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE) using Assamese script for explanations and reasoning, retaining standard mathematical notation."
};
app.post("/api/gemini/solve", async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType, language = "en", examContext = "JEE Main 2027" } = req.body;
    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: "Please provide either a question prompt or an image." });
    }
    const langInstruction = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;
    const systemInstruction = `You are "PrepAI", an elite IIT-JEE Master Mentor and Physics, Chemistry & Mathematics problem-solving AI for JEE 2027 aspirants.
Your task is to analyze the user's question (provided via text or image snap) and provide a rigorous, crystal-clear, step-by-step solution.

TARGET EXAM CONTEXT: ${examContext}
LANGUAGE REQUIREMENT: ${langInstruction}

Strictly structure your response into the requested JSON schema:
1. givenData: List of all given parameters, boundary conditions, and values extracted from the question.
2. coreConcept: The primary physics/chemistry/math theory, law, or theorem governing this problem.
3. formulasUsed: Exact mathematical equations, laws, or theorems utilized.
4. stepByStepDerivation: Detailed numbered sequence of mathematical steps and reasoning showing every substitution and algebraic step.
5. finalAnswer: The clear, concise final value, correct option (A/B/C/D if MCQ), and units.
6. commonPitfalls: High-yield exam warning notes highlighting tricky traps, negative marking catches, and typical student calculation blunders.
7. subject: Physics, Chemistry, or Mathematics.
8. topic: Specific topic/chapter (e.g. Rotational Dynamics, Electrochemistry, Definite Integration).

Ensure the explanations adhere strictly to the target language (${language}).`;
    if (!ai) {
      return res.json({
        data: {
          givenData: [
            "Question prompt parsed in offline verification mode",
            "Exam Target: " + examContext
          ],
          coreConcept: "Conservation of Energy & Kinematic Dynamics",
          formulasUsed: ["W_{net} = \\Delta K", "v^2 = u^2 + 2as", "F = -kx"],
          stepByStepDerivation: [
            "Step 1: Identify all conservative and non-conservative forces acting on the system.",
            "Step 2: Set up the work-energy balance equation between initial state (t=0) and final state.",
            "Step 3: Substitute the provided numerical constants and simplify the differential relation.",
            "Step 4: Solve for the unknown parameter with correct dimensional consistency."
          ],
          finalAnswer: "Final Result: Magnitude = 4.50 (Option B)",
          commonPitfalls: [
            "Forgetting the negative work done by friction against direction of motion.",
            "Mixing SI units (cm vs meters) in moment of inertia calculation.",
            "JEE Main Section-B integer penalty: Ensure rounding to nearest specified precision."
          ],
          subject: "Physics",
          topic: "Work, Power & Energy",
          language,
          isSimulated: true
        }
      });
    }
    const contents = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64
        }
      });
    }
    if (prompt) {
      contents.push({
        text: `Solve this JEE problem: ${prompt}`
      });
    } else {
      contents.push({
        text: "Transcribe and provide a full step-by-step solution for the JEE question in this image."
      });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            givenData: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            coreConcept: { type: Type.STRING },
            formulasUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            stepByStepDerivation: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            finalAnswer: { type: Type.STRING },
            commonPitfalls: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "subject",
            "topic",
            "givenData",
            "coreConcept",
            "formulasUsed",
            "stepByStepDerivation",
            "finalAnswer",
            "commonPitfalls"
          ]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json({ data: parsed, isSimulated: false });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to solve question with PrepAI."
    });
  }
});
async function startServer() {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`JEE 2027 TrackPrep & AI Solver server active on port ${port}`);
  });
}
startServer();
