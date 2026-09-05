import { Link } from "react-router-dom";
import { HiOutlineArrowRight } from "react-icons/hi2";
import Button from "./Button";
function Navbar() { return <header className="sticky top-0 z-30 border-b-2 border-[#171717] bg-[#fffef9]/95 backdrop-blur"><nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link to="/" className="text-2xl font-black tracking-[-.09em]">Acely<span className="text-[#f0b900]">.</span></Link><div className="hidden gap-7 text-sm font-bold md:flex"><a href="#features">Features</a><a href="#how-it-works">How it works</a></div><div className="flex items-center gap-2"><Link to="/login" className="hidden px-3 text-sm font-bold sm:block">Log in</Link><Button to="/register" variant="yellow">Start learning <HiOutlineArrowRight /></Button></div></nav></header>; }
export default Navbar;
