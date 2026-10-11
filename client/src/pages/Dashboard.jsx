import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineArrowRight,
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineFolderArrowDown,
  HiOutlineQuestionMarkCircle,
  HiOutlineMap,
} from "react-icons/hi2";

import { useNavigate } from "react-router-dom";

import Button from "../components/Button";
import ColorTag from "../components/ColorTag";
import HighlightHeading from "../components/HighlightHeading";
import StickyCard from "../components/StickyCard";

import { getDocuments } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDocuments();

        if (!mounted) return;

        const docs = Array.isArray(data) ? data : [];

        setDocuments(docs);

        // Keep the newest document available for feature navigation.
        if (docs.length > 0) {
          const latest = [...docs].sort(
            (a, b) =>
              new Date(b.uploadedAt || 0) -
              new Date(a.uploadedAt || 0)
          )[0];

          if (latest?.documentId) {
            localStorage.setItem(
              "acely_document_id",
              String(latest.documentId)
            );
          }
        }
      } catch (e) {
        console.error("DASHBOARD DOCUMENT LOAD ERROR:", e);

        if (!mounted) return;

        setError(
          e.response?.data?.message ||
            e.message ||
            "Unable to load your materials."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDocuments();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * REAL USER STATISTICS
   *
   * Every value comes from the authenticated user's documents.
   *
   * A document can have up to 4 generated resources:
   * - Notes
   * - Flashcards
   * - Quiz
   * - Mind Map
   */
  const stats = useMemo(() => {
    const materialsUploaded = documents.length;

    const notesGenerated = documents.filter(
      (document) => document.notesAvailable
    ).length;

    const flashcardsGenerated = documents.filter(
      (document) => document.flashcardsAvailable
    ).length;

    const mindMapsGenerated = documents.filter(
      (document) => document.mindMapAvailable
    ).length;

    const quizzesGenerated = documents.filter(
      (document) => document.quizAvailable
    ).length;

    const totalPossibleResources =
      materialsUploaded * 4;

    const generatedResources =
      notesGenerated +
      flashcardsGenerated +
      mindMapsGenerated +
      quizzesGenerated;

    const learningProgress =
      totalPossibleResources === 0
        ? 0
        : Math.round(
            (generatedResources / totalPossibleResources) * 100
          );

    return {
      materialsUploaded,
      notesGenerated,
      flashcardsGenerated,
      mindMapsGenerated,
      quizzesGenerated,
      learningProgress,
      generatedResources,
      totalPossibleResources,
    };
  }, [documents]);

  const latestDocument = useMemo(() => {
    if (!documents.length) return null;

    return [...documents].sort(
      (a, b) =>
        new Date(b.uploadedAt || 0) -
        new Date(a.uploadedAt || 0)
    )[0];
  }, [documents]);

  const openFeature = (path) => {
    if (path === "/upload") {
      navigate("/upload");
      return;
    }

    const documentId =
      latestDocument?.documentId ||
      localStorage.getItem("acely_document_id");

    if (!documentId) {
      navigate("/upload");
      return;
    }

    navigate(`${path}/${documentId}`);
  };

  const recentMaterials = useMemo(() => {
    return [...documents]
      .sort(
        (a, b) =>
          new Date(b.uploadedAt || 0) -
          new Date(a.uploadedAt || 0)
      )
      .slice(0, 4);
  }, [documents]);

  const actions = [
    {
      to: "/upload",
      icon: HiOutlineFolderArrowDown,
      label: "Upload Material",
      color: "purple",
    },
    {
      to: "/notes",
      icon: HiOutlineDocumentText,
      label: "AI Notes",
      color: "yellow",
    },
    {
      to: "/flashcards",
      icon: HiOutlineBookOpen,
      label: "Flashcards",
      color: "green",
    },
    {
      to: "/mindmap",
      icon: HiOutlineMap,
      label: "Mind Maps",
      color: "blue",
    },
    {
      to: "/quiz",
      icon: HiOutlineQuestionMarkCircle,
      label: "Take Quiz",
      color: "orange",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <ColorTag color="yellow">
            Your learning board
          </ColorTag>

          <HighlightHeading
            highlight="back"
            className="mt-4 text-4xl sm:text-5xl"
          >
            Welcome back 👋
          </HighlightHeading>

          <p className="mt-3 text-[#555]">
            Ready to learn something new?
          </p>
        </div>

        <Button
          to="/upload"
          variant="yellow"
        >
          Upload Material
          <HiOutlineArrowRight />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-2xl border-2 border-[#171717] bg-[#ffd9b5] p-4 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Materials */}
        <StickyCard
          color="purple"
          rotate="-rotate-1"
        >
          <strong className="text-4xl font-black">
            {loading ? "..." : stats.materialsUploaded}
          </strong>

          <p className="mt-3 text-sm font-bold">
            Materials uploaded
          </p>
        </StickyCard>

        {/* Notes */}
        <StickyCard
          color="yellow"
          rotate="rotate-1"
        >
          <strong className="text-4xl font-black">
            {loading ? "..." : stats.notesGenerated}
          </strong>

          <p className="mt-3 text-sm font-bold">
            Notes generated
          </p>
        </StickyCard>

        {/* Quizzes */}
        <StickyCard
          color="orange"
          rotate="-rotate-1"
        >
          <strong className="text-4xl font-black">
            {loading ? "..." : stats.quizzesGenerated}
          </strong>

          <p className="mt-3 text-sm font-bold">
            Quizzes generated
          </p>
        </StickyCard>

        {/* Learning progress */}
        <StickyCard
          color="green"
          rotate="rotate-1"
        >
          <strong className="text-4xl font-black">
            {loading
              ? "..."
              : `${stats.learningProgress}%`}
          </strong>

          <p className="mt-3 text-sm font-bold">
            Learning progress
          </p>
        </StickyCard>
      </div>

      {/* Resource summary */}
      {!loading && documents.length > 0 && (
        <div className="mt-6 rounded-2xl border-2 border-[#171717] bg-white p-5 shadow-[5px_5px_0_#171717]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide">
                AI resources
              </p>

              <p className="mt-1 text-sm text-[#555]">
                {stats.generatedResources} of{" "}
                {stats.totalPossibleResources} resources
                generated across your materials.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <div className="h-3 overflow-hidden rounded-full border-2 border-[#171717] bg-[#f5f5f5]">
                <div
                  className="h-full bg-[#d8f5c8] transition-all duration-500"
                  style={{
                    width: `${stats.learningProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Learning */}
      <h2 className="mt-11 text-2xl font-black">
        Start Learning
      </h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(
          ({ to, icon: Icon, label, color }) => (
            <button
              key={to}
              type="button"
              onClick={() => openFeature(to)}
              className="text-left"
            >
              <StickyCard
                color={color}
                className="h-full transition hover:-translate-y-1"
              >
                <Icon className="size-7" />

                <strong className="mt-6 block">
                  {label}
                </strong>

                <span className="mt-2 flex items-center gap-1 text-sm">
                  Open
                  <HiOutlineArrowRight />
                </span>
              </StickyCard>
            </button>
          )
        )}
      </div>

      {/* Continue Learning */}
      <div className="mt-11 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        <StickyCard color="blue">
          <div className="flex items-start justify-between">
            <div>
              <ColorTag color="purple">
                Keep going
              </ColorTag>

              <h2 className="mt-4 text-2xl font-black">
                {latestDocument?.fileName ||
                  "Your latest material"}
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#555]">
                Continue studying your most recently
                uploaded material.
              </p>
            </div>

            <HiOutlineChartBar className="size-7" />
          </div>

          {latestDocument ? (
            <>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border-2 border-[#171717] bg-white p-3">
                  <strong className="block text-xl font-black">
                    {latestDocument.notesAvailable
                      ? "✓"
                      : "—"}
                  </strong>

                  <span className="text-xs font-bold">
                    Notes
                  </span>
                </div>

                <div className="rounded-xl border-2 border-[#171717] bg-white p-3">
                  <strong className="block text-xl font-black">
                    {latestDocument.flashcardsAvailable
                      ? "✓"
                      : "—"}
                  </strong>

                  <span className="text-xs font-bold">
                    Flashcards
                  </span>
                </div>

                <div className="rounded-xl border-2 border-[#171717] bg-white p-3">
                  <strong className="block text-xl font-black">
                    {latestDocument.mindMapAvailable
                      ? "✓"
                      : "—"}
                  </strong>

                  <span className="text-xs font-bold">
                    Mind Map
                  </span>
                </div>

                <div className="rounded-xl border-2 border-[#171717] bg-white p-3">
                  <strong className="block text-xl font-black">
                    {latestDocument.quizAvailable
                      ? "✓"
                      : "—"}
                  </strong>

                  <span className="text-xs font-bold">
                    Quiz
                  </span>
                </div>
              </div>

              <Button
                onClick={() => openFeature("/notes")}
                variant="secondary"
                className="mt-6"
              >
                Continue studying
                <HiOutlineArrowRight />
              </Button>
            </>
          ) : (
            <Button
              to="/upload"
              variant="yellow"
              className="mt-6"
            >
              Upload your first material
              <HiOutlineArrowRight />
            </Button>
          )}
        </StickyCard>

        {/* Recent Materials */}
        <StickyCard
          color="yellow"
          rotate="rotate-1"
        >
          <h2 className="text-xl font-black">
            Recent Materials
          </h2>

          {loading ? (
            <p className="mt-5 text-sm font-bold">
              Loading materials...
            </p>
          ) : recentMaterials.length === 0 ? (
            <p className="mt-5 text-sm text-[#555]">
              No materials uploaded yet.
            </p>
          ) : (
            recentMaterials.map((document) => (
              <button
                key={document.documentId}
                type="button"
                onClick={() => {
                  localStorage.setItem(
                    "acely_document_id",
                    String(document.documentId)
                  );

                  navigate(
                    `/notes/${document.documentId}`
                  );
                }}
                className="mt-4 flex w-full items-center gap-3 border-t-2 border-[#171717] pt-3 text-left"
              >
                <HiOutlineDocumentText className="size-5 shrink-0" />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {document.fileName}
                  </span>

                  <span className="mt-1 block text-xs text-[#666]">
                    {document.status}
                  </span>
                </span>

                <HiOutlineArrowRight className="size-4 shrink-0" />
              </button>
            ))
          )}
        </StickyCard>
      </div>
    </div>
  );
}

export default Dashboard;