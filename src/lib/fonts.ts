import { Inter } from "next/font/google"

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})

// Keep for backward compatibility but use Inter
export const chakraPetch = inter
export const gildaDisplay = inter
export const spaceMono = inter

