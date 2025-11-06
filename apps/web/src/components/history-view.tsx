import { MessageCircle, Search, Trash2, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type HistoryItem = {
	id: string;
	title: string;
	timestamp: Date;
	modelCount: number;
};

type HistoryViewProps = {
	history?: HistoryItem[];
	onSelectHistory?: (id: string) => void;
	onDeleteHistory?: (id: string) => void;
};

export function HistoryView({ history = [], onSelectHistory, onDeleteHistory }: HistoryViewProps) {
	const hasHistory = history.length > 0;

	// Group history by time periods
	const groupedHistory = hasHistory ? groupByTime(history) : null;

	return (
		<div className="flex h-full flex-col">
			{/* Search Bar */}
			<div className="border-b border-white/10 p-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
					<input
						type="text"
						placeholder="Search history..."
						className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
					/>
				</div>
			</div>

			{/* History List */}
			<div className="flex-1 overflow-y-auto">
				{!hasHistory ? (
					<EmptyHistoryState />
				) : (
					<div className="space-y-6 p-4">
						{Object.entries(groupedHistory!).map(([period, items]) => (
							<div key={period}>
								<h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/40">
									{period}
								</h3>
								<div className="space-y-1">
									{items.map((item) => (
										<HistoryItem
											key={item.id}
											item={item}
											onSelect={() => onSelectHistory?.(item.id)}
											onDelete={() => onDeleteHistory?.(item.id)}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function EmptyHistoryState() {
	return (
		<div className="flex h-full flex-col items-center justify-center p-8 text-center">
			<div className="mb-4 rounded-full bg-white/[0.04] p-6">
				<MessageCircle className="size-12 text-white/30" />
			</div>
			<h3 className="mb-2 text-lg font-semibold text-white">No history yet</h3>
			<p className="mb-6 max-w-sm text-sm text-white/60">
				Your neutrality tests will appear here. Start by running a test in the playground.
			</p>
			<Button
				variant="ghost"
				size="sm"
				className="border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
			>
				<MessageCircle className="mr-2 size-4" />
				Run Your First Test
			</Button>
		</div>
	);
}

function HistoryItem({
	item,
	onSelect,
	onDelete,
}: {
	item: HistoryItem;
	onSelect: () => void;
	onDelete: () => void;
}) {
	const timeAgo = formatTimeAgo(item.timestamp);

	return (
		<div
			onClick={onSelect}
			className="group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-white/[0.08]"
		>
			<div className="flex min-w-0 flex-1 items-start gap-3">
				<MessageCircle className="mt-0.5 size-4 flex-shrink-0 text-white/40" />
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-white">{item.title}</p>
					<div className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
						<Clock className="size-3" />
						<span>{timeAgo}</span>
						<span>·</span>
						<span>{item.modelCount} {item.modelCount === 1 ? 'model' : 'models'}</span>
					</div>
				</div>
			</div>
			<Button
				variant="ghost"
				size="icon"
				className="size-8 flex-shrink-0 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
			>
				<Trash2 className="size-4" />
			</Button>
		</div>
	);
}

function groupByTime(history: HistoryItem[]): Record<string, HistoryItem[]> {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const lastWeek = new Date(today);
	lastWeek.setDate(lastWeek.getDate() - 7);
	const lastMonth = new Date(today);
	lastMonth.setMonth(lastMonth.getMonth() - 1);

	const groups: Record<string, HistoryItem[]> = {
		Today: [],
		Yesterday: [],
		"Previous 7 Days": [],
		"Previous 30 Days": [],
		Older: [],
	};

	for (const item of history) {
		const timestamp = new Date(item.timestamp);
		if (timestamp >= today) {
			groups.Today.push(item);
		} else if (timestamp >= yesterday) {
			groups.Yesterday.push(item);
		} else if (timestamp >= lastWeek) {
			groups["Previous 7 Days"].push(item);
		} else if (timestamp >= lastMonth) {
			groups["Previous 30 Days"].push(item);
		} else {
			groups.Older.push(item);
		}
	}

	// Remove empty groups
	return Object.fromEntries(
		Object.entries(groups).filter(([_, items]) => items.length > 0)
	);
}

function formatTimeAgo(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString();
}
