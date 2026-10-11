import { useEffect, useState } from "react";

import {
  HiOutlineBookmark,
  HiOutlineCalendarDays,
  HiOutlineTrophy,
} from "react-icons/hi2";

import Card from "../components/Card";
import FeaturePage from "../components/FeaturePage";

import { getDocuments } from "../services/api";

import {
  getQuizAttempts,
  getSavedResources,
  getStoredUser,
  getStudyHours,
  getStudyStreak,
} from "../utils/studyStats";

function Profile() {
  const [user, setUser] = useState(
    getStoredUser()
  );

  const [documents, setDocuments] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    setUser(getStoredUser());
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
          "PROFILE DOCUMENT LOAD ERROR:",
          error
        );
      }
    };

    loadDocuments();
  }, []);

  const name =
    user?.name ||
    "Acely Student";

  const email =
    user?.email ||
    "";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  const studyHours =
    getStudyHours(attempts);

  const studyTime =
    studyHours < 0.1
      ? "0h"
      : `${studyHours.toFixed(1)}h`;

  const streak =
    getStudyStreak(attempts);

  const savedResources =
    getSavedResources(documents);

  const stats = [
    {
      icon: HiOutlineTrophy,
      value: String(streak),
      label: "Day streak",
    },
    {
      icon: HiOutlineCalendarDays,
      value: studyTime,
      label: "Study time",
    },
    {
      icon: HiOutlineBookmark,
      value: String(savedResources),
      label: "Saved resources",
    },
  ];

  return (
    <FeaturePage
      eyebrow="Your account"
      title="Profile & progress"
      description="Keep track of the learning habits that move you forward."
    >
      <div className="mt-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <div className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-xl font-bold text-white">
            {initials || "AC"}
          </div>

          <h2 className="mt-4 text-xl font-bold">
            {name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {email}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {user?.role || "Acely member"}
          </p>

          <div className="mt-5 rounded-xl border-2 border-slate-200 bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Account
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-slate-700">
              {email}
            </p>
          </div>
        </Card>

        <div className="grid gap-5 sm:grid-cols-3">
          {stats.map(
            ({
              icon: Icon,
              value,
              label,
            }) => (
              <Card key={label}>
                <Icon className="size-6 text-brand" />

                <strong className="mt-5 block text-2xl">
                  {value}
                </strong>

                <span className="text-sm text-slate-500">
                  {label}
                </span>
              </Card>
            )
          )}
        </div>
      </div>
    </FeaturePage>
  );
}

export default Profile;