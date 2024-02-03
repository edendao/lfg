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
    "LFG is a uniting force between tribes. For Farcaster, for degens, and for regens. Let's fucking go! Let's fucking grow! Let Farcaster grow!",
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  twitter: {
    creator: "@TheEdenDao",
    card: "summary_large_image",
    images: {
      url: "/images/lfg-meme.png",
      width: 231,
      height: 142,
      alt: "LFG: It's just a meme",
    },
  },
  openGraph: {
    type: "website",
    images: [
      {
        url: "/images/lfg-meme.png",
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
      <Image
        src="/images/lfg-meme.png"
        width={256}
        height={165}
        alt="LFG: It's just a meme"
      />
      <div
        style={{
          fontSize: 24,
          textAlign: "center",
          background: "rgba(0, 0, 0, 0.25)",
          marginTop: 24,
          marginBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
          borderRadius: 12,
        }}
      >
        <h1 style={{ fontSize: 64, lineHeight: 1.1 }}>🌱 LFG 🌱</h1>
        <p>A Farcaster squad built on kindness</p>
        <p>Free mint sold out in 4 hours</p>
        <p>
          <a href="https://warpcast.com/cyrusofeden">Follow along here</a>
        </p>
        <p>
          <a
            href="https://app.uniswap.org/swap?outputCurrency=0x3cB90DfD6225917d4898dE73D6a7E4451B4f9D76&chain=base"
            target="_blank"
          >
            Get LFG here and LP
          </a>
        </p>
      </div>
      <Image
        src="/images/lfg-pending.jpg"
        width={256}
        height={165}
        alt="Confirmed"
        style={{ marginBottom: 12 }}
      />
      <Image
        src="/images/lfg-confirmed.jpg"
        width={256}
        height={165}
        alt="Confirmed"
      />
    </div>
  )
}
