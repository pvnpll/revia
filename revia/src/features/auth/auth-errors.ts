export function formatAuthError(message: string, mode: "login" | "signup" = "login"): string {
  const lower = message.toLowerCase();

  if (lower.includes("email rate limit") || lower.includes("over_email_send_rate_limit")) {
    if (mode === "signup") {
      return "Too many confirmation emails were sent. Wait about an hour, or sign in if you already created an account. An admin can also confirm your email in Supabase.";
    }
    return "Too many emails were sent. Please wait about an hour before trying again.";
  }

  if (lower.includes("security purposes")) {
    return "Please wait about a minute before trying again.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirm your email first—the link should be in your inbox. If it expired, wait an hour and sign up again or ask for a manual confirm.";
  }

  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  return message;
}

export function isExistingUserSignup(signUpData: {
  user: { identities?: unknown[] } | null;
  session: unknown;
}): boolean {
  if (signUpData.session) return false;
  const identities = signUpData.user?.identities;
  return Array.isArray(identities) && identities.length === 0;
}
