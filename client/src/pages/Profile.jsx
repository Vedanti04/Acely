import { HiOutlineBookmark, HiOutlineCalendarDays, HiOutlineTrophy } from "react-icons/hi2";
import Card from "../components/Card";
import FeaturePage from "../components/FeaturePage";

function Profile() { return <FeaturePage eyebrow="Your account" title="Profile & progress" description="Keep track of the learning habits that move you forward."><div className="mt-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><Card><div className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-xl font-bold text-white">AS</div><h2 className="mt-4 text-xl font-bold">Ananya Sharma</h2><p className="mt-1 text-sm text-slate-500">MCA student · Acely member</p><button className="mt-5 text-sm font-semibold text-brand">Edit profile</button></Card><div className="grid gap-5 sm:grid-cols-3">{[{ icon: HiOutlineTrophy, value: "7", label: "Day streak" }, { icon: HiOutlineCalendarDays, value: "8.4h", label: "Study time" }, { icon: HiOutlineBookmark, value: "16", label: "Saved resources" }].map(({ icon: Icon, value, label }) => <Card key={label}><Icon className="size-6 text-brand" /><strong className="mt-5 block text-2xl">{value}</strong><span className="text-sm text-slate-500">{label}</span></Card>)}</div></div></FeaturePage>; }
export default Profile;

