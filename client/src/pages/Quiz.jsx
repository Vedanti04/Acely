import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/Button";
import Card from "../components/Card";
import FeaturePage from "../components/FeaturePage";
import QuizCard from "../components/QuizCard";

import {
  generateQuiz,
  getQuiz,
} from "../services/api";

import { saveQuizAttempt } from "../utils/studyStats";

function getOptionText(option) {
  if (
    option === null ||
    option === undefined
  ) {
    return "";
  }

  if (typeof option === "string") {
    return option;
  }

  return (
    option.label ||
    option.text ||
    option.value ||
    option.answer ||
    option.option ||
    ""
  ).toString();
}

function getCorrectAnswers(question) {
  if (
    Array.isArray(
      question.correctValues
    )
  ) {
    return question.correctValues;
  }

  if (
    Array.isArray(
      question.correctAnswer
    )
  ) {
    return question.correctAnswer;
  }

  if (
    question.correctAnswer !==
      undefined &&
    question.correctAnswer !== null
  ) {
    return [question.correctAnswer];
  }

  if (
    question.answer !==
      undefined &&
    question.answer !== null
  ) {
    return [question.answer];
  }

  return [];
}

function isAnswerCorrect(
  question,
  selectedIndex
) {
  if (
    selectedIndex === null ||
    selectedIndex === undefined
  ) {
    return false;
  }

  const options =
    Array.isArray(question.options)
      ? question.options
      : [];

  const selectedOption =
    options[selectedIndex];

  const selectedText =
    getOptionText(selectedOption)
      .trim()
      .toLowerCase();

  const selectedLetter =
    String.fromCharCode(
      65 + selectedIndex
    ).toLowerCase();

  const correctAnswers =
    getCorrectAnswers(question);

  return correctAnswers.some(
    (correct) => {
      if (
        correct === null ||
        correct === undefined
      ) {
        return false;
      }

      const correctText =
        getOptionText(correct)
          .trim()
          .toLowerCase();

      const rawCorrect =
        correct
          .toString()
          .trim()
          .toLowerCase();

      return (
        rawCorrect === selectedLetter ||
        rawCorrect === selectedText ||
        correctText === selectedText ||
        rawCorrect ===
          String(selectedIndex)
      );
    }
  );
}

function Quiz() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);

  const [answers, setAnswers] =
    useState([]);

  const [index, setIndex] =
    useState(0);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [startedAt, setStartedAt] =
    useState(Date.now());

  const loadQuiz = async () => {
    if (!documentId) {
      return;
    }

    try {
      setError("");

      const data =
        await getQuiz(documentId);

      if (data?.questions?.length) {
        setQuiz(data);
        setAnswers([]);
        setIndex(0);
        setStartedAt(Date.now());

        return;
      }

      setBusy(true);

      const generated =
        await generateQuiz(documentId);

      setQuiz(generated);
      setAnswers([]);
      setIndex(0);
      setStartedAt(Date.now());

    } catch (e) {
      console.error(
        "QUIZ LOAD ERROR:",
        e
      );

      setError(
        e.response?.data?.message ||
          e.response?.data ||
          e.message ||
          "Unable to load quiz."
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [documentId]);

  const generate = async () => {
    try {
      setBusy(true);
      setError("");
      setAnswers([]);
      setIndex(0);
      setStartedAt(Date.now());

      const data =
        await generateQuiz(documentId);

      setQuiz(data);

    } catch (e) {
      console.error(
        "QUIZ GENERATION ERROR:",
        e
      );

      setError(
        e.response?.data?.message ||
          e.response?.data ||
          e.message ||
          "Unable to generate quiz."
      );
    } finally {
      setBusy(false);
    }
  };

  if (!documentId) {
    return (
      <FeaturePage
        eyebrow="Practice mode"
        title="Knowledge Quiz"
        description="Choose a document to take its quiz."
        actionLabel="Upload Material"
        actionTo="/upload"
      />
    );
  }

  if (busy && !quiz) {
    return (
      <FeaturePage
        eyebrow="Practice mode"
        title="Knowledge Quiz"
        description="Preparing questions from this document..."
      >
        <Card className="mt-8">
          <h2 className="text-xl font-black">
            Building your quiz...
          </h2>

          <p className="mt-2 text-sm text-[#555]">
            Acely is creating questions from
            the uploaded material.
          </p>
        </Card>
      </FeaturePage>
    );
  }

  if (!quiz?.questions?.length) {
    return (
      <FeaturePage
        eyebrow="Practice mode"
        title="Knowledge Quiz"
        description="Questions will be based on this uploaded document."
      >
        <Card className="mt-8">
          <h2 className="text-xl font-black">
            No quiz generated yet.
          </h2>

          <Button
            onClick={generate}
            disabled={busy}
            variant="yellow"
            className="mt-5"
          >
            {busy
              ? "Building quiz..."
              : "Generate Quiz"}
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

  const questions =
    quiz.questions;

  const q =
    questions[index];

  const select = (choiceIndex) => {
    setAnswers((previous) => {
      const copy = [...previous];

      copy[index] =
        choiceIndex;

      return copy;
    });
  };

  const answeredCount =
    answers.filter(
      (answer) =>
        answer !== undefined &&
        answer !== null
    ).length;

  const allAnswered =
    answeredCount ===
    questions.length;

  const submit = () => {
    if (!allAnswered) {
      setError(
        "Please answer every question before submitting the quiz."
      );

      return;
    }

    let score = 0;

    questions.forEach(
      (question, questionIndex) => {
        if (
          isAnswerCorrect(
            question,
            answers[questionIndex]
          )
        ) {
          score += 1;
        }
      }
    );

    const completedAt =
      new Date().toISOString();

    const durationMs =
      Date.now() - startedAt;

    saveQuizAttempt({
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
      documentId,
      score,
      total: questions.length,
      durationMs,
      completedAt,
    });

    navigate(
      `/results?score=${score}&total=${questions.length}&documentId=${documentId}`
    );
  };

  const optionValues =
    Array.isArray(q.options)
      ? q.options.map(getOptionText)
      : [];

  return (
    <FeaturePage
      eyebrow="Practice mode"
      title="Knowledge Quiz"
      description="Questions generated from the selected document."
    >
      <Card className="mx-auto mt-8 max-w-2xl">
        <div className="flex justify-between text-sm font-bold">
          <span>
            Question {index + 1} of{" "}
            {questions.length}
          </span>

          <span>
            {answeredCount} answered
          </span>
        </div>

        <div className="mt-4 h-3 rounded-full border-2 border-[#171717] bg-white">
          <div
            className="h-full bg-[#ffd83d]"
            style={{
              width: `${
                ((index + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />
        </div>

        <div className="mt-7">
          <QuizCard
            question={q.question}
            options={optionValues}
            selected={answers[index]}
            onSelect={select}
          />
        </div>

        <div className="mt-6 flex justify-between">
          <Button
            onClick={() =>
              setIndex(
                Math.max(
                  0,
                  index - 1
                )
              )
            }
            disabled={!index}
            variant="secondary"
          >
            Previous
          </Button>

          {index ===
          questions.length - 1 ? (
            <Button
              type="button"
              onClick={submit}
              disabled={!allAnswered}
              variant="yellow"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() =>
                setIndex(
                  index + 1
                )
              }
            >
              Next
            </Button>
          )}
        </div>

        {!allAnswered &&
          index ===
            questions.length - 1 && (
            <p className="mt-4 text-sm font-bold text-rose-600">
              Answer all questions before
              submitting.
            </p>
          )}

        {error && (
          <p className="mt-4 rounded-xl bg-[#ffd9b8] p-3 text-sm font-bold">
            {error}
          </p>
        )}
      </Card>
    </FeaturePage>
  );
}

export default Quiz;