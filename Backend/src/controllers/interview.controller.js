const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interview.report.model");

/**
 * @description generate new interview report on the basis of user self description, resume pdf and job description
 */
async function generateInterviewReportController(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Resume PDF file is required" });
    }

    const { selfDescription, jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const resumeContent = await new pdfParse.PDFParse(
      Uint8Array.from(req.file.buffer),
    ).getText();

    const interviewReportByAi = await generateInterviewReport({
      resume: resumeContent?.text || "",
      selfDescription: selfDescription || "",
      jobDescription,
    });

    console.log("Saving report for user:", req.user.id);
    const safeTitle =
      interviewReportByAi?.title ||
      (typeof jobDescription === "string"
        ? `${jobDescription.trim().slice(0, 50)} Interview Preparation`
        : "Interview Preparation Report");

    const safeMatchScore =
      typeof interviewReportByAi?.matchScore === "number"
        ? Math.min(100, Math.max(0, Math.round(interviewReportByAi.matchScore)))
        : 75;

    const safeTechnicalQuestion = Array.isArray(interviewReportByAi?.technicalQuestion)
      ? interviewReportByAi.technicalQuestion
          .filter((q) => q && typeof q === "object")
          .map((q) => ({
            question: String(q.question || "Technical Question"),
            intention: String(q.intention || "Assess technical domain depth"),
            answer: String(q.answer || "Demonstrate structured technical approach."),
          }))
      : [];

    const safeBehavioralQuestion = Array.isArray(interviewReportByAi?.behavioralQuestion)
      ? interviewReportByAi.behavioralQuestion
          .filter((q) => q && typeof q === "object")
          .map((q) => ({
            question: String(q.question || "Behavioral Question"),
            intention: String(q.intention || "Assess collaboration and problem-solving"),
            answer: String(q.answer || "Structure response using STAR methodology."),
          }))
      : [];

    const safeSkillGap = Array.isArray(interviewReportByAi?.skillGap)
      ? interviewReportByAi.skillGap
          .filter((s) => s && typeof s === "object")
          .map((s) => {
            const rawSev = String(s.severity || "").toLowerCase();
            const severity = ["low", "medium", "high"].includes(rawSev)
              ? rawSev
              : "medium";
            return {
              skill: String(s.skill || "Technical Skill"),
              severity,
            };
          })
      : [];

    const safePreparationPlan = Array.isArray(interviewReportByAi?.preparationPlan)
      ? interviewReportByAi.preparationPlan
          .filter((p) => p && typeof p === "object")
          .map((p, idx) => ({
            day: typeof p.day === "number" ? p.day : idx + 1,
            focus: String(p.focus || "Concept Review"),
            tasks: Array.isArray(p.tasks)
              ? p.tasks.map((t) => String(t))
              : ["Review fundamentals"],
          }))
      : [];

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent?.text || "",
      selfDeclaration: selfDescription || "",
      selfDescription: selfDescription || "",
      jobDescription,
      title: safeTitle,
      matchScore: safeMatchScore,
      technicalQuestion: safeTechnicalQuestion,
      behavioralQuestion: safeBehavioralQuestion,
      skillGap: safeSkillGap,
      preparationPlan: safePreparationPlan,
    });

    return res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Error generating interview report:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate interview report",
    });
  }
}

/**
 * @description get interview report by interview id
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });
    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    return res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Error fetching interview report:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch interview report",
    });
  }
}

/**
 * @description get all interview reports of the user
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -selfDeclaration -jobDescription -__v -technicalQuestion -behavioralQuestion -skillGap -preparationPlan",
      );

    return res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (error) {
    console.error("Error fetching all interview reports:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch interview reports",
    });
  }
}

/**
 * @description generate resume pdf from the interview report based on resume,self description and job description
 */
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport =
      await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found" });
    }

    const { resume, jobDescription, selfDescription, selfDeclaration } =
      interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription: selfDescription || selfDeclaration || "",
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating resume pdf:", error);
    return res.status(500).json({
      message: error.message || "Failed to generate resume PDF",
    });
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
