import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineFolderArrowDown,
  HiOutlineMap,
  HiOutlineQuestionMarkCircle,
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

import { useEffect, useState } from "react";

import { getDocuments, logoutUser } from "../services/api";

const workspaceLinks = [
  {
    key: "dashboard",
    to: "/dashboard",
    label: "Dashboard",
    icon: HiOutlineChartBar,
  },
  {
    key: "materials",
    to: "/upload",
    label: "My Materials",
    icon: HiOutlineFolderArrowDown,
  },
  {
    key: "notes",
    label: "AI Notes",
    icon: HiOutlineDocumentText,
  },
  {
    key: "flashcards",
    label: "Flashcards",
    icon: HiOutlineBookOpen,
  },
  {
    key: "mindmap",
    label: "Mind Maps",
    icon: HiOutlineMap,
  },
  {
    key: "quiz",
    label: "Quizzes",
    icon: HiOutlineQuestionMarkCircle,
  },
  {
    key: "progress",
    to: "/progress",
    label: "Progress",
    icon: HiOutlineChartBar,
  },
];

function getStoredDocumentId() {
  return localStorage.getItem("acely_document_id");
}

function getFeaturePath(key) {
  const documentId = getStoredDocumentId();

  if (!documentId) {
    return "/upload";
  }

  const paths = {
    notes: `/notes/${documentId}`,
    flashcards: `/flashcards/${documentId}`,
    mindmap: `/mindmap/${documentId}`,
    quiz: `/quiz/${documentId}`,
  };

  return paths[key] || "/upload";
}

function Sidebar({ mobileOpen = false, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadDocuments = async () => {
      try {
        const data = await getDocuments();

        if (!mounted) return;

        const docs = Array.isArray(data) ? data : [];

        setDocuments(docs);

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
      } catch (error) {
        console.error("SIDEBAR DOCUMENT LOAD ERROR:", error);
      }
    };

    if (localStorage.getItem("acely_token")) {
      loadDocuments();
    }

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const getDocumentId = () => {
    const storedId = getStoredDocumentId();

    if (storedId) {
      const exists = documents.some(
        (document) =>
          String(document.documentId) === String(storedId)
      );

      if (exists || documents.length === 0) {
        return storedId;
      }
    }

    if (documents.length > 0) {
      const latest = [...documents].sort(
        (a, b) =>
          new Date(b.uploadedAt || 0) -
          new Date(a.uploadedAt || 0)
      )[0];

      if (latest?.documentId) {
        localStorage.setItem(
          "acely_document_id",
          String(latest.documentId)
        );

        return String(latest.documentId);
      }
    }

    return null;
  };

  const getDynamicPath = (key) => {
    const documentId = getDocumentId();

    if (!documentId) {
      return "/upload";
    }

    const paths = {
      notes: `/notes/${documentId}`,
      flashcards: `/flashcards/${documentId}`,
      mindmap: `/mindmap/${documentId}`,
      quiz: `/quiz/${documentId}`,
    };

    return paths[key] || "/upload";
  };

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logoutUser();

    if (onClose) {
      onClose();
    }

    navigate("/login", { replace: true });
  };

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-[300px] shrink-0 flex-col
          overflow-y-auto overscroll-contain
          border-r-[3px] border-[#151515]
          bg-[#fffef9]
          px-4 py-7
          transition-transform duration-200
          lg:sticky lg:top-0
          lg:h-screen lg:w-[360px]
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        style={{
          scrollbarWidth: "thin",
        }}
      >
        {/* Logo */}
        <NavLink
          to="/dashboard"
          onClick={handleNavigation}
          className="mb-14 block shrink-0 px-2 text-[34px] font-black leading-none tracking-[-0.09em]"
        >
          Acely<span className="text-[#f0b900]">.</span>
        </NavLink>

        {/* Workspace title */}
        <p className="mb-5 shrink-0 px-3 text-[14px] font-black uppercase tracking-[0.17em] text-[#686868]">
          Your Workspace
        </p>

        {/* Workspace navigation */}
        <nav className="shrink-0 space-y-1">
          {workspaceLinks.map(
            ({ key, to, label, icon: Icon }) => {
              const destination =
                to || getDynamicPath(key);

              return (
                <NavLink
                  key={key}
                  to={destination}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-4
                    rounded-2xl
                    px-4 py-4
                    text-[17px] font-black
                    transition
                    ${
                      isActive
                        ? "bg-[#fff3a6]"
                        : "hover:bg-[#f4f1e8]"
                    }
                    `
                  }
                >
                  <Icon className="size-7 shrink-0 stroke-[1.7]" />

                  <span className="min-w-0">
                    {label}
                  </span>
                </NavLink>
              );
            }
          )}
        </nav>

        {/* Divider */}
        <div className="my-9 shrink-0 border-t-[3px] border-[#151515]" />

        {/* Account navigation */}
        <nav className="shrink-0 space-y-1">
          <NavLink
            to="/profile"
            onClick={handleNavigation}
            className={({ isActive }) =>
              `
              flex items-center gap-4
              rounded-2xl
              px-4 py-4
              text-[17px] font-black
              transition
              ${
                isActive
                  ? "bg-[#fff3a6]"
                  : "hover:bg-[#f4f1e8]"
              }
              `
            }
          >
            <HiOutlineUserCircle className="size-7 shrink-0 stroke-[1.7]" />

            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={handleNavigation}
            className={({ isActive }) =>
              `
              flex items-center gap-4
              rounded-2xl
              px-4 py-4
              text-[17px] font-black
              transition
              ${
                isActive
                  ? "bg-[#fff3a6]"
                  : "hover:bg-[#f4f1e8]"
              }
              `
            }
          >
            <HiOutlineCog6Tooth className="size-7 shrink-0 stroke-[1.7]" />

            <span>Settings</span>
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center gap-4
              rounded-2xl
              px-4 py-4
              text-left
              text-[17px] font-black
              transition
              hover:bg-[#ffd9d9]
            "
          >
            <HiOutlineArrowRightOnRectangle className="size-7 shrink-0 stroke-[1.7]" />

            <span>Logout</span>
          </button>
        </nav>

        {/* Bottom spacing so the last item is comfortably scrollable */}
        <div className="h-10 shrink-0" />
      </aside>
    </>
  );
}

export default Sidebar;