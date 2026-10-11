import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AIOutputCard from "../components/AIOutputCard";
import Button from "../components/Button";
import FeaturePage from "../components/FeaturePage";
import StickyCard from "../components/StickyCard";

import {
  generateNotes,
  getNotes,
} from "../services/api";

function Notes() {
  const { documentId } = useParams();

  const [notes, setNotes] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    getNotes(documentId)
      .then(setNotes)
      .catch((e) => {
        if (e.response?.status !== 204) {
          setError("Unable to load notes.");
        }
      });
  }, [documentId]);

  const generate = async () => {
    try {
      setBusy(true);
      setError("");

      const result = await generateNotes(documentId);

      setNotes(result);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to generate notes."
      );
    } finally {
      setBusy(false);
    }
  };

  if (!documentId) {
    return (
      <FeaturePage
        eyebrow="AI workspace"
        title="Your AI Notes"
        description="Choose a material from My Materials to see notes tied to that document."
        actionLabel="Upload Material"
        actionTo="/upload"
      />
    );
  }

  return (
    <FeaturePage
      eyebrow="AI workspace"
      title="Your AI Notes"
      description="Notes are generated from this document’s extracted text only."
    >
      {!notes ? (
        <StickyCard
          color="purple"
          className="mt-8"
        >
          <h2 className="text-xl font-black">
            No notes generated yet.
          </h2>

          <p className="mt-2 text-sm">
            Generate notes for this document to begin studying.
          </p>

          <Button
            onClick={generate}
            disabled={busy}
            variant="yellow"
            className="mt-5"
          >
            {busy
              ? "Generating notes..."
              : "Generate Notes"}
          </Button>

          {error && (
            <p className="mt-4 text-sm font-bold">
              {error}
            </p>
          )}
        </StickyCard>
      ) : (
        <>
          <StickyCard
            color="purple"
            className="mt-8"
          >
            <h2 className="text-2xl font-black">
              {notes.title || "AI Notes"}
            </h2>

            <p className="mt-3 text-sm leading-7">
              {notes.overview}
            </p>
          </StickyCard>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">

            {/* KEY POINTS */}
            <AIOutputCard
              tag="Key points"
              color="yellow"
              title="Remember these"
            >
              <ul className="list-disc space-y-2 pl-5">
                {notes.keyPoints?.map((x, index) => (
                  <li key={`keypoint-${index}`}>
                    {x}
                  </li>
                ))}
              </ul>
            </AIOutputCard>

            {/* DEFINITIONS */}
            <AIOutputCard
              tag="Definitions"
              color="green"
              title="Important concepts"
            >
              {notes.definitions?.map((x, index) => (
                <p key={`definition-${index}`}>
                  <b>{x.term}:</b> {x.meaning}
                </p>
              ))}
            </AIOutputCard>

            {/* EXAM TIPS */}
            <AIOutputCard
              tag="Exam tips"
              color="orange"
              title="Revise with purpose"
            >
              <ul className="list-disc space-y-2 pl-5">
                {notes.examTips?.map((x, index) => (
                  <li key={`exam-tip-${index}`}>
                    {x}
                  </li>
                ))}
              </ul>
            </AIOutputCard>

          </div>
        </>
      )}
    </FeaturePage>
  );
}

export default Notes;

