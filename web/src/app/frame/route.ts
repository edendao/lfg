import dedent from "dedent"
import { NextRequest, NextResponse } from "next/server"

const baseURL = "https://lfg-regens-and-degens.vercel.app"
const imageURL = (modifier: string, ext = "jpg") =>
  `${baseURL}/images/lfg-${modifier}.${ext}`

const BASE_FRAME_META = `
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<meta property="og:title" content="$LFG" />
<meta property="fc:frame" content="vNext" />
`

export const GET = async () =>
  new NextResponse(
    dedent`
    <!DOCTYPE html>
    <html>
      <head>
        ${BASE_FRAME_META}
        <meta property="og:image" content="${imageURL("pending", "jpg")}" />
        <meta property="fc:frame:image" content="${imageURL(
          "pending",
          "jpg",
        )}" />
        <meta property="fc:frame:button:1" content="🌱 8888 regens born, get LFG here 🌱" />
        <meta property="fc:frame:button:$idx:action" content="post_redirect" />
      </head>
    </html>
  `,
    {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  )

type FrameData = {
  untrustedData: {
    fid: number
    url: string
    messageHash: string
    timestamp: number
    network: number
    buttonIndex: number
    castId: {
      fid: number
      hash: string
    }
  }
  trustedData: {
    messageBytes: string
  }
}

export const POST = async () =>
  new NextResponse("", {
    status: 302,
    headers: {
      location:
        "https://app.uniswap.org/swap?outputCurrency=0x3cB90DfD6225917d4898dE73D6a7E4451B4f9D76&chain=base",
    },
  })
