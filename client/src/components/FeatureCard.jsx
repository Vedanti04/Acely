import StickyCard from "./StickyCard";
function FeatureCard({ icon: Icon, title, description, color, rotate }) { return <StickyCard color={color} rotate={rotate} className="transition hover:-translate-y-1"><span className="grid size-11 place-items-center rounded-xl border-2 border-[#171717] bg-white"><Icon className="size-6" /></span><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[#535353]">{description}</p></StickyCard>; }
export default FeatureCard;
