import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(250,250,250,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,250,250,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Orange glow behind the card */}
      <div
        className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        style={{
          width: "600px",
          height: "400px",
          background:
            "radial-gradient(ellipse at center, rgba(255,107,43,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/">
            <Logo size="lg" className="mb-5" />
          </Link>
          <h1 className="text-2xl font-bold text-fg tracking-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-fg-secondary">
            Start building AI agents in minutes
          </p>
        </div>

        {/* Clerk SignUp */}
        <div className="clerk-auth-card">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
                card: "bg-transparent shadow-none p-0 gap-4",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-bg-secondary border-border text-fg hover:bg-bg-tertiary transition-colors rounded-lg h-11 font-medium",
                socialButtonsBlockButtonText: "text-sm text-fg",
                dividerLine: "bg-border",
                dividerText: "text-fg-tertiary text-xs",
                formFieldLabel: "text-sm font-medium text-fg-secondary",
                formFieldInput:
                  "bg-bg-secondary border-border text-fg rounded-lg h-11 focus:border-[#ff6b2b] focus:ring-1 focus:ring-[#ff6b2b]/30 placeholder:text-fg-tertiary",
                formButtonPrimary:
                  "bg-gradient-to-r from-[#ff6b2b] to-[#ff8c42] hover:from-[#e85d26] hover:to-[#ff6b2b] text-white rounded-lg h-11 font-medium shadow-lg shadow-[#ff6b2b]/20 transition-all",
                footerAction: "hidden",
                identityPreview:
                  "bg-bg-secondary border-border rounded-lg",
                identityPreviewText: "text-fg-secondary text-sm",
                identityPreviewEditButton: "text-[#ff8c42] hover:text-[#ff6b2b]",
                formFieldAction: "text-[#ff8c42] hover:text-[#ff6b2b] text-sm",
                otpCodeFieldInput:
                  "bg-bg-secondary border-border text-fg rounded-lg focus:border-[#ff6b2b]",
                alert: "bg-destructive/10 border-destructive/20 text-destructive rounded-lg",
                alertText: "text-sm",
              },
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "blockButton",
              },
            }}
          />
        </div>

        {/* Footer link */}
        <p className="mt-8 text-center text-sm text-fg-tertiary">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-[#ff8c42] hover:text-[#ff6b2b] font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
