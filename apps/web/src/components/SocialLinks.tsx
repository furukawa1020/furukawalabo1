import { SiGithub, SiX } from '@icons-pack/react-simple-icons';

interface SocialLink {
    name: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

const socialLinks: SocialLink[] = [
    {
        name: 'X (Twitter)',
        url: 'https://x.com/HATAKE55555',
        icon: SiX,
        color: 'hover:bg-neutral-800'
    },
    {
        name: 'GitHub',
        url: 'https://github.com/furukawa1020',
        icon: SiGithub,
        color: 'hover:bg-neutral-800'
    },
    {
        name: 'Protopedia',
        url: 'https://protopedia.net/prototyper/hatake',
        icon: ({ className }: { className?: string }) => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.87-.95-7-5.17-7-9V8.3l7-3.5 7 3.5V11c0 3.83-3.13 8.05-7 9z" />
            </svg>
        ),
        color: 'hover:bg-orange-600/20'
    }
];

interface SocialLinksProps {
    variant?: 'default' | 'large';
}

export const SocialLinks = ({ variant = 'default' }: SocialLinksProps) => {
    const buttonSize = variant === 'large' ? 'p-4' : 'p-3';
    const iconSize = variant === 'large' ? 'w-6 h-6' : 'w-5 h-5';

    return (
        <div className="flex gap-3 justify-center md:justify-start">
            {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                    <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${buttonSize} rounded-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 text-neutral-300 transition-all ${link.color} hover:scale-110 hover:text-white`}
                        aria-label={link.name}
                        title={link.name}
                    >
                        <Icon className={iconSize} />
                    </a>
                );
            })}
            <a
                href="mailto:f.kotaro.0530@gmail.com"
                className={`${buttonSize} rounded-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 text-neutral-300 transition-all hover:bg-blue-600/20 hover:scale-110 hover:text-white`}
                aria-label="Email"
                title="Email"
            >
                <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </a>
        </div>
    );
};
