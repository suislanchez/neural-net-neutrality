import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@neural-net-neutrality/api/context";
import { appRouter } from "@neural-net-neutrality/api/routers/index";
import { auth } from "@neural-net-neutrality/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const localFallbackOrigins = [
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:32000",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:3001",
	"http://127.0.0.1:32000",
];

const allowedOrigins = new Set([...configuredOrigins, ...localFallbackOrigins]);

const isDev = process.env.NODE_ENV !== "production";

const matchOrigin = (origin: string | null) => {
	if (!origin) {
		return null;
	}

	const normalizedOrigin = origin.replace(/\/$/, "");
	if (allowedOrigins.has(normalizedOrigin)) {
		return normalizedOrigin;
	}

	// Support simple wildcard patterns like http://localhost:*
	for (const configured of configuredOrigins) {
		if (!configured.endsWith(":*")) {
			continue;
		}
		const base = configured.slice(0, -2);
		if (normalizedOrigin.startsWith(base)) {
			return normalizedOrigin;
		}
	}

	// Allow Railway deployed apps
	if (normalizedOrigin.includes(".railway.app") || normalizedOrigin.includes(".up.railway.app")) {
		return normalizedOrigin;
	}

	// Allow Vercel deployed apps
	if (normalizedOrigin.includes(".vercel.app")) {
		return normalizedOrigin;
	}

	if (!isDev) {
		return null;
	}

	try {
		const url = new URL(normalizedOrigin);
		if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
			return normalizedOrigin;
		}
	} catch {
		// ignore parse errors
	}

	return null;
};

app.use(
	"/*",
	cors({
		origin: (origin, _c) => {
			const matched = matchOrigin(origin);
			console.log(`CORS request from: ${origin} - matched: ${matched}`);
			return matched ?? null;
		},
		allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
		allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-trpc-source"],
		exposeHeaders: ["Content-Length", "X-Request-Id"],
		credentials: true,
		maxAge: 600,
	}),
);

app.all("/api/auth/*", async (c) => {
	const origin = c.req.header("origin") || c.req.header("Origin");
	const matchedOrigin = matchOrigin(origin || null);
	
	const response = await auth.handler(c.req.raw);
	
	if (matchedOrigin) {
		response.headers.set("Access-Control-Allow-Origin", matchedOrigin);
		response.headers.set("Access-Control-Allow-Credentials", "true");
		response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
		response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-trpc-source");
		response.headers.set("Access-Control-Max-Age", "600");
	}
	
	return response;
});

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

const port = process.env.PORT || 3000;

console.log(`Started server: http://localhost:${port}`);

export default {
	port,
	fetch: app.fetch,
};
