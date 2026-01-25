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
                    <h2 className="text-base md:text-lg font-bold tracking-[0.3em] text-cyan-400 mb-8 uppercase drop-shadow-md">
                        Furukawa Archive OS v1.0
                    </h2>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[1.1] 
                        bg-gradient-to-br from-white via-cyan-200 to-purple-400 bg-clip-text text-transparent filter drop-shadow-lg">
                        LET'S ENJOY<br />
                        CONSTRAINTS<br />
                        HACK!
                    </h1>
                    <div className="max-w-3xl mx-auto mb-16 space-y-4">
                        <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed drop-shadow-md">
                            誰もが<span className="text-cyan-300">「生きててよかった」</span>と思える瞬間をmakeする。
                        </p>
                        <p className="text-xl md:text-2xl text-neutral-300 font-medium">
                            <span className="border-b-2 border-cyan-500/50 pb-1">意味づけの科学</span>
                            <span className="mx-3 text-neutral-600">×</span>
                            <span className="border-b-2 border-purple-500/50 pb-1">心に響くものづくり</span>
                        </p>
                    </div>

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
