import { Loader2, RefreshCw, Link2, ShieldAlert, CheckCircle2, ChevronRight, Trash2, FileText, X, ExternalLink, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = "http://127.0.0.1:8000";

interface Job {
  id: number;
  url: string;
  status: string;
  error_code: string | null;
  started_ts: string;
  has_evidence: boolean;
}

const IngestionPage: React.FC = () => {
    const [url, setUrl] = useState('');
    const [sourceName, setSourceName] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [deepCrawl, setDeepCrawl] = useState(false);
    const [maxDepth, setMaxDepth] = useState(2);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [browsingJob, setBrowsingJob] = useState<number | null>(null);
    const [fileList, setFileList] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isFilesLoading, setIsFilesLoading] = useState(false);

    const loadJobs = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/jobs`);
            setJobs(response.data.jobs);
        } catch (err) {
            console.error("Failed to load jobs", err);
        }
    };

    useEffect(() => {
        loadJobs();
        const interval = setInterval(loadJobs, 3000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/api/ingest`, {
                url,
                source_name: sourceName,
                deep_crawl: deepCrawl,
                max_depth: maxDepth
            });
            
            const { status, message } = response.data;
            if (status === 'skipped') {
                showToast(message, 'error');
            } else {
                showToast(message, 'success');
                setUrl('');
                setTimeout(loadJobs, 1000);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to initialize pipeline", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this operation and all its data?")) return;
        
        try {
            await axios.delete(`${API_BASE}/api/jobs/${id}`);
            showToast("Operation deleted successfully", "success");
            loadJobs();
        } catch (err) {
            console.error(err);
            showToast("Failed to delete operation", "error");
        }
    };

    const openFileBrowser = async (jobId: number) => {
        setBrowsingJob(jobId);
        setIsFilesLoading(true);
        setSelectedFile(null);
        setFileContent(null);
        try {
            const response = await axios.get(`${API_BASE}/api/jobs/${jobId}/files`);
            setFileList(response.data.files);
        } catch (err) {
            console.error("Failed to load files", err);
            showToast("Failed to load files", "error");
        } finally {
            setIsFilesLoading(false);
        }
    };

    const loadFileContent = async (filename: string) => {
        setIsFilesLoading(true);
        setSelectedFile(filename);
        try {
            const response = await axios.get(`${API_BASE}/api/files/${filename}`);
            setFileContent(response.data.content);
        } catch (err) {
            console.error("Failed to load file content", err);
            showToast("Failed to load file content", "error");
        } finally {
            setIsFilesLoading(false);
        }
    };

    const closeFileBrowser = () => {
        setBrowsingJob(null);
        setFileList([]);
        setSelectedFile(null);
        setFileContent(null);
    };

    const getStatusTheme = (status: string) => {
        switch(status) {
            case 'RUNNING': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
            case 'COMPLETED': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
            case 'FAILED': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
            case 'CAPTCHA_DETECTED': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
            default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
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
                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-border bg-surface text-sm text-text-secondary font-medium mb-2"
                >
                  <span className="w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                  System Operational
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                    A.S.S. <br/>
                    <span className="bg-glow-gradient bg-clip-text text-transparent">Lover</span>
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                    Power your RAG applications by securely extracting high-fidelity structured data from any web source.
                </p>
            </header>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-8 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-32 bg-accent/5 rounded-full blur-[100px] -z-10 group-hover:bg-accent/10 transition-colors duration-500" />
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Link2 className="w-5 h-5 mr-2 text-accent" />
                    Connect New Source
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4">
                        <input
                            type="text"
                            value={sourceName}
                            onChange={(e) => setSourceName(e.target.value)}
                            placeholder="Source Name"
                            required
                            className="glass-input"
                        />
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://awesome-docs.com"
                            required
                            className="glass-input"
                        />
                         <div className="flex items-center gap-2 px-2 md:col-span-full mb-2">
                             <input 
                                 type="checkbox" 
                                 id="deepCrawl" 
                                 checked={deepCrawl} 
                                 onChange={(e) => setDeepCrawl(e.target.checked)} 
                                 className="w-4 h-4 text-accent bg-surface border-border rounded focus:ring-accent/50 cursor-pointer"
                             />
                             <label htmlFor="deepCrawl" className="text-sm font-medium text-text-secondary cursor-pointer select-none">
                                 Deep Crawl (Process subpages)
                             </label>
                         </div>
                         
                         <AnimatePresence>
                             {deepCrawl && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-2 md:col-span-full mb-4 space-y-3 overflow-hidden"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Crawl Depth</span>
                                            <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${maxDepth > 10 ? 'bg-error/20 text-error' : 'bg-accent/20 text-accent'}`}>
                                                {maxDepth}
                                            </span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="50" 
                                            value={maxDepth} 
                                            onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                                            className="w-full accent-accent bg-white/5 h-1.5 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-text-muted px-1">
                                            <span>1</span>
                                            <span>25</span>
                                            <span>50</span>
                                        </div>
                                        {maxDepth > 10 && (
                                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-error/80 italic">
                                                <ShieldAlert className="w-3 h-3" />
                                                High depth might take a very long time!
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                             )}
                         </AnimatePresence>

                        <div className="md:col-span-full flex justify-start">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 
                                 <span className="flex items-center gap-2">Ingest <ChevronRight className="w-4 h-4" /></span>}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
                <div className="flex justify-between items-center px-2">
                    <h2 className="text-xl font-semibold tracking-tight">Active Operations</h2>
                    <button 
                        onClick={loadJobs}
                        className="text-text-secondary hover:text-white flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all hover:bg-surface border border-transparent hover:border-border"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                        {jobs.length === 0 ? (
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="text-center py-12 glass-panel border-dashed"
                            >
                                <p className="text-text-secondary">Awaiting initial task submission...</p>
                            </motion.div>
                        ) : (
                            jobs.map((job) => {
                                const theme = getStatusTheme(job.status);
                                return (
                                <motion.div 
                                    key={job.id} 
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-border-focus transition-all duration-300 border-l-4 ${theme.border} !rounded-l-sm`}
                                >
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="font-medium text-white truncate max-w-full text-lg">{job.url}</div>
                                        <div className="text-sm text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="font-mono text-xs opacity-70">JOB-{job.id.toString().padStart(4, '0')}</span>
                                            <span>•</span>
                                            <span>{new Date(job.started_ts).toLocaleTimeString()}</span>
                                            
                                            {job.has_evidence && (
                                                <>
                                                    <span>•</span>
                                                    <span className="inline-flex items-center gap-1 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md">
                                                        <ShieldAlert className="w-3 h-3" />
                                                        Incident Evidence
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {job.error_code && (
                                            <div className="text-sm text-error/90 mt-2 font-medium bg-error/10 inline-block px-2 py-1 rounded">
                                                Runtime Exception: {job.error_code}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-white/5 backdrop-blur-md shadow-inner ${theme.bg} ${theme.text}`}>
                                            {job.status === 'COMPLETED' ? (
                                                <span className="flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Success
                                                </span>
                                            ) : job.status}
                                        </div>
                                        {job.status === 'COMPLETED' && (
                                            <button 
                                                onClick={() => openFileBrowser(job.id)}
                                                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                                title="Browse Files"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(job.id)}
                                            className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                            title="Delete Operation"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )})
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* File Browser Overlay */}
            <AnimatePresence>
                {browsingJob !== null && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeFileBrowser}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl h-full bg-surface border-l border-border shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-surface/50 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    {selectedFile ? (
                                        <button 
                                            onClick={() => { setSelectedFile(null); setFileContent(null); }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-1"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <div className="p-2 bg-accent/20 rounded-lg text-accent">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">
                                            {selectedFile ? 'Content Viewer' : 'Extracted Documents'}
                                        </h3>
                                        <p className="text-xs text-text-secondary uppercase tracking-widest font-mono">
                                            JOB-{browsingJob.toString().padStart(4, '0')}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={closeFileBrowser}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                {isFilesLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                                        <p className="text-sm font-medium">Accessing vault...</p>
                                    </div>
                                ) : selectedFile ? (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="prose prose-invert prose-accent max-w-none"
                                    >
                                        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-border flex justify-between items-center group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 bg-white/10 rounded-lg">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-mono truncate text-text-secondary">{selectedFile}</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="glass-panel p-6 overflow-x-auto">
                                            <ReactMarkdown className="markdown-content">
                                                {fileContent || ''}
                                            </ReactMarkdown>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">
                                        {fileList.length === 0 ? (
                                            <div className="text-center py-20 opacity-50">
                                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                <p>No documents extracted for this operation.</p>
                                            </div>
                                        ) : (
                                            fileList.map((file, idx) => (
                                                <motion.button
                                                    key={file}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => loadFileContent(file)}
                                                    className="w-full text-left glass-panel p-4 flex items-center justify-between hover:bg-white/5 hover:border-accent/40 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="p-2 bg-surface border border-border rounded-lg group-hover:text-accent group-hover:border-accent/30 transition-colors">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-mono text-sm truncate">{file}</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                                </motion.button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.9 }}
                      className={`fixed bottom-8 right-8 z-50 glass-panel px-6 py-4 border-l-4 shadow-2xl flex items-center gap-3 ${
                          toast.type === 'success' ? 'border-l-success' : 'border-l-error'
                      }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-success' : 'bg-error'} animate-pulse`} />
                        <span className="font-medium">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default IngestionPage;
