module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        negro: "#000000",
        blanco: "#FFFFFF",
        gris: "#E5E5E5",
        cobalto: "#00173D",
        celeste: "#62A1FF",
        verde: "#4ADE80",
        amarillo: "#FACC15",
        rojo: "#F87171",
        background: "#000000",
        foreground: "#FFFFFF",
        muted: "#E5E5E5",
        primary: "#00173D",
        accent: "#62A1FF",
        success: "#4ADE80",
        warning: "#FACC15",
        danger: "#F87171",
      },
      fontFamily: {
        sans: ["Montserrat_400Regular"],
        bold: ["Montserrat_700Bold"],
      },
      borderRadius: {
        component: "8px",
      },
    },
  },
  plugins: [],
};
