import { FileText } from "lucide-react"
import { Button } from "./ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog"
import "./manifesto-dialog.css"

export function ManifestoDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="gap-2 rounded-full text-xs sm:text-sm"
				>
					<FileText className="h-4 w-4" />
					<span className="hidden sm:inline">Manifesto</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl">
						The Neural Net Neutrality Manifesto
					</DialogTitle>
					<DialogDescription>
						Why we need to measure and understand AI bias
					</DialogDescription>
				</DialogHeader>

				<div className="manifesto-3d-stack mt-4">
					<div className="manifesto-3d-orbit" aria-hidden />
					<div className="manifesto-3d-grid" aria-hidden />
					<div className="manifesto-3d-content space-y-6 text-sm">
						{/* Introduction */}
						<section>
							<p className="leading-relaxed text-foreground">
								Research increasingly shows that many large language models
								(LLMs) lean politically in measurable ways. These models aren't
								neutral by default — they reflect the biases of their training
								data, fine-tuning processes, and the worldviews of their
								creators.
							</p>
						</section>

						{/* The Problem */}
						<section className="space-y-3">
							<h3 className="text-lg font-semibold text-foreground">
								🔬 The Research
							</h3>
							<div className="space-y-4">
								<div className="rounded-lg border border-border/50 bg-muted/30 p-4">
									<h4 className="mb-2 font-medium text-foreground">
										Reward Models Show Left-Leaning Bias
									</h4>
									<p className="text-muted-foreground">
										A study from MIT Center for Constructive Communication found
										that reward models (which rank LLM outputs based on human
										preference) showed a strong left-leaning political bias, and
										that the bias{" "}
										<span className="font-medium text-foreground">
											increased in larger models
										</span>
										.
									</p>
								</div>

								<div className="rounded-lg border border-border/50 bg-muted/30 p-4">
									<h4 className="mb-2 font-medium text-foreground">
										Progressive Alignment Across Models
									</h4>
									<p className="text-muted-foreground">
										A comprehensive survey tested ~24 conversational LLMs on ~11
										different political-orientation tests and found many models'
										answers aligned with{" "}
										<span className="font-medium text-foreground">
											progressive/leftist values
										</span>{" "}
										(in US terms) rather than conservative/traditional values.
									</p>
								</div>

								<div className="rounded-lg border border-border/50 bg-muted/30 p-4">
									<h4 className="mb-2 font-medium text-foreground">
										Models Reflect Their Creators
									</h4>
									<p className="text-muted-foreground">
										Research shows that the ideological stance of an LLM appears
										to reflect the worldview of its creators — through training
										data selection, fine-tuning choices, and feedback mechanisms.
										The model isn't "neutral" by default.
									</p>
								</div>

								<div className="rounded-lg border border-border/50 bg-muted/30 p-4">
									<h4 className="mb-2 font-medium text-foreground">
										The Overton Window Problem
									</h4>
									<p className="text-muted-foreground">
										Recent papers propose mapping an LLM's "Overton window" — the
										range of views it will produce. Even if a model doesn't
										strongly pick one side, it may{" "}
										<span className="font-medium text-foreground">
											refuse or avoid certain views entirely
										</span>
										.
									</p>
								</div>
							</div>
						</section>

						{/* Why It Happens */}
						<section className="space-y-3">
							<h3 className="text-lg font-semibold text-foreground">
								🤔 Why Does This Happen?
							</h3>
							<div className="space-y-3">
								<div className="flex gap-3">
									<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
									<div>
										<h4 className="font-medium text-foreground">
											Training Data Bias
										</h4>
										<p className="text-sm text-muted-foreground">
											If web-scraped data contains more content from certain
											ideological leanings (e.g., liberal-leaning forums, academic
											writing, mainstream Western media), the model mirrors that
											distribution.
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
									<div>
										<h4 className="font-medium text-foreground">
											Human Preference Tuning
										</h4>
										<p className="text-sm text-muted-foreground">
											When models are fine-tuned to satisfy "good human responses,"
											the humans themselves may have ideological biases (even
											unconsciously). The MIT study suggests this is a major
											factor.
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
									<div>
										<h4 className="font-medium text-foreground">
											Scale & Architecture
										</h4>
										<p className="text-sm text-muted-foreground">
											Research suggests larger models show more left-leaning bias.
											The relationship between model size and political orientation
											is an active area of study.
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
									<div>
										<h4 className="font-medium text-foreground">
											Regional & Cultural Origin
										</h4>
										<p className="text-sm text-muted-foreground">
											Models trained or fine-tuned in US/EU contexts might reflect
											more Western liberal-leaning norms than models trained
											elsewhere.
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
									<div>
										<h4 className="font-medium text-foreground">
											Refusal & Moderation Mechanics
										</h4>
										<p className="text-sm text-muted-foreground">
											If a model is trained heavily to avoid "offensive" or "risky"
											stances, it may tilt toward safer (often more liberal)
											phrasing rather than conservative phrasing which might
											trigger more moderation filters.
										</p>
									</div>
								</div>
							</div>
						</section>

						{/* What It Means */}
						<section className="space-y-3">
							<h3 className="text-lg font-semibold text-foreground">
								🎯 What This Means
							</h3>
							<div className="space-y-3">
								<div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
									<p className="text-sm leading-relaxed text-foreground">
										<span className="font-semibold">No Default Neutrality:</span>{" "}
										Even if a model appears balanced, hidden bias may show up
										under structured testing with mirrored prompts and varied
										topics.
									</p>
								</div>

								<div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
									<p className="text-sm leading-relaxed text-foreground">
										<span className="font-semibold">
											Directional vs. Avoidance Bias:
										</span>{" "}
										We need to test for both which way a model leans AND which
										positions it refuses to take altogether.
									</p>
								</div>

								<div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
									<p className="text-sm leading-relaxed text-foreground">
										<span className="font-semibold">
											Model-to-Model Variance:
										</span>{" "}
										Open-source smaller models might have different biases than
										huge commercial ones. Scale and tuning matter.
									</p>
								</div>

								<div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
									<p className="text-sm leading-relaxed text-foreground">
										<span className="font-semibold">Topic-Dependent Bias:</span>{" "}
										Bias shows up more strongly on polarized issues (climate,
										immigration, abortion) than mundane ones. Models show more
										consensus on less-polarized topics.
									</p>
								</div>
							</div>
						</section>

						{/* Our Mission */}
						<section className="space-y-3">
							<h3 className="text-lg font-semibold text-foreground">
								🚀 Our Mission
							</h3>
							<div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
								<p className="text-sm leading-relaxed text-foreground">
									<span className="font-semibold">Neural Net Neutrality</span>{" "}
									exists to make AI bias visible, measurable, and understandable.
									We test models with mirrored prompts on polarizing topics,
									analyze their responses, and show you which models lean which
									way.
								</p>
								<p className="text-sm leading-relaxed text-foreground">
									Knowledge is power. When you understand how models differ, you
									can choose the right tool for your use case — whether you need
									balanced analysis, creative exploration, or just want to know
									what you're working with.
								</p>
								<p className="text-sm font-medium leading-relaxed text-foreground">
									Transparency over ideology. Measurement over assumption.
									Neutrality through awareness.
								</p>
							</div>
						</section>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
