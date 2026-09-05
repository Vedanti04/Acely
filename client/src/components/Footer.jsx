import { Link } from "react-router-dom";
function Footer() { return <footer className="border-t-2 border-[#171717] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-sm sm:flex-row sm:items-center sm:justify-between lg:px-8"><p className="font-bold">© 2026 Acely · Learn Smarter. Achieve Better.</p><div className="flex gap-5 font-bold"><Link to="/login">Sign in</Link><Link to="/register">Create account</Link></div></div></footer>; }
export default Footer;
