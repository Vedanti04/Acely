import { Link } from "react-router-dom";
const styles = { primary: "bg-[#171717] text-white border-[#171717] hover:bg-[#ffd83d] hover:text-[#171717]", yellow: "bg-[#ffd83d] text-[#171717] border-[#171717] hover:bg-[#ffea82]", secondary: "bg-white text-[#171717] border-[#171717] hover:bg-[#f5f2e9]", ghost: "border-transparent text-[#171717] hover:bg-[#fff3a6]" };
function Button({ children, to, variant = "primary", className = "", ...props }) { const classes = `inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${styles[variant]} ${className}`; return to ? <Link to={to} className={classes}>{children}</Link> : <button className={classes} {...props}>{children}</button>; }
export default Button;
