import { useEffect, useMemo, useState } from "react";

import {
  HiOutlineBolt,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineTrophy,
} from "react-icons/hi2";

import FeaturePage from "../components/FeaturePage";
import StickyCard from "../components/StickyCard";

import { getDocuments } from "../services/api";

import {
  getCompletedQuizCount,
  getQuizAccuracy,
  getQuizAttempts,
  getResourceProgress,
  getStudyHours,
  getStudyStreak,
} from "../utils/studyStats";

function Progress() {
  const [documents, setDocuments] =
    useState([]);

  const [attempts, setAttempts] =
    useState([]);

  useEffect(() => {
    setAttempts(getQuizAttempts());

    const loadDocuments = async () => {
      try {
        const data = await getDocuments();

        setDocuments(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "PROGRESS DOCUMENT LOAD ERROR:",
          error
        );
      }
    };

    loadDocuments();
  }, []);

  const overallProgress =
    getResourceProgress(documents);

  const quizAccuracy =
    getQuizAccuracy(attempts);

  const studyStreak =
    getStudyStreak(attempts);

  const completedQuizzes =
    getCompletedQuizCount(attempts);

  const studyHours =
    getStudyHours(attempts);

  const studyTime =
    studyHours < 0.1
      ? "0h"
      : `${studyHours.toFixed(1)}h`;

  const metrics = [
    {
      icon: HiOutlineChartBar,
      title: "Overall progress",
      value: `${overallProgress}%`,
      color: "yellow",
    },
    {
      icon: HiOutlineTrophy,
      title: "Quiz accuracy",
      value: `${quizAccuracy}%`,
      color: "purple",
    },
    {
      icon: HiOutlineBolt,
      title: "Study streak",
      value: `${studyStreak} days`,
      color: "green",
    },
  ];

  const resourceRows = useMemo(() => {
    return documents.map((document) => {
      const generated =
        Number(
          Boolean(document.notesAvailable)
        ) +
        Number(
          Boolean(
            document.flashcardsAvailable
          )
        ) +
        Number(
          Boolean(
            document.mindMapAvailable
          )
        ) +
        Number(
          Boolean(document.quizAvailable)
        );

      return {
        id: document.documentId,
        name:
          document.fileName ||
          document.title ||
          `Document ${document.documentId}`,
        generated,
        percentage: Math.round(
          (generated / 4) * 100
        ),
      };
    });
  }, [documents]);

  return (
    <FeaturePage
      eyebrow="Your momentum"
      title="Learning Progress"
      description="A simple view of where you are doing well and what deserves more focus."
    >
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {metrics.map(
          ({
            icon: Icon,
            title,
            value,
            color,
          }) => (
            <StickyCard
              key={title}
              color={color}
            >
              <Icon className="size-7" />

              <strong className="mt-6 block text-4xl font-black">
                {value}
              </strong>

              <span className="mt-2 block text-sm font-bold">
                {title}
              </span>
            </StickyCard>
          )
        )}
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <StickyCard color="blue">
          <h2 className="text-xl font-black">
            Your study activity
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-[#171717] bg-white p-4">
              <HiOutlineCheckCircle className="size-6" />

              <strong className="mt-3 block text-2xl font-black">
                {completedQuizzes}
              </strong>

              <span className="text-sm text-slate-500">
                Quizzes completed
              </span>
            </div>

            <div className="rounded-xl border-2 border-[#171717] bg-white p-4">
              <HiOutlineClock className="size-6" />

              <strong className="mt-3 block text-2xl font-black">
                {studyTime}
              </strong>

              <span className="text-sm text-slate-500">
                Quiz study time
              </span>
            </div>
          </div>
        </StickyCard>

        <StickyCard color="orange">
          <h2 className="text-xl font-black">
            Materials progress
          </h2>

          {!resourceRows.length ? (
            <p className="mt-5 text-sm leading-6">
              Upload your first study material
              to start tracking progress.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {resourceRows.map(
                (resource) => (
                  <div key={resource.id}>
                    <div className="flex justify-between gap-4 text-sm font-bold">
                      <span className="truncate">
                        {resource.name}
                      </span>

                      <span>
                        {resource.percentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-3 rounded-full border-2 border-[#171717] bg-white">
                      <div
                        className="h-full bg-[#d9f5c7]"
                        style={{
                          width: `${resource.percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {resource.generated} / 4
                      resources generated
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </StickyCard>
      </div>

      <div className="mt-7">
        <StickyCard color="yellow">
          <h2 className="text-xl font-black">
            Quiz history
          </h2>

          {!attempts.length ? (
            <p className="mt-4 text-sm leading-6">
              Complete your first quiz and
              your results will appear here.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {attempts
                .slice(0, 8)
                .map((attempt, index) => {
                  const percentage =
                    attempt.total
                      ? Math.round(
                          (attempt.score /
                            attempt.total) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={
                        attempt.id ||
                        `${attempt.completedAt}-${index}`
                      }
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-[#171717] bg-white p-4"
                    >
                      <div>
                        <p className="font-black">
                          Quiz #{attempts.length - index}
                        </p>

                        <p className="text-xs text-slate-500">
                          {new Date(
                            attempt.completedAt
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black">
                          {attempt.score} /{" "}
                          {attempt.total}
                        </p>

                        <p className="text-xs text-slate-500">
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </StickyCard>
      </div>
    </FeaturePage>
  );
}

export default Progress;