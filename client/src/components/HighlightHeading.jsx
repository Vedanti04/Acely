function HighlightHeading({ children, highlight, className = "" }) { const parts = children.split(highlight); return <h1 className={`font-black tracking-[-.055em] text-[#171717] ${className}`}>{parts[0]}<span className="marker">{highlight}</span>{parts[1]}</h1>; }
export default HighlightHeading;
