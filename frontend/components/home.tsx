/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Button } from "./ui/button";
import { images } from "@/assets/images/images";
import ModeToggle from "./mode-toggle";
import HeroVideo from "./HeroVideo";

export default function Home() {
  return (
    <main className=" w-full mx-auto max-w-7xl  px-3">
      <nav className="flex justify-between items-center py-4">
        <Button variant="ghost" size={"icon"} asChild>
          <Link href="/">
            <img src={images.logo.src} alt="Logo" width={32} height={32} />
          </Link>
        </Button>
        <div className="flex items-center space-x-4">
          <Button variant="default" size={"sm"} asChild className="text-white">
            <Link href="/login">Dashboard</Link>
          </Button>
          <ModeToggle />
        </div>
      </nav>
      <section className=" my-14 lg:mt-26 text-center flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl lg:text-6xl max-w-[20ch]">
          AI-Powered Attendance for Smarter Places.
        </h1>
        <p className="max-w-[50ch] my-10">
          Connect AI to your smart devices to track attendance, identify staff,
          and monitor performance.
        </p>
        <Button
          asChild
          size={"sm"}
          className="bg-secondary text-foreground border cursor-pointer"
        >
          <Link href="/onboarding">Get Started</Link>
        </Button>

        <HeroVideo />
      </section>
    </main>
  );
}
