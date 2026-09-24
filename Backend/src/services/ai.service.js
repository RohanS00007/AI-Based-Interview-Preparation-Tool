require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const apiKey =
  process.env.GOOGLE_GEN_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  "";

const CANDIDATE_MODELS = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash-lite-preview-02-05",
      "gemini-2.0-pro-exp-02-05",
      "gemini-2.0-flash-thinking-exp-01-21",
      "gemini-3.6-flash",
    ].filter(Boolean),
  ),
);

const ai = new GoogleGenAI({
  apiKey,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGeminiWithFallback(params) {
  let lastError;
  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Calling Gemini API with model: ${model} (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err) {
        lastError = err;
        const errMsg = err?.message || JSON.stringify(err);
        const status = err?.status || err?.error?.code;

        console.warn(
          `Model ${model} attempt ${attempt} failed (${status || "error"}: ${errMsg.slice(0, 100)})`,
        );

        // If the model endpoint is retired or not found, jump immediately to next model
        if (
          status === 404 ||
          errMsg.includes("NOT_FOUND") ||
          errMsg.includes("not found") ||
          errMsg.includes("no longer available") ||
          errMsg.includes("is not supported")
        ) {
          break;
        }

        // For temporary 503 high demand or 429, retry
        if (attempt < 3) {
          await sleep(1500);
          continue;
        }
        break;
      }
    }
  }

  throw lastError;
}

const interviewReportSchema = {
  type: "OBJECT",
  properties: {
    title: {
      type: "STRING",
      description: "The title of the interview report, usually the job title.",
    },
    matchScore: {
      type: "NUMBER",
      description: "A score between 0 and 100 that indicates how well the candidate's profile matches the job description.",
    },
    technicalQuestion: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: {
            type: "STRING",
            description: "The technical question that can be asked during the interview.",
          },
          intention: {
            type: "STRING",
            description: "The intention of the interviewer behind asking this question.",
          },
          answer: {
            type: "STRING",
            description: "Detailed, comprehensive answer guide for this question.",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestion: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: {
            type: "STRING",
            description: "The behavioral question that can be asked during the interview.",
          },
          intention: {
            type: "STRING",
            description: "The intention of the interviewer behind asking this question.",
          },
          answer: {
            type: "STRING",
            description: "Detailed answer guide using STAR method.",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGap: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          skill: {
            type: "STRING",
            description: "The skill that the candidate needs to work on.",
          },
          severity: {
            type: "STRING",
            description: "Severity level: low, medium, or high.",
          },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: {
            type: "NUMBER",
            description: "Day number starting from 1.",
          },
          focus: {
            type: "STRING",
            description: "The focus area for the day.",
          },
          tasks: {
            type: "ARRAY",
            items: {
              type: "STRING",
            },
            description: "List of tasks to complete.",
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "title",
    "matchScore",
    "technicalQuestion",
    "behavioralQuestion",
    "skillGap",
    "preparationPlan",
  ],
};

const resumePdfSchema = {
  type: "OBJECT",
  properties: {
    html: {
      type: "STRING",
      description: "The complete HTML code of the resume.",
    },
  },
  required: ["html"],
};

function extractJSON(text) {
  if (!text) {
    throw new Error("Empty response received from AI model");
  }

  let cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No valid JSON found in model output");
  }

  return cleaned.slice(start, end + 1);
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `You are an expert technical recruiter and career coach.
Analyze the candidate's resume and self-description against the target job description.

Candidate Resume Content:
${resume || "Not provided"}

Candidate Self-Description:
${selfDescription || "Not provided"}

Target Job Description:
${jobDescription}

Generate an extensive, realistic interview preparation report.
Requirements:
1. Provide a professional 'title' (e.g. "Senior Software Engineer Interview Report").
2. Provide a numerical 'matchScore' (0 to 100).
3. Provide a list of 'technicalQuestion' with actual questions, intentions, and comprehensive answers.
4. Provide a list of 'behavioralQuestion' with actual questions, intentions, and STAR-based answers.
5. Provide a list of 'skillGap' items, each with 'skill' name and 'severity' ("low", "medium", or "high").
6. Provide a day-by-day 'preparationPlan', each with 'day' (number), 'focus' (string), and 'tasks' (array of strings).

Output valid JSON only matching the schema.`;

  const response = await callGeminiWithFallback({
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: interviewReportSchema,
    },
  });

  const raw = response.text;
  const cleaned = extractJSON(raw);
  const parsed = JSON.parse(cleaned);

  return parsed;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: "networkidle2",
  });
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
  });

  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const prompt = `Generate a resume in HTML format based on the following information:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

The response must be a JSON object with a single key "html" containing clean, professionally styled HTML for the resume.`;

  const response = await callGeminiWithFallback({
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumePdfSchema,
    },
  });

  const jsonContent = JSON.parse(extractJSON(response.text));
  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
