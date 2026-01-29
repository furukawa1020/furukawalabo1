import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface Message {
    role: 'user' | 'bot' | 'system';
    content: string;
}

export const SiteAgent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: 'こんにちは！このサイトのAIエージェントです。このサイトのことならなんでもおまかせ！(例: 「RTX5060のAIについて教えて」)' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'offline' | 'online' | 'checking'>('checking');
    const scrollRef = useRef<HTMLDivElement>(null);

    // AI API Client
    const getAiBaseUrl = () => {
        if (import.meta.env.VITE_AI_API_URL) {
            return import.meta.env.VITE_AI_API_URL.replace(/\/$/, '');
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '') + '/ai';
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Check health on mount/open
    useEffect(() => {
        if (isOpen) {
            checkHealth();
        }
    }, [isOpen]);

    const checkHealth = async () => {
        setStatus('checking');
        try {
            const baseUrl = getAiBaseUrl();
            console.log('Checking AI Health at:', baseUrl);
            await axios.get(`${baseUrl}/health`, { timeout: 5000 });
            setStatus('online');
        } catch (error) {
            console.error('AI Health Check Failed:', error);
            setStatus('offline');
            setMessages(prev => {
                // Don't add duplicate error messages
                if (prev[prev.length - 1].role === 'system') return prev;
                return [...prev, {
                    role: 'system',
                    content: `⚠️ AIサーバーに接続できません。\nURL: ${getAiBaseUrl()}\n環境変数を確認してください。`
                }];
            });
        }
    };

    // Listen for custom event from Avatar
    useEffect(() => {
        const handleOpenEvent = () => setIsOpen(true);
        window.addEventListener('open-site-agent', handleOpenEvent);
        return () => window.removeEventListener('open-site-agent', handleOpenEvent);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const formattedHistory: string[][] = [];
            for (let i = 1; i < messages.length; i += 2) {
                if (messages[i] && messages[i].role === 'user' && messages[i + 1] && messages[i + 1].role === 'bot') {
                    formattedHistory.push([messages[i].content, messages[i + 1].content]);
                }
            }

            const response = await axios.post(`${getAiBaseUrl()}/chat`, {
                message: userMsg,
                history: formattedHistory
            });

            setMessages(prev => [...prev, { role: 'bot', content: response.data.reply }]);
        } catch (error: any) {
            console.error('AI Chat Error:', error);
            let errorMsg = 'エラーが発生しました。';
            if (error.response) {
                errorMsg += ` (Status: ${error.response.status})`;
                if (error.response.status === 503) {
                    errorMsg += '\nAIモデルの準備ができていません。\nHuggingFace Tokenを確認してください。';
                }
            } else if (error.request) {
                errorMsg += '\nサーバーからの応答がありません。CORS設定やURLを確認してください。';
            } else {
                errorMsg += `\n${error.message}`;
            }

            setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 z-50 flex flex-col pointer-events-none left-0 right-0 items-center md:left-auto md:right-6 md:items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[70vh] bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-200">
                    <div className="p-4 border-b border-neutral-700/50 bg-neutral-800/50 backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${status === 'online' ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}>
                                <Sparkles size={16} className={status === 'online' ? 'text-cyan-400' : 'text-red-400'} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-neutral-100">Lab AI Agent</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${status === 'online' ? 'bg-green-500' :
                                        status === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                    <span className="text-xs text-neutral-400">
                                        {status === 'online' ? 'Online' : status === 'checking' ? 'Connecting...' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-700 hover:scrollbar-thumb-neutral-600"
                    >
                        {messages.map((msg, idx) => (
                            msg.role === 'system' ? (
                                <div key={idx} className="flex gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-xs text-red-200">
                                    <AlertTriangle size={16} className="shrink-0 text-red-400" />
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            ) : (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-neutral-700 text-cyan-400' : 'bg-neutral-700 text-neutral-300'
                                        }`}>
                                        {msg.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[80%] ${msg.role === 'bot'
                                        ? 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                                        : 'bg-cyan-900/40 text-cyan-100 border border-cyan-800/50 rounded-tr-none'
                                        }`}>
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                </div>
                            )
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                                    <Bot size={16} className="text-cyan-400 animate-pulse" />
                                </div>
                                <div className="px-4 py-2.5 rounded-2xl text-sm bg-neutral-800 text-neutral-400 rounded-tl-none flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-3 bg-neutral-800/30 border-t border-neutral-700/50">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="質問を入力..."
                                className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-neutral-600"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
