"use client";
import { motion } from "framer-motion";

export default function HeroVideo() {
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      <video
        src="/videos/home.mp4"
        autoPlay
        loop
        muted
        playsInline
        controls
        className="w-full max-w-[750px] rounded-lg mt-10"
      >
        Your browser does not support the video tag.
      </video>
    </motion.div>
  );
}
