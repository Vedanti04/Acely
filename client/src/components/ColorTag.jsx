function ColorTag({ children, color = "purple" }) { const colors = { purple: "bg-[#e7ddff]", yellow: "bg-[#fff3a6]", green: "bg-[#d9f5c7]", orange: "bg-[#ffd9b8]", blue: "bg-[#dceeff]" }; return <span className={`inline-flex rounded-full border border-[#171717] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${colors[color]}`}>{children}</span>; }
export default ColorTag;
