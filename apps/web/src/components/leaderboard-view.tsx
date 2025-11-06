import { Bot, TrendingUp, Award, BarChart3, Target } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type ModelStats = {
	modelId: string;
	modelName: string;
	provider: string;
	overallScore: number;
	symmetry: number;
	ethicalAlignment: number;
	ideologicalBalance: number;
	empathicAwareness: number;
	responseWillingness: number;
	totalTests: number;
	rank: number;
};

type LeaderboardViewProps = {
	stats?: ModelStats[];
};

const TRAIT_KEYS = [
	"symmetry",
	"ethicalAlignment",
	"ideologicalBalance",
	"empathicAwareness",
	"responseWillingness",
] as const;

const TRAIT_LABELS = {
	symmetry: "Symmetry",
	ethicalAlignment: "Ethical Alignment",
	ideologicalBalance: "Ideological Balance",
	empathicAwareness: "Empathic Awareness",
	responseWillingness: "Response Willingness",
};

export function LeaderboardView({ stats = [] }: LeaderboardViewProps) {
	const hasStats = stats.length > 0;

	return (
		<div className="h-full overflow-y-auto">
			{!hasStats ? (
				<EmptyLeaderboardState />
			) : (
				<div className="space-y-6 p-6">
					{/* Top 3 Podium */}
					<div className="grid gap-4 md:grid-cols-3">
						{stats.slice(0, 3).map((model, idx) => (
							<PodiumCard key={model.modelId} model={model} position={idx + 1} />
						))}
					</div>

					{/* Detailed Comparison */}
					<div className="space-y-4">
						<h2 className="text-xl font-bold text-white">Model Comparisons</h2>
						{stats.map((model) => (
							<ModelComparisonCard key={model.modelId} model={model} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function EmptyLeaderboardState() {
	return (
		<div className="flex h-full flex-col items-center justify-center p-8 text-center">
			<div className="mb-6 rounded-full bg-white/[0.04] p-8">
				<Award className="size-16 text-white/30" />
			</div>
			<h3 className="mb-2 text-2xl font-bold text-white">Leaderboard Coming Soon</h3>
			<p className="mb-8 max-w-md text-sm text-white/60">
				The model leaderboard will show neutrality scores, rankings, and detailed comparisons
				across all tested AI models. Start testing to contribute to the rankings!
			</p>

			{/* Preview Cards */}
			<div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
				<PreviewCard
					icon={<Target className="size-6" />}
					title="Neutrality Scores"
					description="Compare models across 5 key neutrality dimensions"
				/>
				<PreviewCard
					icon={<BarChart3 className="size-6" />}
					title="Radar Comparisons"
					description="Visual radar charts showing model strengths"
				/>
				<PreviewCard
					icon={<TrendingUp className="size-6" />}
					title="Rankings"
					description="See which models perform best overall"
				/>
			</div>
		</div>
	);
}

function PreviewCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur">
			<div className="mb-3 text-white/60">{icon}</div>
			<h4 className="mb-2 font-semibold text-white">{title}</h4>
			<p className="text-sm text-white/50">{description}</p>
		</div>
	);
}

function PodiumCard({ model, position }: { model: ModelStats; position: number }) {
	const colors = [
		{ bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400" },
		{ bg: "bg-slate-400/20", border: "border-slate-400/40", text: "text-slate-300" },
		{ bg: "bg-orange-600/20", border: "border-orange-600/40", text: "text-orange-400" },
	];
	const { bg, border, text } = colors[position - 1];

	return (
		<div
			className={cn(
				"relative rounded-xl border p-6 backdrop-blur",
				bg,
				border,
				position === 1 && "md:scale-105"
			)}
		>
			<div className="mb-4 flex items-center justify-between">
				<span className={cn("text-3xl font-bold", text)}>#{position}</span>
				{position === 1 && <Award className={cn("size-6", text)} />}
			</div>
			<h3 className="mb-1 text-lg font-bold text-white">{model.modelName}</h3>
			<p className="mb-4 text-sm text-white/60">{model.provider}</p>
			<div className="flex items-center justify-between">
				<span className="text-xs text-white/50">Overall Score</span>
				<span className={cn("text-2xl font-bold", text)}>{model.overallScore}</span>
			</div>
		</div>
	);
}

function ModelComparisonCard({ model }: { model: ModelStats }) {
	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur">
			<div className="grid gap-6 md:grid-cols-2">
				{/* Left: Model Info & Radar */}
				<div>
					<div className="mb-4">
						<div className="flex items-center gap-3">
							<div className="flex size-10 items-center justify-center rounded-lg bg-white/[0.08]">
								<Bot className="size-5 text-white/60" />
							</div>
							<div>
								<h3 className="font-bold text-white">{model.modelName}</h3>
								<p className="text-sm text-white/50">{model.provider}</p>
							</div>
						</div>
					</div>
					<MiniRadarChart model={model} />
				</div>

				{/* Right: Stats Breakdown */}
				<div className="space-y-3">
					<div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-3">
						<span className="text-sm text-white/70">Overall Score</span>
						<span className="text-lg font-bold text-emerald-400">{model.overallScore}</span>
					</div>
					<div className="space-y-2">
						{TRAIT_KEYS.map((key) => {
							const value = model[key];
							return (
								<div key={key}>
									<div className="mb-1 flex items-center justify-between text-xs">
										<span className="text-white/60">{TRAIT_LABELS[key]}</span>
										<span className="font-medium text-white">{value}</span>
									</div>
									<div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
										<div
											className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
											style={{ width: `${value}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
					<div className="mt-4 flex items-center justify-between rounded-lg bg-white/[0.04] p-3 text-xs">
						<span className="text-white/50">Total Tests</span>
						<span className="font-medium text-white">{model.totalTests.toLocaleString()}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function MiniRadarChart({ model }: { model: ModelStats }) {
	const chartSize = 200;
	const center = chartSize / 2;
	const radius = center - 30;
	const gridLevels = [0.33, 0.66, 1];

	const getPoint = (index: number, customRadius: number) => {
		const angle = (Math.PI * 2 * index) / TRAIT_KEYS.length - Math.PI / 2;
		return {
			x: center + Math.cos(angle) * customRadius,
			y: center + Math.sin(angle) * customRadius,
		};
	};

	const values = TRAIT_KEYS.map((key) => model[key]);
	const polygonPoints = values
		.map((score, index) => {
			const { x, y } = getPoint(index, radius * (score / 100));
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<div>
			<svg
				width={chartSize}
				height={chartSize}
				viewBox={`0 0 ${chartSize} ${chartSize}`}
				className="mx-auto"
			>
				{/* Grid */}
				{gridLevels.map((level) => (
					<polygon
						key={`grid-${level}`}
						points={TRAIT_KEYS.map((_, index) => {
							const { x, y } = getPoint(index, radius * level);
							return `${x},${y}`;
						}).join(" ")}
						fill="none"
						stroke="rgba(255,255,255,0.1)"
						strokeWidth={1}
					/>
				))}

				{/* Axes */}
				{TRAIT_KEYS.map((_, index) => {
					const { x, y } = getPoint(index, radius);
					return (
						<line
							key={`axis-${index}`}
							x1={center}
							y1={center}
							x2={x}
							y2={y}
							stroke="rgba(255,255,255,0.1)"
							strokeWidth={1}
						/>
					);
				})}

				{/* Data polygon */}
				<polygon
					points={polygonPoints}
					fill="rgba(59,130,246,0.3)"
					stroke="rgba(59,130,246,0.8)"
					strokeWidth={2}
				/>

				{/* Data points */}
				{values.map((score, index) => {
					const { x, y } = getPoint(index, radius * (score / 100));
					return (
						<circle
							key={`point-${index}`}
							cx={x}
							cy={y}
							r={3}
							fill="rgba(59,130,246,1)"
						/>
					);
				})}
			</svg>
		</div>
	);
}
