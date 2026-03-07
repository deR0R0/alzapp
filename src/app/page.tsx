import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-zinc-300 w-full max-w-[412px] h-screen flex flex-col">
       <div className="flex flex-col items-center justify-center m-auto gap-y-10">
          <a href="/demo-user" className="bg-zinc-200 p-8 w-full text-center rounded-3xl">Demo User</a>
          <a href="/demo-first-responder" className="bg-zinc-200 p-8 w-full text-center rounded-3xl">Demo First Responder</a>
       </div>
    </div>
  );
}
