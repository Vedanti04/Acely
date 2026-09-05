import { HiOutlineArrowRight } from "react-icons/hi2";
import Button from "./Button";
import ColorTag from "./ColorTag";
function FeaturePage({ eyebrow, title, description, actionLabel, actionTo, children }) { return <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><ColorTag color="purple">{eyebrow}</ColorTag><div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-4xl font-black tracking-[-.055em] sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-[#555]">{description}</p></div>{actionLabel && <Button to={actionTo} variant="yellow">{actionLabel}<HiOutlineArrowRight /></Button>}</div>{children}</div>; }
export default FeaturePage;
