import { NextResponse } from "next/server"

const SYNDICATE_API_KEY = process.env.SYNDICATE_API_KEY
if (!SYNDICATE_API_KEY) throw new Error("Missing SYNDICATE_API_KEY.")

export const GET = async () => {
  const req = await fetch("https://frame.syndicate.io/api/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${SYNDICATE_API_KEY}`,
    },
    body: JSON.stringify({
      contractAddress: "0x3cB90DfD6225917d4898dE73D6a7E4451B4f9D76",
    }),
  })
  const res = await req.json()
  return NextResponse.json(res)
}
