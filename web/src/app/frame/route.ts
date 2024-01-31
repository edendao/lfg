import { kv } from "@vercel/kv"
import dedent from "dedent"
import { NextRequest, NextResponse } from "next/server"

const DEPLOYMENT_URL = process.env.VERCEL_URL
const APP_URL = DEPLOYMENT_URL
  ? `https://${DEPLOYMENT_URL}`
  : "http://localhost:3000"

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
        <meta property="og:image" content="${APP_URL}/lfg-MEME.png" />
        <meta property="fc:frame:image" content="${APP_URL}/lfg-MEME.png" />
        <meta property="fc:frame:button:1" content="😤 LFG 😤" />
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
const SYNDICATE_PROJECT_ID = process.env.SYNDICATE_PROJECT_ID
if (!SYNDICATE_API_KEY) throw new Error("Missing SYNDICATE_API_KEY.")
if (!SYNDICATE_PROJECT_ID) throw new Error("Missing SYNDICATE_PROJECT_ID.")

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

type ClaimStatus =
  | "PENDING"
  | "PROCESSED"
  | "SUBMITTED"
  | "CONFIRMED"
  | "FINISHED"
  | "ERROR"

const getStatus = async (txID: string): Promise<ClaimStatus> => {
  const req = await fetch(
    `https://api.syndicate.io/wallet/project/${SYNDICATE_PROJECT_ID}/request/${txID}`,
    {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${SYNDICATE_API_KEY}`,
      },
    },
  )
  const res = await req.json()

  const attempt = res.transactionAttempts[0]
  if (!attempt) return "PENDING"
  if (attempt.reverted) return "FINISHED"

  return attempt.status
}

export async function POST(req: NextRequest) {
  const status: ClaimStatus = await req
    .json()
    .then(claimTxn)
    .then(getStatus)
    .catch(() => "ERROR")

  return new NextResponse(
    dedent`
    <!DOCTYPE html>
    <html>
      <head>
        ${BASE_FRAME_META}
        <meta property="og:image" content="${APP_URL}/lfg-${status}.png" />
        <meta property="fc:frame:image" content="${APP_URL}/lfg-${status}.png" />
        ${
          status !== "FINISHED" &&
          `<meta property="fc:frame:button:1" content="🫡 Refresh Status 🫡" />
           <meta property="fc:frame:post_url" content="${APP_URL}/frame" />`
        }
      </head>
    </html>
    `,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  )
}