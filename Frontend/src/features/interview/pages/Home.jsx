import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import Loader from "../../loader";

const Home = () => {
  const { loading, generateReport, reports } = useInterview();
  const { handleLogout } = useAuth();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current.files[0];

    const data = await generateReport({
      jobDescription,
      selfDescription,
      resumeFile: resumeFile,
    });

    navigate(`/interview/${data._id}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="home">
      <h1 className="home-title">
        Create Your Custom{" "}
        <span className="highlight-pink">Interview Plan</span>
      </h1>
      <p className="home-subtitle">
        Let our AI analyze the job requirements and your unique profile to build
        a winning strategy.
      </p>
      <div className="top-right-logout">
        <button
          className="button primary-button"
          onClick={() => {
            handleLogout();
          }}
        >
          <svg
            style={{ marginRight: "0.8rem" }}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>

      <div className="main-wrapper">
        <div className="interview-input-group">
          {/* Left Card: Target Job Description */}
          <section className="card left-card">
            <div className="card-header">
              <span role="img" aria-label="folder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 7C3 5.9 3.9 5 5 5H10L12 7H19C20.1 7 21 7.9 21 9V17C21 18.1 20.1 19 19 19H5C3.9 19 3 18.1 3 17V7Z"
                    fill="#ff4ecd"
                  />
                </svg>
              </span>
              <span className="card-title">Target Job Description</span>
              <span className="badge required">Required</span>
            </div>
            <div className="card-body">
              <textarea
                className="job-description-textarea"
                name="jobDescription"
                id="jobDescription"
                placeholder={
                  "Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"
                }
                maxLength={5000}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="char-counter">
                {jobDescription.length} / 5000 chars
              </div>
            </div>
          </section>

          {/* Right Card: Your Profile */}
          <section className="card right-card">
            <div className="card-header">
              <span role="img" aria-label="profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#ff4ecd" />
                  <path
                    d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
                    stroke="#ff4ecd"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="card-title">Your Profile</span>
            </div>
            <div className="card-body">
              {/* Upload Resume */}
              <div className="upload-section">
                <label className="upload-label">
                  Upload Resume
                  <span className="badge best-results">
                    <small>&nbsp;(Best Results)</small>
                  </span>
                </label>
                <div
                  className={`upload-dropzone${dragOver ? " drag-over" : ""}${uploadedFile ? " has-file" : ""}`}
                  onClick={() => resumeInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <span className="upload-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="20" fill="#ff4ecd18" />
                      <path
                        d="M20 26V18M20 18L16.5 21.5M20 18L23.5 21.5"
                        stroke="#ff4ecd"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13 27C11.343 27 10 25.657 10 24C10 22.343 11.343 21 13 21C13.09 21 13.18 21.004 13.27 21.012C13.614 19.278 15.151 18 17 18C19.034 18 20.696 19.527 20.964 21.5C22.139 21.781 23 22.792 23 24C23 25.657 21.657 27 20 27"
                        stroke="#ff4ecd"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  {uploadedFile ? (
                    <>
                      <span className="upload-filename">
                        {uploadedFile.name}
                      </span>
                      <span className="upload-hint">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <span>Click to upload or drag &amp; drop</span>
                      <span className="upload-hint">PDF or DOCX (Max 5MB)</span>
                    </>
                  )}
                  <input
                    ref={resumeInputRef}
                    hidden
                    type="file"
                    name="resume"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="or-separator">OR</div>
              </div>

              {/* Self Description */}
              <div className="self-description-section">
                <label htmlFor="selfDescription">Quick Self-Description</label>
                <textarea
                  className="self-description-textarea"
                  name="selfDescription"
                  id="selfDescription"
                  placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                  maxLength={1000}
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                />
              </div>

              {/* Info Note */}
              <div className="info-note">
                <span className="info-dot"></span>
                <span className="info-text">
                  Either a <b>Resume</b> or a <b>Self Description</b> is
                  required to generate a personalized plan.
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Bar inside wrapper */}
        <div className="footer-bar">
          <span className="footer-info">
            AI-Powered Strategy Generation • Approx 30s
          </span>
          <button
            onClick={handleGenerateReport}
            className="button primary-button large"
          >
            <span className="icon-magic">★</span>
            Generate My Interview Strategy
          </button>
        </div>
      </div>

      {/* Recent Reports List */}
      {reports.length > 0 && (
        <section className="recent-reports">
          <h2>My Recent Interview Plans</h2>
          <ul className="reports-list">
            {reports.map((report) => (
              <li
                key={report._id}
                className="report-item"
                onClick={() => navigate(`/interview/${report._id}`)}
              >
                <h3>{report.title || "Untitled Position"}</h3>
                <p className="report-meta">
                  Generated on {new Date(report.createdAt).toLocaleDateString()}
                </p>
                <p
                  className={`match-score ${report.matchScore >= 80 ? "score--high" : report.matchScore >= 60 ? "score--mid" : "score--low"}`}
                >
                  Match Score: {report.matchScore}%
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer Links */}
      <footer className="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Help Center</a>
      </footer>
    </main>
  );
};

export default Home;
