import { SignInButton, UserButton, useAuth } from "@clerk/react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { env } from "#/lib/env";

export default function HeaderUser() {
	if (!env.providers.clerkConfigured) {
		return (
			<Button asChild variant="outline" size="sm">
				<Link to="/settings">Add Clerk keys</Link>
			</Button>
		);
	}

	return <ConfiguredHeaderUser />;
}

function ConfiguredHeaderUser() {
	const { isLoaded, userId } = useAuth();

	if (!isLoaded) {
		return (
			<Button variant="outline" size="sm" disabled>
				Auth loading
			</Button>
		);
	}

	if (userId) {
		return <UserButton />;
	}

	return (
		<SignInButton mode="modal">
			<Button size="sm">Sign in</Button>
		</SignInButton>
	);
}
