import { motion } from 'framer-motion';
import { SocialLinks } from './SocialLinks';

export const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-neutral-900 text-white">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="text-sm md:text-base font-medium tracking-[0.2em] text-cyan-400 mb-6 uppercase">
                        Furukawa Archive OS v1.0
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                        Re-designing <br className="hidden md:block" />
                        Tech & Society
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 mb-12 leading-relaxed">
                        誰もが生きててよかったと思える瞬間をmakeする。<br />
                        意味づけの科学と、心に響くものづくり。
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
                        <a
                            href="/research"
                            className="px-8 py-4 bg-white text-neutral-900 font-bold rounded-full hover:bg-neutral-200 transition-colors w-full md:w-auto"
                        >
                            Explore Research
                        </a>
                        <a
                            href="/works"
                            className="px-8 py-4 border border-neutral-700 bg-neutral-800/50 backdrop-blur-sm text-white font-medium rounded-full hover:bg-neutral-800 transition-colors w-full md:w-auto"
                        >
                            View Works
                        </a>
                    </div>

                    <SocialLinks variant="large" />
                </motion.div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
                <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
};
