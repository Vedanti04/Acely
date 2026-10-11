import { useState } from "react";
import {
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineXMark,
} from "react-icons/hi2";
import { Link, Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import "../App.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fffef9] text-[#151515]">
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1">
          {/* Top Header */}
          <header className="flex h-24 items-center border-b-[3px] border-[#151515] bg-[#fffef9] px-5 sm:px-7 lg:px-10">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="mr-4 rounded-lg p-2 hover:bg-[#fff3a6] lg:hidden"
            >
              <HiOutlineBars3 className="size-7" />
            </button>

            {/* Desktop tagline */}
            <span className="text-base font-black text-[#686868] sm:text-lg lg:text-xl">
              Learn Smarter. Achieve Better.
            </span>

            <div className="ml-auto flex items-center gap-4 sm:gap-6">
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-xl p-2 transition hover:bg-[#fff3a6]"
              >
                <HiOutlineBell className="size-6 sm:size-7" />
              </button>

              <Link
                to="/profile"
                className="grid size-12 place-items-center rounded-full border-[3px] border-[#151515] bg-[#e7dcff] text-base font-black sm:size-14 sm:text-lg"
              >
                AS
              </Link>
            </div>
          </header>

          {/* Mobile close button */}
          {sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            >
              <span className="sr-only">Close navigation</span>
            </button>
          )}

          {/* Page content */}
          <div className="board-bg min-h-[calc(100vh-96px)]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile close control */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="fixed right-4 top-4 z-[60] rounded-full border-2 border-[#151515] bg-[#fffef9] p-2 shadow-[3px_3px_0_rgba(23,23,23,.15)] lg:hidden"
        >
          <HiOutlineXMark className="size-6" />
        </button>
      )}
    </div>
  );
}

export default DashboardLayout;