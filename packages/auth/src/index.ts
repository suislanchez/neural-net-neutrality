import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@neural-net-neutrality/db";
import * as schema from "@neural-net-neutrality/db/schema/auth";

const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const trustedOrigins = [
	...configuredOrigins,
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:32000",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:3001",
	"http://127.0.0.1:32000",
];

// In production, allow Railway domains
if (process.env.NODE_ENV === "production") {
	trustedOrigins.push("https://*.railway.app", "https://*.up.railway.app");
}

export const auth = betterAuth<BetterAuthOptions>({
	secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-in-production",
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	database: drizzleAdapter(db, {
		provider: "sqlite",

		schema: schema,
	}),
	trustedOrigins: trustedOrigins.length > 0 ? trustedOrigins : ["*"],
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
