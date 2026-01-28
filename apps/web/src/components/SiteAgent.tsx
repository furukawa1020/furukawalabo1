import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';

interface Message {
    role: 'user' | 'bot';
    content: string;
}

export const SiteAgent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', content: 'こんにちは！このサイトのAIエージェントです。このサイトのことならなんでもおまかせ！(例: 「RTX5060のAIについて教えて」)' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // AI API Client (Directly to Edge Gateway /ai route)
    // Assumes VITE_API_URL points to gateway root, e.g. http://localhost:8080
    // But existing client adds /api/v1. We construct base URL manually.
    const getAiBaseUrl = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        // Remove /api/v1 if present just in case user pointed it to API directly (though edge should be root)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Prepare history for API
            // Note: Simplistic history. Ideally should be [[user, bot], ...] 
            // We'll let the Python side handle flat list or we format it here.
            // Python expects specific format. Let's send last 6 messages paired.

            // Reformat history for the specific Python implementation we wrote
            // Python expects: [[user, bot], [user, bot]]
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
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'bot', content: 'すみません、エラーが発生しました。時間を置いて再度お試しください。' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[70vh] bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-200">
                    <div className="p-4 border-b border-neutral-700/50 bg-neutral-800/50 backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                                <Sparkles size={16} className="text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-neutral-100">Lab AI Agent</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-neutral-400">Online</span>
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
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-neutral-700 text-cyan-400' : 'bg-neutral-700 text-neutral-300'
                                    }`}>
                                    {msg.role === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[80%] ${msg.role === 'bot'
                                    ? 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                                    : 'bg-cyan-900/40 text-cyan-100 border border-cyan-800/50 rounded-tr-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
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

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative h-14 w-14 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center pointer-events-auto"
            >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100 duration-1000" />
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
};
