import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { DataModel } from "./_generated/dataModel";
import { ResendOTPPasswordReset } from "./resend";

const PasswordProvider = Password<DataModel>({
  profile(params) {
    const email = String(params.email ?? "")
      .trim()
      .toLowerCase();
    const name = String(params.name ?? "").trim();

    if (!email) {
      throw new Error("Ingresa un correo electrónico válido.");
    }

    return {
      email,
      name: name || undefined,
    };
  },
  reset: ResendOTPPasswordReset,
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [PasswordProvider],
  session: {
    totalDurationMs: 30 * 24 * 60 * 60 * 1000,
    inactiveDurationMs: 30 * 24 * 60 * 60 * 1000,
  },
  jwt: {
    durationMs: 60 * 60 * 1000,
  },
});
