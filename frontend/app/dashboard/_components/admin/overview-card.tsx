"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

const colors = [
  "bg-[#FFA725]",
  "bg-[#FFEDFA]",
  "bg-[#F37199]",
  "bg-[#A3D1C6]",
  "bg-[#F4CCE9]",
  "bg-[#B2A5FF]",
  "bg-[#B4EBE6]",
  "bg-[#808D7C]",
  "bg-[#135D66]",
];

const AdminOverviewCard = ({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) => {
  // Randomly select a background color only once per render
  const randomBG = useMemo(
    () => colors[Math.floor(Math.random() * colors.length)],
    []
  );

  return (
    <motion.div
      className={cn(randomBG, "shadow-sm p-6 rounded-lg border")}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-lg font-semibold text-black/50">{title}</h3>
      <p className="text-2xl font-bold mt-2 text-black flex items-center">
        <span className="mr-4">{icon}</span> {count}
      </p>
    </motion.div>
  );
};

export default AdminOverviewCard;
