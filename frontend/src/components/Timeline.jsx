import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import MemoryCard from "./MemoryCard.jsx";
import { groupByYear } from "../utils/format.js";

function YearMarker({ year }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mb-10 flex justify-start pl-11 md:justify-center md:pl-0 sm:pl-14"
    >
      <span className="glass rounded-full px-6 py-2 font-display text-lg tracking-[0.2em] text-romance-600 shadow-md shadow-romance-200/60">
        {year}
      </span>
    </motion.div>
  );
}

export default function Timeline({ memories, onOpen }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  const groups = groupByYear(memories);
  let index = -1;

  return (
    <section id="timeline" className="relative px-4 pb-28 sm:px-8">
      <div ref={containerRef} className="relative mx-auto max-w-5xl">
        {/* trilho da linha do tempo */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-4 w-px bg-romance-200/70 md:left-1/2 md:-translate-x-1/2"
        />
        <motion.div
          aria-hidden="true"
          style={{ scaleY: progress }}
          className="absolute top-0 bottom-0 left-4 w-[3px] origin-top rounded-full bg-linear-to-b from-romance-300 via-romance-500 to-gold md:left-1/2 md:-translate-x-1/2"
        />

        {groups.map((group) => (
          <div key={group.year} className="pt-6 pb-2">
            <YearMarker year={group.year} />

            <div className="space-y-12 sm:space-y-14 md:space-y-20">
              {group.items.map((memory) => {
                index += 1;
                const isLeft = index % 2 === 0;

                return (
                  <div key={memory.id} className="relative pl-11 sm:pl-14 md:pl-0">
                    {/* coração no trilho */}
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.5, ease: "backOut" }}
                      className="absolute top-10 left-4 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-cream text-sm shadow-md shadow-romance-300/70 ring-2 ring-romance-300 md:left-1/2"
                    >
                      <span className="animate-heartbeat">💗</span>
                    </motion.span>

                    <div
                      className={
                        isLeft
                          ? "md:w-[calc(50%-2.5rem)]"
                          : "md:ml-auto md:w-[calc(50%-2.5rem)]"
                      }
                    >
                      <MemoryCard
                        memory={memory}
                        side={isLeft ? "left" : "right"}
                        onOpen={onOpen}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* fim da linha */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative mt-16 flex justify-start pl-11 md:justify-center md:pl-0 sm:pl-14"
        >
          <span className="font-hand text-2xl text-romance-400">
            ...e a história continua
          </span>
        </motion.div>
      </div>
    </section>
  );
}
