import { HiOutlineBell, HiOutlineBars3 } from "react-icons/hi2";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../App.css";
function DashboardLayout() { return <div className="board-bg min-h-screen"><div className="flex min-h-screen"><Sidebar /><main className="min-w-0 flex-1"><header className="flex h-17 items-center justify-between border-b-2 border-[#171717] bg-[#fffef9]/90 px-5 backdrop-blur lg:px-8"><Link to="/dashboard" className="text-xl font-black tracking-[-.08em] lg:hidden">Acely<span className="text-[#f0b900]">.</span></Link><span className="hidden text-sm font-bold text-[#666] md:block">Learn Smarter. Achieve Better.</span><div className="ml-auto flex items-center gap-3"><button aria-label="Menu" className="lg:hidden"><HiOutlineBars3 className="size-6" /></button><button aria-label="Notifications" className="rounded-lg p-2 hover:bg-[#fff3a6]"><HiOutlineBell className="size-5" /></button><Link to="/profile" className="grid size-9 place-items-center rounded-full border-2 border-[#171717] bg-[#e7ddff] text-sm font-black">AS</Link></div></header><Outlet /></main></div></div>; }
export default DashboardLayout;
