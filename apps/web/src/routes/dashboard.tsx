import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		return { session };
	},
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	const privateData = useQuery(trpc.privateData.queryOptions());

	return (
		<section className="px-4 py-6 sm:px-6">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
				<div>
					<p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						Welcome back
					</p>
					<h2 className="text-2xl font-semibold">
						{session.data?.user.name ?? "Neural Net Neutrality"}
					</h2>
				</div>
				<div className="rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur supports-[backdrop-filter]:bg-card/40">
					<p className="text-sm text-muted-foreground">API status</p>
					<p className="text-lg font-medium">
						{privateData.data?.message ?? "Loading private data..."}
					</p>
				</div>
			</div>
		</section>
	);
}
