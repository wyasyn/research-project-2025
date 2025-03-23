"use client";
import Image from "next/image";
import tropicalLight from "@/assets/images/trpical-light.jpg";
import tropicalDark from "@/assets/images/tropical-darj.jpg";
import { useTheme } from "next-themes";

export default function OnboardingBg() {
  const { theme } = useTheme();

  return (
    <div className=" w-[350px] border hidden lg:block relative">
      {theme === "dark" ? (
        <Image
          src={tropicalDark.src}
          alt="onboarding bg"
          priority
          fill
          className="w-full h-full object-cover inset-0"
        />
      ) : (
        <Image
          src={tropicalLight.src}
          alt="onboarding bg"
          priority
          fill
          className="w-full h-full object-cover inset-0"
        />
      )}
    </div>
  );
}
