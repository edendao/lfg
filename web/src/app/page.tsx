import { Metadata } from "next"
import Image from "next/image"

const baseURL = process.env.NEXT_PUBLIC_WEB_URL
  ? new URL(process.env.NEXT_PUBLIC_WEB_URL)
  : process.env.VERCEL_URL
  ? new URL(`https://${process.env.VERCEL_URL}`)
  : process.env.NEXT_PUBLIC_ENV === "development"
  ? new URL(`http://localhost:${process.env.PORT || 3000}`)
  : undefined

export const metadata: Metadata = {
  metadataBase: baseURL,
  title: "🌱 LFG 🌱 | Degens 🤝 Regens",
  description:
    "LFG is a uniting force between tribes. It's just a meme. For degens, it's let's fucking go! For regens, it's let's fucking grow!",
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  twitter: {
    creator: "@TheEdenDao",
    card: "summary_large_image",
    images: {
      url: "/og.png",
      width: 231,
      height: 142,
      alt: "LFG: It's just a meme",
    },
  },
  openGraph: {
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 231,
        height: 142,
        alt: "LFG: It's just a meme",
      },
    ],
  },
}

export default function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100dvh",
        color: "white",
        padding: 24,
        background: "linear-gradient(to right, #a8ff78, #78ffd6)",
      }}
    >
      <h1 style={{ fontSize: 64, lineHeight: 1.1 }}>🌱 LFG 🌱</h1>
      <Image
        src="/images/lfg-meme.png"
        width={231}
        height={242}
        alt="LFG: It's just a meme"
        style={{ marginBottom: 12 }}
      />
      <Image
        src="/images/lfg-confirmed.png"
        width={232}
        height={232}
        alt="Confirmed"
        style={{ marginBottom: 12 }}
      />
    </div>
  )
}
