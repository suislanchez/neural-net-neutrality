import { Link } from "@tanstack/react-router";
import { ManifestoDialog } from "./manifesto-dialog";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
	] as const;

	return (
		<header className="sticky top-0 z-50 px-3 py-2 sm:px-6">
			<div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/70 px-3 py-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all supports-[backdrop-filter]:bg-background/40 sm:px-5">
				<nav className="flex flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap text-xs font-medium sm:gap-2 sm:text-sm">
					{links.map(({ to, label }) => {
						return (
							<Link
								key={to}
								to={to}
								className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
								activeProps={{
									className:
										"rounded-full bg-primary/15 px-3 py-1.5 text-primary shadow-[0_4px_20px_rgba(59,130,246,0.25)]",
								}}
							>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ManifestoDialog />
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
		</header>
	);
}
