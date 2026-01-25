/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'Noto Sans JP', 'sans-serif'],
                mono: ['monospace'],
            },
        },
    },
    plugins: [],
}
