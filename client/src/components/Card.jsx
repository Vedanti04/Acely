function Card({ children, className = "" }) { return <section className={`rounded-2xl border-2 border-[#171717] bg-white p-5 paper-shadow ${className}`}>{children}</section>; }
export default Card;
