export const MediaLinks = ({ type = 'all', className = '' }: { type?: 'all' | 'interview', className?: string }) => {
    const items = [
        {
            title: "金沢大学公式サイト インタビュー",
            url: "https://innov.w3.kanazawa-u.ac.jp/articles/articles-3769/",
            date: "2025-12-05",
            isInterview: true,
            color: "bg-cyan-600 hover:bg-cyan-500"
        },
        {
            title: "学生アイデアファクトリー2025 イベントレポート",
            url: "https://coki.jp/sustainable/event/62164/",
            isInterview: false,
            color: "bg-neutral-700 hover:bg-neutral-600"
        },
        {
            title: "日本ジオパーク全国大会 発表報告",
            url: "https://txsc.w3.kanazawa-u.ac.jp/news/362/",
            isInterview: false,
            color: "bg-neutral-700 hover:bg-neutral-600"
        }
    ];

    const filteredItems = type === 'interview'
        ? items.filter(i => i.isInterview)
        : items;

    return (
        <div className={`grid gap-4 ${className} ${type === 'all' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}`}>
            {filteredItems.map((item) => (
                <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex flex-row items-center justify-between p-5 rounded-xl ${item.color} text-white transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl w-full`}
                >
                    <div className="flex-1 pr-4">
                        {item.date && (
                            <span className="text-[10px] opacity-90 mb-1 block font-mono bg-black/20 w-fit px-2 py-0.5 rounded">
                                {item.date}
                            </span>
                        )}
                        <h3 className="font-bold text-base leading-snug w-full">
                            {item.title}
                        </h3>
                    </div>
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </a>
            ))}
        </div>
    );
};
