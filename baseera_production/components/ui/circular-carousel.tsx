"use client";

import { useCallback, useEffect, useRef, useState, ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Bot,
  LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  icon?: ComponentType<LucideProps>;
  badgeColorClass?: string;
}

export interface CircularCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const VISIBLE_COUNT = 5;
const RADIUS_X = 230;
const RADIUS_Y = 100;

function getItemPosition(index: number, activeIndex: number, total: number) {
  const offset = index - activeIndex;
  const half = Math.floor(VISIBLE_COUNT / 2);
  let adjustedOffset = offset;
  if (offset > half) adjustedOffset = offset - total;
  if (offset < -half) adjustedOffset = offset + total;
  if (Math.abs(adjustedOffset) > half * 2) return null;

  const angle = (adjustedOffset / VISIBLE_COUNT) * Math.PI;
  const x = Math.sin(angle) * RADIUS_X;
  const y = -Math.cos(angle) * RADIUS_Y;
  const distance = Math.abs(adjustedOffset);
  const maxDistance = half + 1;
  const scale = Math.max(0, 1 - (distance / maxDistance) * 0.3);
  const opacity = Math.max(0.4, 1 - (distance / maxDistance) * 0.6);
  const zIndex = VISIBLE_COUNT - distance;

  return { x, y, scale, opacity, zIndex, adjustedOffset };
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = true,
  autoPlayInterval = 4000,
  className,
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = controlledIndex ?? internalIndex;
  const total = items.length;

  const goTo = useCallback(
    (index: number) => {
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex);
      }
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isHovered || isFocused) return;
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  const activeItem = items[activeIndex];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Circular carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "relative flex flex-col items-center justify-center gap-8 outline-none bg-transparent w-full",
        className,
      )}
    >
      {/* Circular track */}
      <div className="relative h-[290px] w-full max-w-lg select-none">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => {
            const pos = getItemPosition(i, activeIndex, total);
            if (!pos) return null;
            const isActive = i === activeIndex;
            const IconComponent = item.icon || Bot;

            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  zIndex: pos.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => goTo(i)}
                aria-label={item.title}
                aria-selected={isActive}
                role="option"
                className={cn(
                  "absolute left-1/2 top-1/2 flex h-40 w-60 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col justify-between rounded-2xl p-4 backdrop-blur-md transition-all duration-300 overflow-hidden text-start",
                  isActive
                    ? "bg-white/95 dark:bg-slate-800/95 border-2 border-indigo-500 shadow-xl shadow-indigo-500/25"
                    : "bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md hover:bg-white/95 dark:hover:bg-slate-800",
                )}
                style={{ transformOrigin: "center center" }}
              >
                {/* Header row with 56px rounded-2xl icon badge & title */}
                <div className="flex items-center gap-3.5 w-full">
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-slate-200/60 dark:border-slate-700/60",
                      item.badgeColorClass || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    )}
                  >
                    <IconComponent className="h-7 w-7 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col text-start min-w-0 flex-1">
                    {item.tag && (
                      <span
                        className={cn(
                          "text-[10px] font-extrabold uppercase tracking-wider truncate mb-0.5",
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-500 dark:text-slate-400",
                        )}
                      >
                        {item.tag}
                      </span>
                    )}
                    <h3
                      className={cn(
                        "font-black leading-tight transition-colors duration-300 truncate",
                        isActive
                          ? "text-slate-900 dark:text-white text-sm sm:text-base"
                          : "text-slate-800 dark:text-slate-100 text-xs sm:text-sm",
                      )}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p
                  className={cn(
                    "mt-2.5 line-clamp-2 text-xs leading-relaxed transition-colors duration-300 text-start w-full",
                    isActive
                      ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {item.description}
                </p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Center content counter */}
      <motion.div
        key={activeItem?.id || activeIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0"
      >
        <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="mt-1 text-xs font-bold text-slate-400 dark:text-slate-500">
          of {String(total).padStart(2, "0")}
        </span>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4 z-20">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={prev}
          aria-label="Previous item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-md transition-all hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 cursor-pointer"
        >
          <ChevronLeft className="size-5" />
        </motion.button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                i === activeIndex
                  ? "w-6 bg-indigo-600 dark:bg-indigo-400 shadow-sm"
                  : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500",
              )}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={next}
          aria-label="Next item"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-md transition-all hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 cursor-pointer"
        >
          <ChevronRight className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}

export default CircularCarousel;
