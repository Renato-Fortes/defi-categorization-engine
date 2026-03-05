import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { authStorage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

async function sendVerificationEmail(email: string, token: string, hostname: string, protocol: string) {
  const verifyUrl = `${protocol}://${hostname}/verify-email?token=${token}`;

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "DeFi Categorizer <onboarding@resend.dev>",
        to: email,
        subject: "Verify your email — DeFi Categorizer",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verify your email</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Click the button below to verify your email address and activate your DeFi Categorizer account.
            </p>
            <a href="${verifyUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Verify Email
            </a>
            <p style="color: #999; font-size: 13px; margin-top: 32px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        `,
      });
      return { sent: true };
    } catch (err) {
      console.error("Failed to send verification email via Resend:", err);
      return { sent: false, verifyUrl };
    }
  }

  console.log(`\n[EMAIL VERIFICATION] No email service configured.`);
  console.log(`Verification link for ${email}: ${verifyUrl}\n`);
  return { sent: false, verifyUrl };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }
            const user = await authStorage.upsertGoogleUser(
              profile.id,
              email,
              profile.name?.givenName || null,
              profile.name?.familyName || null,
              profile.photos?.[0]?.value || null
            );
            done(null, user);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await authStorage.getUser(id);
        done(null, user || null);
      } catch (err) {
        done(err);
      }
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login?error=google_failed" }),
      (req, res) => {
        const user = req.user as any;
        if (user) {
          req.session.userId = user.id;
          req.session.save(() => {
            res.redirect("/import");
          });
        } else {
          res.redirect("/login?error=google_failed");
        }
      }
    );

    console.log("[AUTH] Google OAuth configured");
  } else {
    app.get("/api/auth/google", (_req, res) => {
      res.status(501).json({ message: "Google sign-in is not configured. Please use email/password to create an account." });
    });
    console.log("[AUTH] Google OAuth not configured (missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)");
  }

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const existing = await authStorage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const user = await authStorage.upsertUser({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        passwordHash,
        emailVerified: false,
        verificationToken,
      });

      const protocol = req.protocol;
      const result = await sendVerificationEmail(email, verificationToken, req.hostname, protocol);

      return res.status(201).json({
        message: result.sent
          ? "Account created. Please check your email to verify your account."
          : "Account created. Check the server console for the verification link.",
        emailSent: result.sent,
        verifyUrl: result.sent ? undefined : result.verifyUrl,
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      return res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await authStorage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.emailVerified) {
        return res.status(403).json({ message: "Please verify your email before signing in. Check your inbox for the verification link." });
      }

      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        const { passwordHash, verificationToken, ...safeUser } = user;
        return res.json(safeUser);
      });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const user = await authStorage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification link" });
      }

      await authStorage.verifyUserEmail(user.id);
      return res.json({ message: "Email verified successfully. You can now sign in." });
    } catch (err: any) {
      console.error("Verification error:", err);
      return res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await authStorage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account exists with this email, a verification link has been sent." });
      }

      if (user.emailVerified) {
        return res.json({ message: "Email is already verified. You can sign in." });
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      await authStorage.updateVerificationToken(user.id, verificationToken);

      const protocol = req.protocol;
      await sendVerificationEmail(email, verificationToken, req.hostname, protocol);

      return res.json({ message: "If an account exists with this email, a verification link has been sent." });
    } catch (err: any) {
      console.error("Resend verification error:", err);
      return res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await authStorage.getUser(userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { passwordHash, verificationToken, ...safeUser } = user;
      return res.json(safeUser);
    } catch (err: any) {
      console.error("Get user error:", err);
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await authStorage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};
