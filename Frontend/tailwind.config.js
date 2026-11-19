/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Usamos la clase `.dark` en el `<html>` (ver `ThemeContext.jsx`)
    // para que el toggle funcione independientemente del `prefers-color-scheme`.
    darkMode: "class",
    theme: {
      extend: {},
    },
    plugins: [],
}