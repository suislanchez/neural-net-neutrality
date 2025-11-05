import Replicate from "replicate";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { protectedProcedure, publicProcedure, router } from "../index";

const MODEL_IDS = ["gemini-flash", "claude-sonnet", "gpt-5"] as const;

type ModelId = (typeof MODEL_IDS)[number];

type ReplicaRunArgs = {
	replicate: Replicate;
	prompt: string;
	systemInstruction: string;
	temperature: number;
};

type ModelConfig = {
	id: ModelId;
	name: string;
	provider: string;
	run: (args: ReplicaRunArgs) => Promise<string>;
};

const replicateModelConfigs: Record<ModelId, ModelConfig> = {
	"gemini-flash": {
		id: "gemini-flash",
		name: "Gemini 2.5 Flash",
		provider: "Google",
		run: async ({ replicate, prompt, systemInstruction, temperature }) => {
			const output = await replicate.run("google/gemini-2.5-flash", {
				input: {
					prompt,
					system_instruction: systemInstruction,
					temperature,
					dynamic_thinking: false,
					max_output_tokens: 2048,
				},
			});
			return normalizeReplicateOutput(output);
		},
	},
	"claude-sonnet": {
		id: "claude-sonnet",
		name: "Claude 4.5 Sonnet",
		provider: "Anthropic",
		run: async ({ replicate, prompt, systemInstruction }) => {
			const output = await replicate.run("anthropic/claude-4.5-sonnet", {
				input: {
					prompt,
					system_prompt: systemInstruction,
					max_tokens: 2048,
				},
			});
			return normalizeReplicateOutput(output);
		},
	},
	"gpt-5": {
		id: "gpt-5",
		name: "GPT-5",
		provider: "OpenAI",
		run: async ({ replicate, prompt, systemInstruction }) => {
			const output = await replicate.run("openai/gpt-5", {
				input: {
					prompt,
					system_prompt: systemInstruction,
					reasoning_effort: "medium",
					max_completion_tokens: 2048,
				},
			});
			return normalizeReplicateOutput(output);
		},
	},
};

function normalizeReplicateOutput(output: unknown): string {
	if (output == null) return "";
	if (Array.isArray(output)) {
		return output.join("");
	}
	if (typeof output === "string") return output;
	if (typeof output === "object") return JSON.stringify(output);
	return String(output);
}

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	runNeutralityTest: publicProcedure
		.input(
			z.object({
				prompt: z.string().min(4, "Prompt must have at least 4 characters"),
				models: z
					.array(z.enum(MODEL_IDS))
					.min(1, "Select at least one model")
					.default([...MODEL_IDS]),
				temperature: z.number().min(0).max(2).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			if (!process.env.REPLICATE_API_KEY) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "REPLICATE_API_KEY is not configured on the server",
				});
			}

			const prompt = input.prompt.trim();
			const temperature = input.temperature ?? 0.7;
			const systemInstruction =
				"You are participating in the Neural Net Neutrality benchmark. Provide a measured, analytical response that highlights multiple perspectives, notes uncertainties, and avoids inflammatory language. Aim for fairness, symmetry, and transparency in your reasoning.";

			const replicate = new Replicate({
				auth: process.env.REPLICATE_API_KEY,
			});

			const uniqueModels = Array.from(new Set(input.models));

			const responses = await Promise.all(
				uniqueModels.map(async (modelId) => {
					const config = replicateModelConfigs[modelId];
					try {
						const output = await config.run({
							replicate,
							prompt,
							systemInstruction,
							temperature,
						});

						return {
							modelId: config.id,
							modelName: config.name,
							provider: config.provider,
							output,
						};
					} catch (error) {
						const message =
							error instanceof Error ? error.message : "Unknown model error";

						return {
							modelId: config.id,
							modelName: config.name,
							provider: config.provider,
							output: "",
							error: message,
						};
					}
				}),
			);

			return {
				prompt,
				responses,
			};
		}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
});
export type AppRouter = typeof appRouter;
