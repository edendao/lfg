import { kv } from "@vercel/kv"
import { Alchemy, Network } from "alchemy-sdk"
import dedent from "dedent"
import { NextRequest, NextResponse } from "next/server"

const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_URL
const APP_URL = DEPLOYMENT_URL
  ? `https://${DEPLOYMENT_URL}`
  : "http://localhost:3000"

const BASE_FRAME_META = `
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<meta property="og:title" content="$LFG" />
<meta property="fc:frame" content="vNext" />
`

const imageURL = (modifier: string) => `${APP_URL}/image/lfg-${modifier}.png`

export async function GET() {
  return new NextResponse(
    dedent`
    <!DOCTYPE html>
    <html>
      <head>
        ${BASE_FRAME_META}
        <meta property="og:image" content="${imageURL("meme")}" />
        <meta property="fc:frame:image" content="${imageURL("meme")}" />
        <meta property="fc:frame:button:1" content="🌱 LFG 🌱" />
        <meta property="fc:frame:post_url" content="${APP_URL}/frame" />
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

const claimTxn = async (body: FrameData): Promise<string> => {
  const fid = body.untrustedData.fid
  if (!fid) {
    throw new Error("Missing fid.")
  }

  let txid = await kv.get<string>(`${fid}-claim-txid`)
  if (txid) {
    return txid
  }

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
  const res = await req.json()

  txid = res.transactionId as string
  await kv.set(`${fid}-claim-txid`, txid, { ex: 21 * 24 * 60 * 60 }) // 21 days
  return txid
}

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
})

type ClaimStatus = "pending" | "confirmed" | "error"

const getStatus = async (txID: string): Promise<ClaimStatus> => {
  let status = await kv.get<ClaimStatus>(`${txID}-status`)
  if (status) {
    return status
  }

  const tx = await alchemy.core.getTransactionReceipt(txID)
  status = !tx ? "pending" : tx.status === 1 ? "confirmed" : "error"

  await kv.set(`${txID}-status`, status, { ex: 2 })
  return status
}

export async function POST(req: NextRequest) {
  const status: ClaimStatus = await req
    .json()
    .then(claimTxn)
    .then(getStatus)
    .catch(() => "error")

  return new NextResponse(
    dedent`
    <!DOCTYPE html>
    <html>
      <head>
        ${BASE_FRAME_META}
        <meta property="og:image" content="${imageURL(status)}" />
        <meta property="fc:frame:image" content="${imageURL(status)}" />
        ${
          status === "pending" &&
          `<meta property="fc:frame:button:1" content="🫡 Refresh Status 🫡" />
           <meta property="fc:frame:post_url" content="${APP_URL}/frame" />`
        }
      </head>
    </html>
    `,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  )
}
