"use client";

import { useState, useEffect } from "react";
import { Code2, Search, Tag, Plus, Sparkles, X, Copy, Check, Trash2, Filter } from "lucide-react";
import { summarizeSnippet } from "@/actions/ai";
import { supabase } from "@/lib/supabase";

interface SnippetItem {
  id: number;
  title: string;
  category: string;
  snippet: string;
  summary: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Snippets state connected to Supabase
  const [snippets, setSnippets] = useState<SnippetItem[]>([]);

  // Fetch snippets from Supabase on mount
  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("snippets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching snippets:", error.message);
    } else if (data) {
      setSnippets(data);
    }
    setIsLoading(false);
  };

  // Copy Snippet to Clipboard
  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete Snippet from Supabase
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("snippets").delete().eq("id", id);

    if (error) {
      console.error("Error deleting snippet:", error.message);
      return;
    }

    setSnippets(snippets.filter((item) => item.id !== id));
  };

  // Add New Snippet with AI Summary & Save to Supabase
  const handleAddSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode) return;

    setIsGenerating(true);
    const aiResult = await summarizeSnippet(newCode);

    const newSnippetItem = {
      title: newTitle,
      category: aiResult.category,
      snippet: newCode,
      summary: aiResult.summary,
    };

    const { data, error } = await supabase
      .from("snippets")
      .insert([newSnippetItem])
      .select();

    if (error) {
      console.error("Error saving snippet:", error.message);
    } else if (data) {
      setSnippets([data[0], ...snippets]);
    }

    setNewTitle("");
    setNewCode("");
    setIsGenerating(false);
    setIsModalOpen(false);
  };

  // Filter snippets based on Active Category Tab and Search Query
  const filteredSnippets = snippets.filter((item) => {
    const matchesCategory =
      activeTab === "all" || item.category.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Extract unique categories dynamically
  const categories = Array.from(new Set(snippets.map((s) => s.category)));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-900/50 flex flex-col justify-between p-4 hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-900/40">
              S
            </div>
            <span className="font-semibold tracking-tight text-lg">Synapse</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "all"
                  ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Code2 className="w-4 h-4" />
                All Snippets
              </div>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
                {snippets.length}
              </span>
            </button>

            <div className="pt-4 pb-1 px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Categories
            </div>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat.toLowerCase())}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === cat.toLowerCase()
                    ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4" />
                  {cat}
                </div>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
                  {snippets.filter((s) => s.category === cat).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="font-medium text-zinc-200">Supabase Connected</p>
            <p className="text-[10px] text-zinc-500">v0.3.0 (Level 9.0)</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search snippets, code, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            New Snippet
          </button>
        </header>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Knowledge Vault</h1>
              <p className="text-sm text-zinc-400">
                {searchQuery
                  ? `Showing results for "${searchQuery}"`
                  : activeTab === "all"
                  ? "All code snippets and AI summaries synced to Supabase."
                  : `Filtered by ${activeTab.toUpperCase()}`}
              </p>
            </div>
          </div>

          {/* Snippets Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-zinc-500 text-sm">
              Loading snippets from database...
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl p-8">
              <Filter className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 font-medium">No matching snippets found</p>
              <p className="text-xs text-zinc-600 mt-1">Try tweaking your search or adding a new snippet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSnippets.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4 hover:border-zinc-700 transition-all group relative"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                        title="Delete Snippet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="relative group/code">
                    <pre className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-900 font-mono overflow-x-auto">
                      {item.snippet}
                    </pre>
                    <button
                      onClick={() => handleCopy(item.id, item.snippet)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all opacity-0 group-hover/code:opacity-100"
                      title="Copy code"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-zinc-400 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <p>{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Snippet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-zinc-100">Add AI-Powered Snippet</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSnippet} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Snippet Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Git Reset Hard Branch"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Code / Command</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste your code snippet here..."
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-900/20"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Save & Summarize
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}