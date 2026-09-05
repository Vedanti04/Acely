import { useRef } from "react";
import { HiOutlineCloudArrowUp } from "react-icons/hi2";

function UploadBox({ onFileSelect }) {
  const inputRef = useRef(null);
  const choose = () => inputRef.current?.click();
  return <><input ref={inputRef} onChange={(event) => onFileSelect?.(event.target.files?.[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" type="file" className="hidden" /><button type="button" onClick={choose} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onFileSelect?.(event.dataTransfer.files?.[0]); }} className="w-full rounded-2xl border border-dashed border-violet-300 bg-violet-50/40 p-8 text-center transition hover:border-brand hover:bg-violet-50"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-brand shadow-sm"><HiOutlineCloudArrowUp className="size-7" /></span><strong className="mt-5 block">Drop your study material here</strong><span className="mt-2 block text-sm text-slate-500">PDF, DOCX, PPTX, or TXT · up to 25 MB</span></button></>;
}
export default UploadBox;
