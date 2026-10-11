import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineBell,
  HiOutlineClock,
} from "react-icons/hi2";

import FeaturePage from "../components/FeaturePage";
import StickyCard from "../components/StickyCard";

import { logoutUser } from "../services/api";

import {
  getAccountKey,
  getStoredUser,
} from "../utils/studyStats";

function Settings() {
  const navigate = useNavigate();

  const user = getStoredUser();

  const settingsKey =
    `acely_settings_${getAccountKey()}`;

  const [dailyGoal, setDailyGoal] =
    useState("60");

  const [reminders, setReminders] =
    useState(true);

  const [reminderTime, setReminderTime] =
    useState("19:00");

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(settingsKey) ||
          "null"
      );

      if (!saved) {
        return;
      }

      setDailyGoal(
        saved.dailyGoal || "60"
      );

      setReminders(
        saved.reminders ?? true
      );

      setReminderTime(
        saved.reminderTime || "19:00"
      );
    } catch {
      // Use defaults.
    }
  }, [settingsKey]);

  useEffect(() => {
    localStorage.setItem(
      settingsKey,
      JSON.stringify({
        dailyGoal,
        reminders,
        reminderTime,
      })
    );
  }, [
    settingsKey,
    dailyGoal,
    reminders,
    reminderTime,
  ]);

  const logout = () => {
    logoutUser();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <FeaturePage
      eyebrow="Account"
      title="Settings"
      description="Manage your learning preferences and account."
    >
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <StickyCard color="purple">
          <h2 className="text-xl font-black">
            Learning preferences
          </h2>

          <p className="mt-3 text-sm leading-6">
            Set your daily study target.
            This preference is saved for your
            account on this browser.
          </p>

          <label className="mt-6 block text-sm font-bold">
            Daily study goal

            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min="15"
                max="600"
                value={dailyGoal}
                onChange={(event) =>
                  setDailyGoal(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border-2 border-[#171717] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#ffd83d]"
              />

              <span className="font-bold">
                minutes
              </span>
            </div>
          </label>
        </StickyCard>

        <StickyCard color="yellow">
          <h2 className="text-xl font-black">
            Notifications
          </h2>

          <p className="mt-3 text-sm leading-6">
            Choose whether Acely should keep a
            study reminder preference for you.
          </p>

          <label className="mt-6 flex cursor-pointer items-center justify-between rounded-xl border-2 border-[#171717] bg-white p-4">
            <div className="flex items-center gap-3">
              <HiOutlineBell className="size-6" />

              <div>
                <p className="font-black">
                  Study reminders
                </p>

                <p className="text-xs text-slate-500">
                  Remind me to study
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={reminders}
              onChange={(event) =>
                setReminders(
                  event.target.checked
                )
              }
              className="size-5 accent-[#171717]"
            />
          </label>

          {reminders && (
            <label className="mt-4 block text-sm font-bold">
              Reminder time

              <div className="relative mt-2">
                <HiOutlineClock className="absolute left-3 top-3 size-5" />

                <input
                  type="time"
                  value={reminderTime}
                  onChange={(event) =>
                    setReminderTime(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border-2 border-[#171717] bg-white py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-[#ffd83d]"
                />
              </div>
            </label>
          )}
        </StickyCard>
      </div>

      <div className="mt-7">
        <StickyCard color="blue">
          <h2 className="text-xl font-black">
            Account
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Signed in as{" "}
            <strong>
              {user?.email || "Acely user"}
            </strong>
          </p>

          <button
            type="button"
            onClick={logout}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#171717] bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ffd83d] hover:text-[#171717]"
          >
            <HiOutlineArrowRightOnRectangle className="size-5" />
            Log out
          </button>
        </StickyCard>
      </div>
    </FeaturePage>
  );
}

export default Settings;