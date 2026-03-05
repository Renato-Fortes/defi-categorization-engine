import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  upsertGoogleUser(googleId: string, email: string, firstName: string | null, lastName: string | null, profileImageUrl: string | null): Promise<User>;
  verifyUserEmail(id: string): Promise<void>;
  updateVerificationToken(id: string, token: string): Promise<void>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async upsertGoogleUser(googleId: string, email: string, firstName: string | null, lastName: string | null, profileImageUrl: string | null): Promise<User> {
    const existing = await this.getUserByGoogleId(googleId);
    if (existing) {
      const [user] = await db
        .update(users)
        .set({ email, firstName, lastName, profileImageUrl, updatedAt: new Date() })
        .where(eq(users.googleId, googleId))
        .returning();
      return user;
    }

    const existingByEmail = await this.getUserByEmail(email);
    if (existingByEmail) {
      const [user] = await db
        .update(users)
        .set({ googleId, firstName: firstName || existingByEmail.firstName, lastName: lastName || existingByEmail.lastName, profileImageUrl, emailVerified: true, updatedAt: new Date() })
        .where(eq(users.email, email))
        .returning();
      return user;
    }

    const [user] = await db
      .insert(users)
      .values({ googleId, email, firstName, lastName, profileImageUrl, emailVerified: true })
      .returning();
    return user;
  }

  async verifyUserEmail(id: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerified: true, verificationToken: null, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateVerificationToken(id: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({ verificationToken: token, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}

export const authStorage = new AuthStorage();
