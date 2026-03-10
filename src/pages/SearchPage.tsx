import React, { useState } from 'react';
import { Search as SearchIcon, Loader2, Bot, Database, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";

interface SearchResult {
    answer: string;
    sources: { path: string; score: number; filename?: string }[];
}

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<{name: string, content: string} | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post(`${API_BASE}/api/search`, {
                query,
                k: 5
            });
            setResults(response.data);
        } catch (err) {
            console.error("Search failed", err);
            setError("Failed to fetch search results from the RAG API. Ensure Qdrant dependencies are installed.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFile = async (filename: string) => {
        try {
            const response = await axios.get(`${API_BASE}/api/files/${filename}`);
            setSelectedFile({ name: filename, content: response.data.content });
        } catch (err) {
            console.error("Failed to load file content", err);
            // Můžeme nastavit error state, ale pro teď postačí prázdný content
            setSelectedFile({ name: filename, content: "Obsah souboru se nepodařilo načíst." });
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12 max-w-4xl mx-auto"
        >
            <header className="text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-sm text-purple-300 font-medium mb-2 backdrop-blur-md"
                >
                  Beta Feature
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                    Neural <span className="bg-glow-gradient bg-clip-text text-transparent">Search</span> Engine
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                    Query the ingested knowledge base directly using natural language to retrieve highly cited, accurate answers.
                </p>
            </header>

            <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSearch} 
                className="relative group max-w-3xl mx-auto"
            >
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                    <SearchIcon className={`h-6 w-6 transition-colors duration-300 ${query ? 'text-accent' : 'text-text-secondary'}`} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="block w-full bg-surface/50 backdrop-blur-xl border border-border text-white rounded-2xl pl-16 pr-36 py-5 text-xl outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-500 shadow-glass"
                    placeholder="Ask a question about your custom data..."
                />
                
                <div className="absolute inset-y-2 right-2 flex items-center">
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="h-full bg-accent hover:bg-accent-hover text-white px-6 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group-focus-within:shadow-glow"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 
                            <span className="flex items-center gap-1">Search <ArrowRight className="w-4 h-4" /></span>
                        }
                    </button>
                </div>
            </motion.form>

            <div className="mt-16 w-full max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                    {results === null && !loading && !error && (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-center py-20 px-6 glass-panel border-dashed"
                        >
                            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-border">
                                <Bot className="w-10 h-10 text-accent/50" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-2 text-white">Awaiting Input</h3>
                            <p className="text-text-secondary text-lg">
                                Using local Qdrant Vector store & MiniLM Embeddings.
                            </p>
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col justify-center items-center py-20"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent/30 rounded-full blur-xl animate-pulse-slow"></div>
                                <Loader2 className="w-12 h-12 animate-spin text-accent relative z-10" />
                            </div>
                            <span className="mt-6 text-text-secondary animate-pulse">Running semantic scan...</span>
                        </motion.div>
                    )}
                    
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="bg-error/10 border border-error/30 text-error p-6 rounded-2xl text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {results !== null && !loading && !error && (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="glass-panel p-8 relative overflow-hidden shadow-glow-lg border-accent/30">
                                <div className="absolute top-0 left-0 w-1 h-full bg-glow-gradient"></div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                    <div className="bg-accent/20 p-2 rounded-lg text-accent">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    Synthesized Answer (Top Semantic Match)
                                </h3>
                                <div className="text-lg text-white/90 leading-relaxed font-light whitespace-pre-wrap">
                                    {results.answer}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-text-secondary px-2">
                                    <Database className="w-5 h-5 text-accent/70" />
                                    Retrieved Sources
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {results.sources.length === 0 ? (
                                        <div className="glass-panel p-5 border-dashed border-border/60 col-span-2 text-center text-text-secondary">
                                            No relevant sources found in Vector DB.
                                        </div>
                                    ) : (
                                        results.sources.map((source, idx) => (
                                            <div key={idx} className="glass-panel p-5 border-border/60 hover:border-border transition-colors">
                                                <div className="text-sm text-text-secondary mb-3 flex items-center justify-between">
                                                    <span className="truncate pr-2" title={source.path}>
                                                        {source.path === 'unknown' ? 'Unidentified Source' : source.path}
                                                    </span>
                                                    <span className="bg-surface px-2 py-0.5 rounded text-xs text-accent whitespace-nowrap">
                                                        {(source.score * 100).toFixed(1)}% Match
                                                    </span>
                                                </div>
                                                {source.filename && (
                                                    <button 
                                                        onClick={() => handleOpenFile(source.filename!)}
                                                        className="mt-2 text-xs flex items-center gap-1 text-accent hover:text-accent-hover transition-colors bg-accent/10 px-3 py-1.5 rounded-lg w-full justify-center border border-accent/20 hover:border-accent/50"
                                                    >
                                                        Zobrazit zdrojový dokument
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* File Viewer Modal */}
            <AnimatePresence>
                {selectedFile && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedFile(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-hover">
                                <h3 className="font-medium text-white truncate pr-4 text-sm">
                                    {selectedFile.name}
                                </h3>
                                <button 
                                    onClick={() => setSelectedFile(null)}
                                    className="p-1 px-3 text-sm text-text-secondary hover:text-white hover:bg-white/10 rounded transition-colors"
                                >
                                    Zavřít
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black/20 font-mono text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                                {selectedFile.content}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SearchPage;
