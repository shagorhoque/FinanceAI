// lib/gocardless/client.ts
import gocardless from "gocardless-nodejs"

const environment = process.env.GOCARDLESS_ENVIRONMENT === "live" ? "live" : "sandbox"
const accessToken = process.env.GOCARDLESS_ACCESS_TOKEN

if (!accessToken) {
  throw new Error("GOCARDLESS_ACCESS_TOKEN environment variable is not set")
}

export const gocardlessClient = gocardless(accessToken, {
  environment,
  raiseOnIdempotencyConflict: false,
})

// Helper to get the GoCardless environment
export const getGoCardlessEnvironment = () => environment

// Helper to check if we're in sandbox mode
export const isSandboxMode = () => environment === "sandbox"
