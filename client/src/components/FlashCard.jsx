import { useState } from "react";

function FlashCard({ question, answer }) {
  const [flipped, setFlipped] = useState(false);
  return <button onClick={() => setFlipped(!flipped)} className="min-h-60 w-full rounded-2xl bg-gradient-to-br from-violet-50 to-sky-50 p-8 text-center transition duration-300 hover:scale-[1.01]"><p className="text-xs font-bold uppercase tracking-widest text-brand">{flipped ? "Answer" : "Question"}</p><h2 className="mt-3 text-2xl font-bold">{flipped ? answer : question}</h2><p className="mt-4 text-sm text-slate-500">Click to {flipped ? "see question" : "reveal answer"}.</p></button>;
}
export default FlashCard;
