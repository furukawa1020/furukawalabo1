import { useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

type HyperTextProps = {
    children: string;
    className?: string;
    duration?: number;
};

export const HyperText = ({ children, className = "", duration = 800 }: HyperTextProps) => {
    const [text, setText] = useState(children);
    const intervalRef = useRef<number | null>(null);

    const startScramble = () => {
        let iteration = 0;
        const length = children.length;

        clearInterval(intervalRef.current as number);

        intervalRef.current = window.setInterval(() => {
            setText((prev) =>
                prev
                    .split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return children[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("")
            );

            if (iteration >= length) {
                clearInterval(intervalRef.current as number);
            }

            iteration += 1 / 3; // Speed control
        }, 30);
    };

    const stopScramble = () => {
        clearInterval(intervalRef.current as number);
        setText(children);
    };

    return (
        <span
            className={className}
            onMouseEnter={startScramble}
            onMouseLeave={stopScramble}
        >
            {text}
        </span>
    );
};
