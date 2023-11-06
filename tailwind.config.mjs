/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'tjd-red': {
                    100: '#f5c4c0',
                    200: '#eb8a81',
                    300: '#e15042',
                    400: '#bd2b1d',
                    500: '#7f1d14',
                    600: '#65170f',
                    700: '#4c110b',
                    800: '#320b07',
                    900: '#190503',
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
