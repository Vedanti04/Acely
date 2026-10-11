import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import Button from "../components/Button";
import FeaturePage from "../components/FeaturePage";
import StickyCard from "../components/StickyCard";

function Results() {
  const [searchParams] =
    useSearchParams();

  const score =
    Number(
      searchParams.get("score")
    ) || 0;

  const total =
    Number(
      searchParams.get("total")
    ) || 0;

  const documentId =
    searchParams.get(
      "documentId"
    );

  const percentage = useMemo(() => {
    if (!total) {
      return 0;
    }

    return Math.round(
      (score / total) * 100
    );
  }, [score, total]);

  const feedback = useMemo(() => {
    if (percentage >= 90) {
      return "Excellent work! You have a strong understanding of this material. Keep revising the difficult concepts to maintain your progress.";
    }

    if (percentage >= 75) {
      return "Great work! You have a good understanding of the material. Review the questions you missed and try another quiz.";
    }

    if (percentage >= 50) {
      return "Good attempt! Review the important concepts once more and take another quiz to strengthen your understanding.";
    }

    return "Keep practising! Go through your notes and flashcards again, then try the quiz once more.";
  }, [percentage]);

  const quizPath = documentId
    ? `/quiz/${documentId}`
    : "/quiz";

  return (
    <FeaturePage
      eyebrow="Quiz results"
      title="Quiz Completed 🎉"
      description="Here are your results from the quiz you just completed."
    >
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <StickyCard color="yellow">
          <strong className="text-5xl font-black">
            {percentage}%
          </strong>

          <p className="mt-3 font-bold">
            Your score
          </p>
        </StickyCard>

        <StickyCard color="green">
          <strong className="text-3xl font-black">
            {score} / {total}
          </strong>

          <p className="mt-3 font-bold">
            Correct answers
          </p>
        </StickyCard>

        <StickyCard color="purple">
          <strong className="text-3xl font-black">
            {percentage}%
          </strong>

          <p className="mt-3 font-bold">
            Accuracy
          </p>
        </StickyCard>
      </div>

      <StickyCard
        color="blue"
        className="mt-7"
      >
        <HiOutlineCheckCircle className="size-7" />

        <h2 className="mt-4 text-xl font-black">
          AI feedback
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-7">
          {feedback}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            to={quizPath}
            variant="secondary"
          >
            Try another quiz
            <HiOutlineArrowRight />
          </Button>

          <Button
            to="/dashboard"
            variant="yellow"
          >
            <HiOutlineArrowLeft />
            Back to Dashboard
          </Button>
        </div>
      </StickyCard>
    </FeaturePage>
  );
}

export default Results;