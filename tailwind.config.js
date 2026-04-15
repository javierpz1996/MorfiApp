/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F97316",
          "orange-strong": "#EA580C",
          "orange-soft": "#FFF7ED",
        },
        ink: "#111827",
        "text-gray": "#6B7280",
        "gray-light": "#9CA3AF",
      },
      fontSize: {
        // Entre 2xl (24px) y 3xl (30px)
        "2_5xl": ["28px", { lineHeight: "34px" }],
      },
      fontFamily: {
        sans: ["Karla_400Regular"],
        rubik: ["Rubik_400Regular"],
        "rubik-light": ["Rubik_300Light"],
        "rubik-medium": ["Rubik_500Medium"],
        "rubik-semibold": ["Rubik_600SemiBold"],
        "rubik-bold": ["Rubik_700Bold"],
        "rubik-extrabold": ["Rubik_800ExtraBold"],
        "rubik-black": ["Rubik_900Black"],
        "rubik-italic": ["Rubik_400Regular_Italic"],
        "rubik-light-italic": ["Rubik_300Light_Italic"],
        "rubik-medium-italic": ["Rubik_500Medium_Italic"],
        "rubik-semibold-italic": ["Rubik_600SemiBold_Italic"],
        "rubik-bold-italic": ["Rubik_700Bold_Italic"],
        "rubik-extrabold-italic": ["Rubik_800ExtraBold_Italic"],
        "rubik-black-italic": ["Rubik_900Black_Italic"],
        karla: ["Karla_400Regular"],
        "karla-medium": ["Karla_500Medium"],
        "karla-semibold": ["Karla_600SemiBold"],
        "karla-bold": ["Karla_700Bold"],
      },
    },
  },
  plugins: [],
};
