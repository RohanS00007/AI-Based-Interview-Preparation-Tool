const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 that indicates how well the candidate's profile matches the job description. A higher score indicates a better match.",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The technical question can be asked during the interview.",
          ),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take, how to structure the answer, etc.",
          ),
      }),
    )
    .describe(
      "A list of technical questions that can be asked during the interview.",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The behavioral question can be asked during the interview.",
          ),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, how to structure the answer, etc.",
          ),
      }),
    )
    .describe(
      "A list of behavioral questions that can be asked during the interview.",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe("The skill that the candidate needs to work on."),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of the skill gap. It can be low, medium, or high.",
          ),
      }),
    )
    .describe(
      "A list of skill gaps that the candidate needs to work on to be a better fit for the job.",
    ),
  preparationPlan: z.array(
    z
      .object({
        day: z
          .number()
          .describe("The day number in the preparation plan,starting from 1."),
        focus: z
          .string()
          .describe(
            "The focus area for the day. It can be a specific topic, skill, or type of question to practice.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "A list of tasks to be completed on that day. Each task should be specific and actionable, such as 'Solve 3 coding problems on arrays' or 'Practice behavioral questions related to teamwork'.",
          ),
      })
      .describe(
        "A day-wise preparation plan for the candidate to follow in order to prepare for the interview. The plan should be designed in a way that it gradually increases in difficulty and covers all the important topics and skills required for the job.",
      ),
  ),
  title: z
    .string()
    .describe("The title of the interview report, usually the job title."),
});

function extractJSON(text) {
  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // extract JSON only
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No valid JSON found");
  }

  return text.slice(start, end + 1);
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
    You are an expert technical recruiter and career coach. Analyze the candidate's resume and self-description against the job description provided.
    Candidate Details:
    Resume: ${resume}
    Self Description: ${selfDescription}
    Job Description: ${jobDescription}

    Your task is to return a SINGLE valid JSON object — no markdown, no explanation, no code fences. Just raw JSON.

    The JSON must follow this exact schema:
    {
        matchScore: {
          type: Number,
          min: 0,
          max: 100,
        },
        technicalQuestion: [{
            question: {
            type: String,
            required: [true, "Technical question is required"],
            },
            intention: {
            type: String,
            required: [true, "Intention is required"],
            },
            answer: {
            type: String,
            required: [true, "Answer is required"],
            },
        }],
        behavioralQuestion: [{
            question: {
            type: String,
            required: [true, "Behavioral question is required"],
            },
            intention: {
            type: String,
            required: [true, "Intention is required"],
            },
            answer: {
            type: String,
            required: [true, "Answer is required"],
            },
        }],
        skillGap: [{
            skill: {
            type: String,
            required: [true, "Skill is required"],
            },
            severity: {
            type: String,
            enum: ["low", "medium", "high"],
            required: [true, "Severity is required"],
            },
        }],
        preparationPlan: [{
            day: {
            type: Number,
            required: [true, "Day is required"],
            },
            focus: {
            type: String,
            required: [true, "Focus is required"],
            },
            tasks: [
            {
                type: [String],
                required: [true, "Tasks are required"],
            },
            ],
        }],
        title: {
          type: String,
          required: [true, "Title is required"],
        },
      }
    Return only the JSON object. Do not include any other text.
`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
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
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which will be converted to PDF using any library like Puppeteer.",
      ),
  });

  const prompt = `Generate a resume in HTML format based on the following information:
                  Resume: ${resume}
                  Self Description: ${selfDescription}
                  Job Description: ${jobDescription}
                  
                  the response should be a JSON object with a single key "html" which contains the HTML content of the resume. The HTML should be well-structured and styled appropriately for a professional resume. Do not include any other text in the response, only the JSON object.
                  The resume should highlight the candidate's strengths and relevant experience based on the job description, and should be tailored to increase the chances of getting shortlisted for the interview.
                  The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                  The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                  you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                  The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                  The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
