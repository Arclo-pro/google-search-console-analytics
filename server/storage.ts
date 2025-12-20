import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { googleConnections, type GoogleConnection, type InsertGoogleConnection } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const { Pool } = pg;

export interface IStorage {
  getConnection(websiteId: string): Promise<GoogleConnection | undefined>;
  upsertConnection(connection: InsertGoogleConnection): Promise<GoogleConnection>;
  updateConnectionTokens(websiteId: string, accessToken: string, refreshToken: string, expiryDate: number): Promise<void>;
  updateScProperty(websiteId: string, scProperty: string): Promise<void>;
  updateGa4Property(websiteId: string, ga4PropertyId: string): Promise<void>;
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(pool);
  }

  async getConnection(websiteId: string): Promise<GoogleConnection | undefined> {
    const result = await this.db
      .select()
      .from(googleConnections)
      .where(eq(googleConnections.websiteId, websiteId))
      .limit(1);
    return result[0];
  }

  async upsertConnection(connection: InsertGoogleConnection): Promise<GoogleConnection> {
    const result = await this.db
      .insert(googleConnections)
      .values({
        ...connection,
        updatedAt: sql`NOW()`,
      })
      .onConflictDoUpdate({
        target: googleConnections.websiteId,
        set: {
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
          expiryDate: connection.expiryDate,
          scopes: connection.scopes,
          googleUserEmail: connection.googleUserEmail,
          updatedAt: sql`NOW()`,
        },
      })
      .returning();
    return result[0];
  }

  async updateConnectionTokens(websiteId: string, accessToken: string, refreshToken: string, expiryDate: number): Promise<void> {
    await this.db
      .update(googleConnections)
      .set({ accessToken, refreshToken, expiryDate, updatedAt: sql`NOW()` })
      .where(eq(googleConnections.websiteId, websiteId));
  }

  async updateScProperty(websiteId: string, scProperty: string): Promise<void> {
    await this.db
      .update(googleConnections)
      .set({ scProperty, updatedAt: sql`NOW()` })
      .where(eq(googleConnections.websiteId, websiteId));
  }

  async updateGa4Property(websiteId: string, ga4PropertyId: string): Promise<void> {
    await this.db
      .update(googleConnections)
      .set({ ga4PropertyId, updatedAt: sql`NOW()` })
      .where(eq(googleConnections.websiteId, websiteId));
  }
}

export const storage = new DbStorage();
