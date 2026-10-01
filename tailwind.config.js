/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cat-darkest': 'rgb(var(--color-cat-darkest) / <alpha-value>)',
                'cat-dark': 'rgb(var(--color-cat-dark) / <alpha-value>)',
                'cat-contrast': 'rgb(var(--color-cat-contrast) / <alpha-value>)',
                'cat-light': 'rgb(var(--color-cat-light) / <alpha-value>)',
                'cat-contrast-light': 'rgb(var(--color-cat-contrast-light) / <alpha-value>)',
                'cat-teal-light': 'rgb(var(--color-cat-teal-light) / <alpha-value>)',
                'cat-teal-dark': 'rgb(var(--color-cat-teal-dark) / <alpha-value>)',
            },
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
