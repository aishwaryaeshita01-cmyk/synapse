import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Synapse Core Online
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          AI-Powered Knowledge & Snippet Hub
        </h1>
        
        <p className="text-zinc-400 text-sm leading-relaxed">
          Your centralized vault for code snippets, intelligent summaries, and semantic search. Built with Next.js 16 and Vercel AI SDK.
        </p>

        <div className="pt-4 flex items-center justify-center gap-4">
          <Link 
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/20"
          >
            Open Vault
          </Link>
        </div>
      </div>
    </main>
  );
}