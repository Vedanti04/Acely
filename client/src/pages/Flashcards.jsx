import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

import Button from "../components/Button";
import Card from "../components/Card";
import FeaturePage from "../components/FeaturePage";
import FlashCard from "../components/FlashCard";

import {
  generateFlashcards,
  getFlashcards,
} from "../services/api";

function Flashcards() {
  const { documentId } = useParams();

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadCards = async () => {
    if (!documentId) return;

    try {
      setError("");

      const data = await getFlashcards(documentId);

      if (data?.flashcards?.length) {
        setCards(data.flashcards);
        return;
      }

      // If nothing is saved yet, generate all resources.
      setBusy(true);

      const generated = await generateFlashcards(documentId);

      setCards(generated?.flashcards || []);
    } catch (e) {
      console.error("FLASHCARDS LOAD ERROR:", e);

      setError(
        e.response?.data?.message ||
          e.message ||
          "Unable to load flashcards."
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [documentId]);

  const generate = async () => {
    try {
      setBusy(true);
      setError("");

      const data = await generateFlashcards(documentId);

      setCards(data?.flashcards || []);
      setIndex(0);
    } catch (e) {
      console.error("FLASHCARDS GENERATION ERROR:", e);

      setError(
        e.response?.data?.message ||
          e.message ||
          "Unable to generate flashcards."
      );
    } finally {
      setBusy(false);
    }
  };

  if (!documentId) {
    return (
      <FeaturePage
        eyebrow="Active recall"
        title="Flashcards"
        description="Choose a document to practise its flashcards."
        actionLabel="Upload Material"
        actionTo="/upload"
      />
    );
  }

  if (busy && !cards.length) {
    return (
      <FeaturePage
        eyebrow="Active recall"
        title="Flashcards"
        description="Preparing flashcards from this document..."
      >
        <Card className="mt-8">
          <h2 className="text-xl font-black">
            Creating your flashcards...
          </h2>

          <p className="mt-2 text-sm text-[#555]">
            Acely is preparing study cards from the uploaded material.
          </p>
        </Card>
      </FeaturePage>
    );
  }

  if (!cards.length) {
    return (
      <FeaturePage
        eyebrow="Active recall"
        title="Flashcards"
        description="These cards will be based only on this document."
      >
        <Card className="mt-8">
          <h2 className="text-xl font-black">
            No flashcards generated yet.
          </h2>

          <Button
            onClick={generate}
            disabled={busy}
            variant="yellow"
            className="mt-5"
          >
            {busy
              ? "Creating flashcards..."
              : "Generate Flashcards"}
          </Button>

          {error && (
            <p className="mt-4 rounded-xl bg-[#ffd9b8] p-3 text-sm font-bold">
              {error}
            </p>
          )}
        </Card>
      </FeaturePage>
    );
  }

  const card = cards[index];

  return (
    <FeaturePage
      eyebrow="Active recall"
      title="Flashcards"
      description="Study cards from this uploaded document."
    >
      <Card className="mx-auto mt-8 max-w-2xl text-center">
        <p className="text-sm font-bold">
          {index + 1} of {cards.length} ·{" "}
          {card.difficulty || "Easy"}
        </p>

        <div className="mt-5">
          <FlashCard
            key={index}
            question={card.question}
            answer={card.answer}
          />
        </div>

        <div className="mt-5 flex justify-center gap-3">
          <Button
            onClick={() =>
              setIndex(Math.max(0, index - 1))
            }
            disabled={!index}
            variant="secondary"
          >
            <HiOutlineChevronLeft />
            Previous
          </Button>

          <Button
            onClick={() =>
              setIndex(
                Math.min(cards.length - 1, index + 1)
              )
            }
            disabled={index === cards.length - 1}
            variant="secondary"
          >
            Next
            <HiOutlineChevronRight />
          </Button>
        </div>
      </Card>
    </FeaturePage>
  );
}

export default Flashcards;
