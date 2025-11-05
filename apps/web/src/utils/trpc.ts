import type { AppRouter } from "@neural-net-neutrality/api/routers/index";
import type { inferRouterInputs } from "@trpc/server";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { toast } from "sonner";

const getBaseUrl = () => {
	const envUrl = import.meta.env.VITE_SERVER_URL as string | undefined;
	if (envUrl && typeof envUrl === "string") {
		return envUrl.replace(/\/$/, "");
	}
	if (typeof window !== "undefined" && window.location) {
		return window.location.origin;
	}
	return "http://localhost:808";
};

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

const baseUrl = getBaseUrl();

type RouterInputs = inferRouterInputs<AppRouter>;
type RunNeutralityInput = RouterInputs["runNeutralityTest"];
type RunNeutralityModelInput = RouterInputs["runNeutralityModel"];

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${baseUrl}/trpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});

export const trpc = {
	healthCheck: {
		queryOptions: () => ({
			queryKey: ["trpc", "healthCheck"] as const,
			queryFn: () => trpcClient.healthCheck.query(),
			staleTime: 30_000,
		}),
	},
	llmStatus: {
		queryOptions: () => ({
			queryKey: ["trpc", "llmStatus"] as const,
			queryFn: () => trpcClient.llmStatus.query(),
			staleTime: 30_000,
		}),
	},
	privateData: {
		queryOptions: () => ({
			queryKey: ["trpc", "privateData"] as const,
			queryFn: () => trpcClient.privateData.query(),
		}),
	},
	runNeutralityTest: (input: RunNeutralityInput) =>
		trpcClient.runNeutralityTest.mutate(input),
	runNeutralityModel: (input: RunNeutralityModelInput) =>
		trpcClient.runNeutralityModel.mutate(input),
};
