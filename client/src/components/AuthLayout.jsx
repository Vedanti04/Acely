import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children, footer }) {
  return <main className="board-bg grid min-h-screen place-items-center px-5 py-10"><section className="w-full max-w-md rounded-3xl border-2 border-[#171717] bg-white p-7 paper-shadow sm:p-9"><Link to="/" className="flex items-center justify-center gap-2 text-2xl font-black tracking-[-.08em]">Acely<span className="text-[#f0b900]">.</span></Link><div className="mt-8 text-center"><h1 className="text-2xl font-black">{title}</h1><p className="mt-2 text-sm leading-6 text-[#666]">{subtitle}</p></div>{children}<p className="mt-6 text-center text-sm text-[#666]">{footer}</p></section></main>;
}
export default AuthLayout;
