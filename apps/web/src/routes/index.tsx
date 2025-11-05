import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ArrowUpRight,
	Bot,
	CodeXml,
	Globe,
	Menu,
	MessageCircle,
	Plus,
	Send,
	Sparkles,
	UserRound,
	Workflow,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { trpc, trpcClient } from "@/utils/trpc";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const MODEL_CHOICES = [
	{
		id: "gemini-flash",
		name: "Gemini 2.5 Flash",
		provider: "Google",
		description:
			"Google’s hybrid “thinking” AI model optimized for speed and cost-efficiency.",
	},
	{
		id: "claude-sonnet",
		name: "Claude 4.5 Sonnet",
		provider: "Anthropic",
		description:
			"Anthropic’s frontier reasoning model tuned for coding and complex judgement.",
	},
	{
		id: "gpt-5",
		name: "GPT-5",
		provider: "OpenAI",
		description:
			"OpenAI’s flagship model for broad reasoning, writing, and balanced analysis.",
	},
] as const;

const SUGGESTION_BUBBLES = [
	"Is the death penalty ever justified?",
	"Should abortion remain legal?",
	"Do sanctions work against authoritarian regimes?",
	"Can affirmative action be fair?",
	"Should social media ban political ads?",
];

type ModelChoice = (typeof MODEL_CHOICES)[number];
type ModelId = ModelChoice["id"];

function HomeComponent() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const [prompt, setPrompt] = useState("");
	const [selectedModels, setSelectedModels] = useState<ModelId[]>(
		MODEL_CHOICES.map((model) => model.id),
	);
	const [responses, setResponses] = useState<
		Array<{
			modelId: string;
			modelName: string;
			provider: string;
			output: string;
			error?: string;
		}>
	>([]);

	const runNeutrality = useMutation({
		mutationKey: ["runNeutralityTest"],
		mutationFn: async (input: { prompt: string; models: ModelId[] }) => {
			return trpcClient.runNeutralityTest.mutate(input);
		},
		onMutate: () => {
			setResponses([]);
		},
		onSuccess: (data) => {
			setResponses(data.responses);
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error ? error.message : "Failed to run neutrality test";
			toast.error(message);
		},
	});

	const toggleModel = (id: ModelId) => {
		setSelectedModels((current) =>
			current.includes(id)
				? current.filter((modelId) => modelId !== id)
				: [...current, id],
		);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = prompt.trim();
		if (!trimmed || selectedModels.length === 0) {
			return;
		}
		runNeutrality.mutate({
			prompt: trimmed,
			models: selectedModels,
		});
	};

	const suggestionColors = ["bg-[#5eead4]", "bg-[#c084fc]", "bg-[#f97316]"];
	const isSending = runNeutrality.isPending;
	const isSendDisabled =
		!prompt.trim() || selectedModels.length === 0 || isSending;

	return (
		<div className="flex h-screen w-full bg-[#0f1016] text-white">
			<aside className="hidden h-full w-64 flex-col border-r border-white/5 bg-[#0b0c12] p-4 md:flex">
				<div className="flex items-center justify-between text-sm font-semibold">
					<div className="flex items-center gap-2">
						<Workflow className="size-4 text-primary" />
						<span>Neural Net Neutrality</span>
					</div>
					<ArrowUpRight className="size-4 text-white/40" />
				</div>
				<nav className="mt-6 space-y-2">
					<button className="flex w-full items-center gap-3 rounded-lg bg-white/[0.08] px-3 py-2 text-sm transition hover:bg-white/[0.12]">
						<Plus className="size-4" />
						New Test
					</button>
					<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]">
						<MessageCircle className="size-4" />
						History
					</button>
					<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]">
						<Bot className="size-4" />
						Model Leaderboard
					</button>
				</nav>
				<div className="mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs text-white/70">
					Take your neutrality audits anywhere. Login to keep your runs synced.
					<Button
						variant="ghost"
						size="sm"
						className="mt-3 w-full justify-center bg-white text-[#0b0c12] hover:bg-white/90"
					>
						Login
					</Button>
				</div>
				<div className="mt-6 flex justify-between text-[10px] text-white/40">
					<span>Terms</span>
					<span>Privacy</span>
					<span>Cookies</span>
				</div>
			</aside>

			<div className="flex flex-1 flex-col">
				<header className="flex items-center justify-between border-b border-white/5 bg-[#0f1016]/90 px-5 py-4 backdrop-blur-sm">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden text-white/70 hover:bg-white/[0.08]"
						>
							<Menu className="size-5" />
						</Button>
						<span className="text-sm font-semibold text-white/70">
							Mode: Playground
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="gap-2 bg-white/[0.05] text-white/80 hover:bg-white/[0.12]"
						>
							Battle View
							<ArrowUpRight className="size-4" />
						</Button>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
							<span
								className={`size-2 rounded-full ${healthCheck.data ? "bg-emerald-400" : "bg-amber-400"}`}
							/>
							<span>
								{healthCheck.isLoading
									? "Connecting..."
									: healthCheck.data
										? "API Online"
										: "API Offline"}
							</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="gap-2 bg-white text-[#0f1016] hover:bg-white/90"
						>
							<UserRound className="size-4" />
							Login
						</Button>
					</div>
				</header>

				<main className="flex flex-1 justify-center overflow-y-auto px-4 py-12">
					<div className="flex w-full max-w-3xl flex-col items-center gap-12 text-center">
						<div className="flex flex-col items-center gap-4">
							<div className="flex items-center gap-3 text-white/70">
								<Bot className="size-5" />
								<Sparkles className="size-4" />
								<CodeXml className="size-4" />
								<Globe className="size-4" />
							</div>
							<div>
								<h1 className="text-3xl font-semibold">
									Find the fairest model for your use case
								</h1>
								<p className="mt-2 text-sm text-white/65">
									Run side-by-side prompts across multiple LLMs and watch
									neutrality metrics update the moment they answer.
								</p>
							</div>
						</div>

						<section className="w-full rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-[0_0_60px_rgba(82,158,255,0.16)]">
							<form
								onSubmit={handleSubmit}
								className="rounded-2xl bg-white/[0.02] p-4 text-left text-white/90"
							>
								<div className="flex flex-col gap-3 border-b border-white/[0.08] pb-4">
									<label className="text-xs uppercase tracking-wide text-white/40">
										Models
									</label>
									<div className="flex flex-wrap gap-2">
										{MODEL_CHOICES.map((model) => {
											const isActive = selectedModels.includes(model.id);
											return (
												<button
													type="button"
													key={model.id}
													onClick={() => toggleModel(model.id)}
													className={`flex min-w-[140px] flex-col gap-0.5 rounded-xl border px-3 py-2 text-left transition ${
														isActive
															? "border-white bg-white/90 text-[#0f1016]"
															: "border-white/15 bg-white/[0.04] text-white/70 hover:border-white/25 hover:bg-white/[0.08]"
													}`}
												>
													<span className="text-sm font-semibold">
														{model.name}
													</span>
													<span
														className={`text-[11px] uppercase tracking-wide ${isActive ? "text-[#0f1016]/70" : "text-white/40"}`}
													>
														{model.provider}
													</span>
												</button>
											);
										})}
									</div>
								</div>

								<div className="mt-4 flex flex-col gap-3">
									<label className="text-xs uppercase tracking-wide text-white/40">
										Prompt
									</label>
									<textarea
										rows={6}
										value={prompt}
										onChange={(event) => setPrompt(event.target.value)}
										placeholder="Pose a controversial question or flip a scenario…"
										className="w-full min-h-[200px] resize-none rounded-2xl border border-white/8 bg-black/70 px-4 py-4 text-base outline-none placeholder:text-white/30 focus:border-white/30"
									/>
								</div>

								<div className="mt-4 flex items-center justify-between">
									<div className="flex items-center gap-2 text-white/60">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="size-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12]"
											onClick={() => setPrompt("")}
										>
											<Plus className="size-5 rotate-45" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="size-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12]"
										>
											<Globe className="size-5" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="size-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12]"
										>
											<CodeXml className="size-5" />
										</Button>
									</div>
									<Button
										type="submit"
										disabled={isSendDisabled}
										className="h-10 rounded-full bg-white text-[#0f1016] hover:bg-white/90 disabled:opacity-40"
									>
										{isSending ? "Running…" : "Send prompt"}
										<Send className="ml-2 size-4" />
									</Button>
								</div>

								<div className="mt-5 flex flex-wrap justify-center gap-3">
									{SUGGESTION_BUBBLES.map((suggestion, index) => (
										<button
											type="button"
											key={suggestion}
											onClick={() => setPrompt(suggestion)}
											className={`rounded-full px-4 py-2 text-xs font-medium text-black transition hover:opacity-90 ${
												suggestionColors[index % suggestionColors.length]
											}`}
										>
											{suggestion}
										</button>
									))}
								</div>
							</form>

							{isSending && (
								<div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-6 text-sm text-white/70">
									Running neutrality checks across selected models…
								</div>
							)}

							{responses.length > 0 && (
								<div className="mt-6 space-y-4 text-left">
									{responses.map((response) => (
										<div
											key={response.modelId}
											className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
										>
											<div className="mb-2 flex items-center justify-between gap-2">
												<div>
													<p className="text-sm font-semibold text-white">
														{response.modelName}
													</p>
													<p className="text-xs uppercase tracking-wide text-white/40">
														{response.provider}
													</p>
												</div>
												{!response.error && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="text-xs text-white/60 hover:bg-white/[0.12]"
														onClick={() => setPrompt(response.output)}
													>
														Copy to prompt
														<ArrowUpRight className="ml-1 size-4" />
													</Button>
												)}
											</div>
											{response.error ? (
												<p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
													{response.error}
												</p>
											) : (
												<pre className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
													{response.output}
												</pre>
											)}
										</div>
									))}
								</div>
							)}
						</section>
					</div>
				</main>
			</div>
		</div>
	);
}
