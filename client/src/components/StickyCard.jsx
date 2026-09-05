function StickyCard({ children, color = "yellow", rotate = "", className = "" }) { const colors = { yellow: "bg-[#fff3a6]", purple: "bg-[#e7ddff]", green: "bg-[#d9f5c7]", orange: "bg-[#ffd9b8]", blue: "bg-[#dceeff]" }; return <article className={`rounded-2xl border-2 border-[#171717] p-5 paper-shadow ${colors[color]} ${rotate} ${className}`}>{children}</article>; }
export default StickyCard;
