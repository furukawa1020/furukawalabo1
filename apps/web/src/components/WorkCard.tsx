import { motion } from 'framer-motion';

type WorkProps = {
    title: string;
    category: string;
    image: string;
    year: string;
};

export const WorkCard = ({ title, category, image, year }: WorkProps) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700/50"
        >
            <div className="aspect-video overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium px-2 py-1 bg-neutral-700 rounded text-neutral-300">
                        {category}
                    </span>
                    <span className="text-neutral-500 text-sm">{year}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {title}
                </h3>
            </div>
        </motion.div>
    );
};
