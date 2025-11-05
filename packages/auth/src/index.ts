import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@neural-net-neutrality/db";
import * as schema from "@neural-net-neutrality/db/schema/auth";

export const auth = betterAuth<BetterAuthOptions>({
	secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	database: drizzleAdapter(db, {
		provider: "sqlite",

		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || "*"],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});
