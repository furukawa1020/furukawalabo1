import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { Home } from './pages/Home';
import { Research } from './pages/Research';
import { Works } from './pages/Works';
import { Achievements } from './pages/Achievements';
import { Blog } from './pages/Blog';
import { Donate } from './pages/Donate';
import { About } from './pages/About';
import { Admin } from './pages/Admin';
import { Legal } from './pages/Legal';
import { CookieConsent } from './components/CookieConsent';
import { ThemeProvider } from './components/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { Menu, X } from 'lucide-react';
import { SpotlightOverlay } from './components/Spotlight';
import { UniversalAccess } from './components/UniversalAccess';
import { HyperText } from './components/HyperText';
import { DonationNotification } from './components/DonationNotification';
import { SiteAgent } from './components/SiteAgent';
import { SiteAvatar } from './components/SiteAvatar';
import { LanguageSwitcher } from './components/LanguageSwitcher';

function App() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    type NavLink = {
        to: string;
        label: string;
        special?: boolean;
    };

    const navLinks: NavLink[] = [
        { to: '/about', label: 'About' },
        { to: '/research', label: 'Research' },
        { to: '/works', label: 'Works' },
        { to: '/achievements', label: 'Achievements' },
        { to: '/blog', label: 'Blog' },
        { to: '/donate', label: 'おやつ代と質問ボックス', special: true },
    ];

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Router>
                <div className="min-h-screen bg-white dark:bg-neutral-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] text-neutral-900 dark:text-neutral-50 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300">
                    <SpotlightOverlay />
                    <UniversalAccess />
                    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-white/10 transition-colors duration-300">
                        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                            <Link to="/" className="font-bold text-lg tracking-wider font-mono glitch relative hover:text-cyan-500 transition-colors" data-text="FUR.ARCHIVE" onClick={() => setMobileMenuOpen(false)}>FUR.ARCHIVE</Link>

                            <div className="flex items-center gap-4">
                                {/* Desktop Navigation */}
                                <nav className="hidden md:flex gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                    {navLinks.map(link => (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            className={link.special
                                                ? "px-4 py-2 bg-neutral-900 dark:bg-white/10 text-white dark:text-white rounded-full hover:bg-neutral-700 dark:hover:bg-white/20 transition-colors"
                                                : "hover:text-black dark:hover:text-white transition-colors"
                                            }
                                        >
                                            {link.special ? (
                                                <span>{link.label}</span>
                                            ) : (
                                                <HyperText>{link.label}</HyperText>
                                            )}
                                        </Link>
                                    ))}
                                </nav>

                                <ThemeToggle />
                                <LanguageSwitcher />

                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Navigation Drawer */}
                        <div className={`md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-all duration-300 ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                            }`}>
                            <nav className="flex flex-col p-6 gap-4">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={link.special
                                            ? "px-6 py-3 bg-neutral-900 dark:bg-white/10 text-white dark:text-white rounded-full text-center font-medium hover:bg-neutral-700 dark:hover:bg-white/20 transition-colors text-sm"
                                            : "px-6 py-3 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-medium"
                                        }
                                    >
                                        {link.special ? (
                                            <span>{link.label}</span>
                                        ) : (
                                            <HyperText>{link.label}</HyperText>
                                        )}
                                    </Link>
                                ))}
                            </nav>
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
                            <Route path="/blog/:slug" element={<Blog />} />
                            <Route path="/donate" element={<Donate />} />
                            <Route path="/legal" element={<Legal />} />
                        </Routes>
                    </main>

                    <footer className="py-12 border-t border-neutral-200 dark:border-neutral-800 mt-24 text-center text-neutral-500 dark:text-neutral-600 text-sm transition-colors duration-300">
                        <p>&copy; 2026 Furukawa Archive OS. All rights reserved.</p>
                        <div className="mt-4">
                            <Link to="/legal" className="hover:text-cyan-500 transition-colors">特定商取引法に基づく表記</Link>
                        </div>
                    </footer>

                    <CookieConsent />
                    <DonationNotification />
                    <SiteAgent />
                    <SiteAvatar />
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;
