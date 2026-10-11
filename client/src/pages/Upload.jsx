import { useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button";
import Card from "../components/Card";
import FeaturePage from "../components/FeaturePage";
import UploadBox from "../components/UploadBox";
import {
  generateResources,
  uploadDocument,
} from "../services/api";

function Upload() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const run = async () => {
    if (!file) {
      setError("Choose a PDF, DOCX, PPTX, or TXT file first.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      setStep("Uploading material...");

      const doc = await uploadDocument(file);

      // Remember the latest uploaded document
      localStorage.setItem(
        "acely_document_id",
        String(doc.documentId)
      );

      setStep("Analyzing material and generating notes...");

      await generateResources(doc.documentId);

      setStep("Complete! Opening your notes...");

      navigate(`/notes/${doc.documentId}`);
    }  catch (e) {
  console.error("ACELY UPLOAD ERROR:", e);

  const backendError =
    e.response?.data?.message ||
    e.response?.data?.error ||
    e.message ||
    "Unknown error";

  setError(`Error: ${backendError}`);
}finally {
      setBusy(false);
    }
  };

  return (
    <FeaturePage
      eyebrow="Learning library"
      title="Turn Your Material Into Smart Learning"
      description="Acely extracts the actual text from your file and creates resources from that content."
    >
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <Card>
          <UploadBox
            onFileSelect={(value) => {
              setFile(value);
              setError("");
            }}
          />

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border-2 border-[#171717] bg-[#e7ddff] p-3">
              <HiOutlineDocumentText className="size-6" />

              <div className="min-w-0">
                <strong className="block truncate text-sm">
                  {file.name}
                </strong>

                <span className="text-xs">
                  {file.type || "Document"} ·{" "}
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={run}
            disabled={busy}
            variant="yellow"
            className="mt-5 w-full"
          >
            {busy
              ? "Processing material..."
              : "Generate Learning Resources"}
          </Button>
        </Card>

        <Card>
          <h2 className="text-xl font-black">
            What happens next?
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            {[
              "Upload your real study material",
              "Extract readable text securely",
              "Generate notes, flashcards, quiz and mind map",
              "Open resources tied to this document",
            ].map((text, index) => (
              <p
                key={text}
                className="flex gap-3"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-[#171717] bg-[#fff3a6] text-xs font-black">
                  {index + 1}
                </span>

                {text}
              </p>
            ))}
          </div>

          {step && (
            <p className="mt-6 flex gap-2 rounded-xl bg-[#d9f5c7] p-3 text-sm font-bold">
              <HiOutlineCheckCircle className="size-5" />
              {step}
            </p>
          )}

          {error && (
            <p className="mt-6 rounded-xl bg-[#ffd9b8] p-3 text-sm font-bold">
              {error}
            </p>
          )}
        </Card>
      </div>
    </FeaturePage>
  );
}

export default Upload;