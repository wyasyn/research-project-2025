import ModeToggle from "@/components/mode-toggle";
import OnboardingBg from "@/components/onboarding-bg";
import OnboardingFlow from "@/components/onboarding-flow";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-3xl flex gap-4 overflow-clip rounded-xl bg-secondary">
        <div className="fixed top-4 right-4">
          <ModeToggle />
        </div>
        <OnboardingBg />
        <OnboardingFlow />
      </div>
    </main>
  );
}
