import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Research } from './pages/Research';
import { Works } from './pages/Works';
import { Achievements } from './pages/Achievements';
import { Blog } from './pages/Blog';
import { Donate } from './pages/Donate';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { CookieConsent } from './components/CookieConsent';
import { ThemeProvider } from './components/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Router>
                <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300">
                    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-white/10 transition-colors duration-300">
                        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                            <Link to="/" className="font-bold text-lg tracking-wider font-mono">FUR.ARCHIVE</Link>
                            <div className="flex items-center gap-6">
                                <nav className="hidden md:flex gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    <Link to="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
                                    <Link to="/research" className="hover:text-black dark:hover:text-white transition-colors">Research</Link>
                                    <Link to="/works" className="hover:text-black dark:hover:text-white transition-colors">Works</Link>
                                    <Link to="/achievements" className="hover:text-black dark:hover:text-white transition-colors">Achievements</Link>
                                    <Link to="/blog" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
                                    <Link to="/donate" className="px-4 py-2 bg-neutral-900 dark:bg-white/10 text-white dark:text-white rounded-full hover:bg-neutral-700 dark:hover:bg-white/20 transition-colors">Donate</Link>
                                </nav>
                                <ThemeToggle />
                            </div>
                        </div>
                    </header>

                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/research" element={<Research />} />
                            <Route path="/works" element={<Works />} />
                            <Route path="/achievements" element={<Achievements />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/donate" element={<Donate />} />
                        </Routes>
                    </main>

                    <footer className="py-12 border-t border-neutral-200 dark:border-neutral-800 mt-24 text-center text-neutral-500 dark:text-neutral-600 text-sm transition-colors duration-300">
                        <p>&copy; 2026 Furukawa Archive OS. All rights reserved.</p>
                    </footer>

                    <CookieConsent />
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
