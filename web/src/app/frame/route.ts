import { SyndicateClient } from "@syndicateio/syndicate-node"
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

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
if (!NEYNAR_API_KEY) throw new Error("Missing NEYNAR_API_KEY.")

const accountForUser = async ({ fid }: { fid: number }) => {
  const req = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    { headers: { accept: "application/json", api_key: NEYNAR_API_KEY } },
  )
  const res = await req.json()
  const address = res?.users?.[0]?.verifications?.[0]
  if (!address) throw new Error("No address found for FID.")

  return address
}

const SYNDICATE_PROJECT_ID = ""
const SYNDICATE_API_KEY = process.env.SYNDICATE_API_KEY
if (!SYNDICATE_API_KEY) throw new Error("Missing SYNDICATE_API_KEY.")

const syndicate = new SyndicateClient({ token: SYNDICATE_API_KEY })

const claim = async (account: string) => {
  const tx = await kv.get<string>(`${account}-claim-txid`)
  if (tx) {
    return tx
  }

  const { transactionId } = await syndicate.transact.sendTransaction({
    projectId: "TODO",
    contractAddress: "TODO",
    chainId: 8453,
    functionSignature: "claim(address account)",
    args: { account },
  })

  await kv.set(`${account}-claim-txid`, transactionId)
  return transactionId
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
  const { untrustedData } = await req.json()
  const account = await accountForUser(untrustedData)

  const status: ClaimStatus = await claim(account)
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
