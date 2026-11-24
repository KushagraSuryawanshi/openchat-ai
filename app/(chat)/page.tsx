import { WelcomeScene as WelcomeIllustration } from "@/components/chat/welcome-scene";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <WelcomeIllustration />
      <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">What are we cooking today?</h1>
    </div>
  );
}
