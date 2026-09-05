function QuizCard({ question, options, selected, onSelect }) {
  return <section><h2 className="text-xl font-bold">{question}</h2><div className="mt-5 space-y-3">{options.map((option, index) => <button key={option} onClick={() => onSelect?.(index)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition ${selected === index ? "border-brand bg-brand-soft" : "border-slate-200 hover:border-brand hover:bg-brand-soft"}`}><span className={`grid size-6 place-items-center rounded-full border text-xs font-bold ${selected === index ? "border-brand bg-brand text-white" : "border-slate-300"}`}>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div></section>;
}
export default QuizCard;
