import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
import Card from "./Card";

function ProgressCard({ label, value, change, icon: Icon, color = "bg-violet-100 text-violet-600" }) {
  return <Card className="p-4"><div className="flex items-start justify-between"><span className={`grid size-10 place-items-center rounded-xl ${color}`}><Icon className="size-5" /></span><span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><HiOutlineArrowTrendingUp />{change}</span></div><p className="mt-4 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></Card>;
}

export default ProgressCard;
