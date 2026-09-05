import ColorTag from "./ColorTag";
import Card from "./Card";
function AIOutputCard({ tag = "AI generated", color = "purple", title, children, className = "" }) { return <Card className={className}><ColorTag color={color}>{tag}</ColorTag><h2 className="mt-4 text-xl font-black">{title}</h2><div className="mt-3 text-sm leading-7 text-[#535353]">{children}</div></Card>; }
export default AIOutputCard;
