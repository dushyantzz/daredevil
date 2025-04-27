import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import HomeLink from "@/components/home-link";
import { HeaderNav } from "@/components/header-nav";
import { GeminiFooter } from "@/components/gemini-footer";
import "./globals.css";
import "nprogress/nprogress.css";
import { NavigationEvents } from "@/components/navigation-events";
import NProgress from "nprogress";

// Configure NProgress to complete instantly
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 1,
  minimum: 0.99,
  easing: 'ease',
  speed: 1
});

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Daredevil",
	description: "AI-Powered Security Surveillance System",
};

const poppins = Poppins({
	weight: ['400', '500', '600', '700'],
	display: "swap",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={poppins.className} suppressHydrationWarning>
			<body className="bg-background text-foreground" suppressHydrationWarning>
				<NavigationEvents />
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<main className="min-h-screen flex flex-col items-center">
						<div className="flex-1 w-full flex flex-col items-center">
							<nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-black">
								<div className="w-full max-w-6xl flex justify-between items-center p-3 px-5">
									<div className="flex items-center gap-8">
										<HomeLink />
										<HeaderNav />
									</div>
									<HeaderAuth />
								</div>
							</nav>
							<div className="w-full">
								{children}
							</div>
							<footer className="w-full border-t border-t-foreground/10 p-6 flex justify-center bg-black text-white">
								<div className="w-full max-w-6xl flex justify-between items-center px-5">
									<div className="text-sm">© 2025 Daredevil. All rights reserved.</div>
									<div className="text-sm text-gray-400">AI-Powered Security Surveillance System</div>
								</div>
							</footer>
						</div>
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
