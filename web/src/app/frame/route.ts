import dedent from "dedent"
import { NextRequest, NextResponse } from "next/server"

const baseURL = "https://lfg-regens-and-degens.vercel.app"
const postURL = `${baseURL}/frame`
const imageURL = (modifier: string, ext = "jpg") =>
  `${baseURL}/images/lfg-${modifier}.${ext}`

const BASE_FRAME_META = `
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<meta property="og:title" content="$LFG" />
<meta property="fc:frame" content="vNext" />
`

export async function GET() {
  return new NextResponse(
    dedent`
    <!DOCTYPE html>
    <html>
      <head>
        ${BASE_FRAME_META}
        <meta property="og:image" content="${imageURL("meme", "png")}" />
        <meta property="fc:frame:image" content="${imageURL("meme", "png")}" />
        <meta property="fc:frame:button:1" content="🌱 LFG 🌱" />
        <meta property="fc:frame:post_url" content="${postURL}" />
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
}

const SYNDICATE_API_KEY = process.env.SYNDICATE_API_KEY
if (!SYNDICATE_API_KEY) throw new Error("Missing SYNDICATE_API_KEY.")

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

const claimTxn = async (body: FrameData): Promise<boolean> => {
  const fid = body.untrustedData.fid
  if (!fid) {
    throw new Error("Missing fid.")
  }

  console.log(body.untrustedData)

  const frameTrustedData = body.trustedData.messageBytes
  const req = await fetch("https://frame.syndicate.io/api/mint", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${SYNDICATE_API_KEY}`,
    },
    body: JSON.stringify({ frameTrustedData }),
  })
  const { success } = await req.json()

  return success as boolean
}

export async function POST(req: NextRequest) {
  const success = await req
    .json()
    .then(claimTxn)
    .catch((error) => {
      console.error(error)
      return false
    })

  const status = success ? "confirmed" : "error"

  return new NextResponse(
    dedent`
    <!DOCTYPE html>
    <html>
      <head>
        ${BASE_FRAME_META}
        <meta property="og:image" content="${imageURL(status)}" />
        <meta property="fc:frame:image" content="${imageURL(status)}" />
        ${
          status === "error"
            ? dedent`
              <meta property="fc:frame:button:1" content="🌱 Retry 🌱" />
              <meta property="fc:frame:post_url" content="${postURL}" />
              `
            : ""
        }
      </head>
    </html>
    `,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  )
}
