import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowUpRight,
	Bot,
	ChevronLeft,
	ChevronRight,
	CodeXml,
	Globe,
	Loader2,
	Menu,
	MessageCircle,
	Plus,
	Send,
	Sparkles,
	X,
	UserRound,
	Workflow,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

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
	"Is abortion okay?",
	"Is Capitalism or Communism better?",
	"Is AI more dangerous than nuclear weapons?"
];

type ModelId = (typeof MODEL_CHOICES)[number]["id"];

type ResponseState = {
	modelId: ModelId;
	modelName: string;
	provider: string;
	output: string;
	status: "idle" | "loading" | "success" | "error";
	error?: string;
};

const MODEL_LOOKUP: Record<ModelId, (typeof MODEL_CHOICES)[number]> =
	MODEL_CHOICES.reduce(
		(map, model) => {
			map[model.id] = model;
			return map;
		},
		{} as Record<ModelId, (typeof MODEL_CHOICES)[number]>,
	);

function HomeComponent() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	const llmStatus = useQuery({
		...trpc.llmStatus.queryOptions(),
		refetchInterval: 60_000,
	});
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [selectedModels, setSelectedModels] = useState<ModelId[]>(
		MODEL_CHOICES.map((model) => model.id),
	);
	const [responses, setResponses] = useState<Record<ModelId, ResponseState>>({});
	const [isSending, setIsSending] = useState(false);

	const toggleModel = (id: ModelId) => {
		setSelectedModels((current) =>
			current.includes(id)
				? current.filter((modelId) => modelId !== id)
				: [...current, id],
		);

		setResponses((previous) => {
			if (!(id in previous)) {
				return previous;
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [id]: _removed, ...rest } = previous;
			return rest;
		});
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = prompt.trim();
		if (!trimmed || selectedModels.length === 0) {
			return;
		}
		if (!llmStatus.data?.ready) {
			toast.error(
				llmStatus.data?.reason ??
					"LLM service is currently unavailable. Please try again later.",
			);
			return;
		}
		try {
			setIsSending(true);
			const initialState = selectedModels.reduce((acc, modelId) => {
				const meta = MODEL_LOOKUP[modelId];
				acc[modelId] = {
					modelId,
					modelName: meta?.name ?? modelId,
					provider: meta?.provider ?? "",
					output: "",
					status: "loading",
				};
				return acc;
			}, {} as Record<ModelId, ResponseState>);
			setResponses(initialState);

			await Promise.allSettled(
				selectedModels.map(async (modelId) => {
					const meta = MODEL_LOOKUP[modelId];
					try {
						const result = await trpc.runNeutralityModel({
							prompt: trimmed,
							modelId,
						});

						setResponses((previous) => ({
							...previous,
							[modelId]: {
								modelId: result.modelId as ModelId,
								modelName: result.modelName ?? meta.name,
								provider: result.provider ?? meta.provider,
								output: result.output,
								status: result.error ? "error" : "success",
								error: result.error,
							},
						}));
					} catch (error) {
						const message =
							error instanceof Error
								? error.message
								: "Failed to run neutrality test";
						setResponses((previous) => ({
							...previous,
							[modelId]: {
								modelId,
								modelName: meta.name,
								provider: meta.provider,
								output: "",
								status: "error",
								error: message,
							},
						}));
						toast.error(message);
					}
				}),
			);
		} finally {
			setIsSending(false);
		}
	};

	const suggestionColors = ["bg-[#5eead4]", "bg-[#c084fc]", "bg-[#f97316]"];
	const llmReady = llmStatus.data?.ready ?? false;
	const isSendDisabled =
		!prompt.trim() || selectedModels.length === 0 || isSending || !llmReady;

	const apiStatusDisplay = healthCheck.isLoading
		? { text: "Connecting…", color: "bg-amber-400" }
		: healthCheck.data
			? { text: "API Online", color: "bg-emerald-400" }
			: { text: "API Offline", color: "bg-rose-400" };

	const llmStatusDisplay = llmStatus.isLoading
		? { text: "Checking models…", color: "bg-amber-400" }
		: llmReady
			? { text: "LLM Ready", color: "bg-emerald-400" }
			: { text: "LLM Offline", color: "bg-rose-400" };

	const sidebarClasses = cn(
		"relative z-40 flex flex-col border-white/5 bg-[#0b0c12] px-4 py-5 transition-all duration-300 md:static md:h-auto md:min-h-svh md:border-r md:px-6 md:py-6 md:shadow-none",
		isSidebarCollapsed ? "md:w-20 md:px-3" : "md:w-64",
		isSidebarOpen
			? "fixed inset-y-0 left-0 w-64 translate-x-0 shadow-[0_0_45px_rgba(0,0,0,0.45)] md:translate-x-0 md:shadow-none"
			: "fixed inset-y-0 left-0 w-64 -translate-x-full shadow-[0_0_45px_rgba(0,0,0,0.45)] md:translate-x-0 md:shadow-none",
		isSidebarOpen
			? "pointer-events-auto md:pointer-events-auto"
			: "pointer-events-none md:pointer-events-auto",
		"md:flex",
	);

	const showResponses = isSending || Object.keys(responses).length > 0;
	const orderedModelIds = showResponses ? Array.from(new Set(selectedModels)) : [];

	return (
		<div className="relative flex min-h-svh w-full flex-col bg-[#0f1016] text-white md:flex-row">
			{isSidebarOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
			<aside className={sidebarClasses}>
				<div className="flex items-center justify-between text-sm font-semibold">
					<div className={cn("flex items-center gap-2", isSidebarCollapsed && "md:flex-col md:gap-1")}>
						<Workflow className="size-4 text-primary" />
						<span className={cn("whitespace-nowrap", isSidebarCollapsed && "md:hidden")}>
							Neural Net Neutrality
						</span>
					</div>
					<button
						type="button"
						className="rounded-full p-1 text-white/60 transition hover:bg-white/[0.08] md:hidden"
						onClick={() => setIsSidebarOpen(false)}
						aria-label="Close sidebar"
					>
						<X className="size-4" />
					</button>
				</div>
				<nav
					className={cn(
						"mt-6 flex flex-col gap-2",
						isSidebarCollapsed && "md:items-center md:gap-3",
					)}
				>
					<button
						className={cn(
							"flex w-full items-center gap-3 rounded-lg bg-white/[0.08] px-3 py-2 text-sm transition hover:bg-white/[0.12]",
							isSidebarCollapsed && "md:w-auto md:justify-center md:px-2",
						)}
					>
						<Plus className="size-4" />
						<span className={cn(isSidebarCollapsed && "md:hidden")}>New Test</span>
					</button>
					<button
						className={cn(
							"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]",
							isSidebarCollapsed && "md:w-auto md:justify-center md:px-2",
						)}
					>
						<MessageCircle className="size-4" />
						<span className={cn(isSidebarCollapsed && "md:hidden")}>History</span>
					</button>
					<button
						className={cn(
							"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]",
							isSidebarCollapsed && "md:w-auto md:justify-center md:px-2",
						)}
					>
						<Bot className="size-4" />
						<span className={cn(isSidebarCollapsed && "md:hidden")}>
							Model Leaderboard
						</span>
					</button>
				</nav>
				<div
					className={cn(
						"mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs text-white/70",
						isSidebarCollapsed && "md:hidden",
					)}
				>
					Take your neutrality audits anywhere. Login to keep your runs synced.
					<Button
						variant="ghost"
						size="sm"
						className="mt-3 w-full justify-center bg-white text-[#0b0c12] hover:bg-white/90"
					>
						Login
					</Button>
				</div>
				<div
					className={cn(
						"mt-6 flex justify-between text-[10px] text-white/40",
						isSidebarCollapsed && "md:hidden",
					)}
				>
					<span>Terms</span>
					<span>Privacy</span>
					<span>Cookies</span>
				</div>
				<button
					type="button"
					className="absolute -right-3 top-24 hidden h-10 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0f1016] text-white/70 shadow-[0_12px_30px_rgba(15,16,22,0.45)] transition hover:bg-white/10 md:flex"
					onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
					aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					{isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
				</button>
			</aside>

			<div className="flex flex-1 flex-col">
				<header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-[#0f1016]/80 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0f1016]/65 sm:px-5">
					<div className="flex flex-1 flex-wrap items-center gap-2 text-sm text-white/70 sm:flex-none sm:gap-3">
						<Button
							variant="ghost"
							size="icon"
							className="text-white/70 hover:bg-white/[0.08] md:hidden"
							onClick={() => setIsSidebarOpen((open) => !open)}
							aria-label="Toggle sidebar"
						>
							<Menu className="size-5" />
						</Button>
						<span className="text-xs font-semibold uppercase tracking-wide text-white/60 sm:text-sm">
							Mode: Playground
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="w-full justify-center gap-2 bg-white/[0.05] text-white/80 hover:bg-white/[0.12] sm:w-auto"
						>
							Battle View
							<ArrowUpRight className="size-4" />
						</Button>
					</div>
					<div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-xs text-white/60 sm:flex-none sm:gap-3">
						<div className="flex min-w-[160px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
							<span className={`size-2 rounded-full ${apiStatusDisplay.color}`} />
							<span>{apiStatusDisplay.text}</span>
						</div>
						<div
							className="flex min-w-[160px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"
							title={llmStatus.data?.reason ?? undefined}
						>
							<span className={`size-2 rounded-full ${llmStatusDisplay.color}`} />
							<span>{llmStatusDisplay.text}</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="w-full justify-center gap-2 bg-white text-[#0f1016] hover:bg-white/90 sm:w-auto"
						>
							<UserRound className="size-4" />
							Login
						</Button>
					</div>
				</header>

				<main className="flex flex-1 justify-center px-3 pb-16 pt-8 sm:px-6 sm:pt-16">
					<div className="flex w-full max-w-3xl flex-col items-center gap-10 text-center sm:gap-12">
						<div className="flex flex-col items-center gap-3 sm:gap-4">
							<div className="flex items-center gap-3 text-white/70">
								<Bot className="size-5" />
								<Sparkles className="size-4" />
								<CodeXml className="size-4" />
								<Globe className="size-4" />
							</div>
							<div>
								<h1 className="text-balance text-4xl font-semibold sm:text-5xl">
									Neural Net Neutrality Arena
								</h1>
								<p className="mt-2 text-pretty text-sm text-white/65 sm:text-base">
									Run side-by-side prompts across multiple LLMs and watch
									neutrality metrics update the moment they answer.
								</p>
							</div>
						</div>

						<section className="w-full rounded-[32px] border border-white/10 bg-black/40 p-3 shadow-[0_0_60px_rgba(82,158,255,0.16)] sm:p-6">
							<form
								onSubmit={handleSubmit}
								className="rounded-2xl bg-white/[0.02] p-3 text-left text-white/90 sm:p-4"
							>
								<div className="flex flex-col gap-3 border-b border-white/[0.08] pb-4 sm:pb-5">
									<label className="text-xs uppercase tracking-wide text-white/40">
										Models
									</label>
									<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
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

									<div className="mt-4 flex flex-col gap-3 sm:mt-5">
										<label className="text-xs uppercase tracking-wide text-white/40">
											Prompt
										</label>
										<div className="rounded-2xl border border-white/6 bg-black/60 p-3 shadow-[0_18px_45px_rgba(15,16,22,0.45)] sm:p-4">
											<textarea
												rows={4}
												value={prompt}
												onChange={(event) => setPrompt(event.target.value)}
												placeholder="Pose a controversial question or flip a scenario…"
												className="w-full min-h-[150px] resize-none rounded-xl border border-transparent bg-black/30 px-3 py-3 text-sm outline-none placeholder:text-white/30 focus:border-primary/40 focus:bg-black/40 sm:min-h-[190px] sm:rounded-2xl sm:px-4 sm:py-4 sm:text-base"
											/>
										</div>
									</div>

									<div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
										<div className="flex flex-wrap gap-2 text-white/60 sm:items-center">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="size-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12] sm:size-10"
												onClick={() => setPrompt("")}
											>
												<Plus className="size-5 rotate-45" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="size-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12] sm:size-10"
											>
												<Globe className="size-5" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="size-9 rounded-full bg-white/[0.08] hover:bg-white/[0.12] sm:size-10"
											>
												<CodeXml className="size-5" />
											</Button>
										</div>
										<Button
											type="submit"
											disabled={isSendDisabled}
											className="h-11 w-full rounded-full bg-white text-[#0f1016] transition hover:bg-white/90 disabled:opacity-40 sm:h-12 sm:w-auto"
										>
											{isSending ? "Streaming…" : "Send prompt"}
											<Send className="ml-2 size-4" />
										</Button>
									</div>

									{!llmStatus.isLoading && !llmReady && (
										<p className="mt-2 text-xs text-rose-300">
											{llmStatus.data?.reason ??
												"LLM service is unavailable. Configure Replicate to run prompts."}
										</p>
									)}

									<div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
										{SUGGESTION_BUBBLES.map((suggestion, index) => (
											<button
												type="button"
												key={suggestion}
												onClick={() => setPrompt(suggestion)}
												className={`rounded-full px-3 py-2 text-xs font-medium text-black transition hover:opacity-90 sm:px-4 ${
													suggestionColors[index % suggestionColors.length]
												}`}
											>
												{suggestion}
											</button>
										))}
									</div>
								</form>

								{showResponses && (
									<div className="mt-6 space-y-4 text-left">
										{isSending && (
											<p className="text-xs text-white/60">
												Streaming neutrality checks as each model finishes…
											</p>
										)}
										<div className="flex w-full snap-x gap-4 overflow-x-auto pb-4">
											{orderedModelIds.map((modelId) => {
												const meta = MODEL_LOOKUP[modelId];
												const response = responses[modelId];
												const resolved: ResponseState =
													response ?? {
														modelId,
														modelName: meta?.name ?? modelId,
														provider: meta?.provider ?? "",
														output: "",
														status: isSending ? "loading" : "idle",
													};
												const status = resolved.status;
												const isLoading = status === "loading";
												const isError = status === "error";
												const isSuccess = status === "success";
												const statusBadge =
													status === "success"
														? {
																text: "Complete",
																className: "bg-emerald-400/10 text-emerald-300",
															}
														: status === "error"
															? {
																	text: "Error",
																	className: "bg-rose-500/10 text-rose-300",
																}
															: status === "loading"
																? {
																		text: "Streaming…",
																		className: "bg-white/12 text-white/80",
																	}
																: {
																		text: "Queued",
																		className: "bg-white/12 text-white/60",
																	};

												return (
													<article
														key={modelId}
														className="flex w-[260px] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_20px_45px_rgba(10,10,18,0.45)] sm:w-[320px] lg:w-[340px]"
													>
														<div className="flex items-start justify-between gap-3">
															<div className="text-left">
																<p className="text-sm font-semibold text-white">
																	{resolved.modelName}
																</p>
																<p className="text-xs uppercase tracking-wide text-white/40">
																	{resolved.provider}
																</p>
															</div>
															<span
																className={cn(
																	"rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
																	statusBadge.className,
																)}
															>
																{statusBadge.text}
															</span>
														</div>

														{isLoading ? (
															<div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/12 bg-white/[0.04] py-10">
																<Loader2 className="size-5 animate-spin text-white/70" />
															</div>
														) : isError ? (
															<p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-3 text-sm text-rose-200">
																{resolved.error ??
																	"This model could not complete the prompt."}
															</p>
														) : (
															<pre className="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-white/85">
																{resolved.output || "This model returned an empty answer."}
															</pre>
														)}

														{isSuccess && resolved.output && (
															<Button
																type="button"
																variant="ghost"
																size="sm"
																className="self-start text-xs text-white/60 hover:bg-white/[0.12]"
																onClick={() => setPrompt(resolved.output)}
															>
																Copy to prompt
																<ArrowUpRight className="ml-1 size-4" />
															</Button>
														)}
													</article>
												);
											})}
										</div>
									</div>
								)}
						</section>
					</div>
				</main>
			</div>
		</div>
	);
}
