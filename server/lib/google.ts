import { google } from "googleapis";
import type { GoogleConnection } from "@shared/schema";
import { storage } from "../storage";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";

export const REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
  "openid",
  "email",
];

export function createOAuth2Client() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error("Google OAuth credentials not configured");
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

export async function getAuthenticatedClient(websiteId: string) {
  const connection = await storage.getConnection(websiteId);
  
  if (!connection) {
    throw { code: "NOT_CONNECTED", message: "No Google connection found for this website" };
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.expiryDate,
    scope: connection.scopes.join(" "),
  });

  // Check if token is expired or about to expire (within 5 minutes)
  const now = Date.now();
  const expiryBuffer = 5 * 60 * 1000; // 5 minutes
  
  if (connection.expiryDate <= now + expiryBuffer) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      if (credentials.access_token && credentials.refresh_token && credentials.expiry_date) {
        await storage.updateConnectionTokens(
          websiteId,
          credentials.access_token,
          credentials.refresh_token,
          credentials.expiry_date
        );
        
        oauth2Client.setCredentials(credentials);
      }
    } catch (error) {
      throw { code: "TOKEN_REFRESH_FAILED", message: "Failed to refresh access token", error };
    }
  }

  return oauth2Client;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      const status = error?.response?.status || error?.code;
      
      // Retry on rate limiting or server errors
      if (status === 429 || (status >= 500 && status < 600)) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry on other errors
      throw error;
    }
  }
  
  throw lastError;
}

export function handleGoogleAPIError(error: any) {
  const status = error?.response?.status;
  const message = error?.response?.data?.error?.message || error.message;

  if (status === 429) {
    return { code: "RATE_LIMITED", message: "Google API rate limit exceeded. Please try again later." };
  }

  if (status === 403) {
    return { code: "INSUFFICIENT_SCOPE", message: "Insufficient permissions. Please reconnect your Google account." };
  }

  if (status === 400) {
    return { code: "INVALID_PROPERTY", message: "Invalid property ID or property not found." };
  }

  if (error.code === "NOT_CONNECTED") {
    return error;
  }

  return { code: "GOOGLE_API_ERROR", message: message || "An error occurred with the Google API" };
}
