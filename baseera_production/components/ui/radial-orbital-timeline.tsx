"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap, Database, Cpu, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AgentTimelineItem {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  color: string; // Indigo, Blue, Lavender theme colors
  inputData: string;
  actionDetails: string;
  outputData: string;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: AgentTimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const isCurrentlyOpen = prev[id];
      const newState: Record<number, boolean> = {};

      if (!isCurrentlyOpen) {
        newState[id] = true;
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => (prev + 0.3) % 360);
      }, 50);
    }

    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    if (nodeIndex === -1) return;
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 210;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.5, Math.min(1, 0.5 + 0.5 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden select-none"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          {/* Central Glowing Orb (Blue - Lavender - Indigo Theme) */}
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 animate-pulse flex items-center justify-center z-10 shadow-[0_0_50px_rgba(99,102,241,0.6)]">
            <div className="absolute w-24 h-24 rounded-full border border-indigo-300/30 animate-ping opacity-60"></div>
            <div
              className="absolute w-32 h-32 rounded-full border border-purple-400/20 animate-ping opacity-40"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md"></div>
          </div>

          {/* Orbit Guide Circle Line */}
          <div className="absolute w-[420px] h-[420px] rounded-full border border-white/10"></div>

          {/* Orbital Agent Nodes */}
          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute transition-all duration-700 cursor-pointer flex flex-col items-center justify-center"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Glow ring */}
                <div
                  className={`absolute rounded-full -inset-1 ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, ${item.color}80 0%, transparent 70%)`,
                    width: `${item.energy * 0.4 + 44}px`,
                    height: `${item.energy * 0.4 + 44}px`,
                    left: `-${(item.energy * 0.4 + 44 - 40) / 2}px`,
                    top: `-${(item.energy * 0.4 + 44 - 40) / 2}px`,
                  }}
                ></div>

                {/* Node Button Circle */}
                <div
                  className={`
                    w-11 h-11 rounded-full flex items-center justify-center
                    transition-all duration-300 transform
                    ${
                      isExpanded
                        ? "bg-white text-black scale-150 border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                        : isRelated
                        ? "bg-indigo-500/80 text-white border-2 border-indigo-300 scale-125 animate-pulse"
                        : "bg-black/90 text-white border-2 border-white/40 hover:border-indigo-400 hover:scale-110"
                    }
                  `}
                >
                  <Icon size={18} />
                </div>

                {/* Title Below Node */}
                <div
                  className={`
                    absolute top-13 whitespace-nowrap text-center
                    text-xs font-semibold tracking-wider transition-all duration-300
                    ${isExpanded ? "text-white scale-125 font-bold" : "text-white/70"}
                  `}
                >
                  {item.title}
                </div>

                {/* Expanded Information Card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-black/90 backdrop-blur-xl border border-indigo-500/40 shadow-[0_10px_40px_rgba(99,102,241,0.3)] text-white text-right z-50">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-indigo-400/60"></div>
                    <CardHeader className="pb-2 pt-4 px-4 border-b border-white/10">
                      <div className="flex justify-between items-center">
                        <Badge className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none">
                          {item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
                        </Badge>
                        <span className="text-[10px] font-mono text-white/50">{item.date}</span>
                      </div>
                      <CardTitle className="text-sm font-extrabold mt-2 text-white flex items-center gap-2">
                        <Icon size={16} className="text-indigo-400" />
                        {item.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="text-xs text-white/80 px-4 py-3 space-y-3">
                      <p className="text-[11px] leading-relaxed text-slate-300">{item.content}</p>

                      {/* 1. البيانات المدخلة */}
                      <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-300 mb-0.5">
                          <Database size={11} />
                          <span>البيانات المدخلة (Input):</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug">{item.inputData}</p>
                      </div>

                      {/* 2. المهام والعمليات */}
                      <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/20">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-purple-300 mb-0.5">
                          <Cpu size={11} />
                          <span>المهام والعمليات (Actions):</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug">{item.actionDetails}</p>
                      </div>

                      {/* 3. المخرجات والنتائج */}
                      <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/20">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-300 mb-0.5">
                          <FileCheck size={11} />
                          <span>المخرجات والنتائج (Output):</span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug">{item.outputData}</p>
                      </div>

                      {/* Energy Level Bar (Indigo to Purple Gradient) */}
                      <div className="pt-1">
                        <div className="flex justify-between items-center text-[10px] mb-1 text-white/70">
                          <span className="flex items-center gap-1">
                            <Zap size={10} className="text-indigo-400" />
                            Energy Level
                          </span>
                          <span className="font-mono">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Connected Nodes */}
                      {item.relatedIds.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex items-center mb-1.5 text-white/70 text-[10px]">
                            <Link size={10} className="ml-1" />
                            <span>CONNECTED NODES:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              if (!relatedItem) return null;
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="h-5 px-2 text-[10px] border-white/20 bg-transparent hover:bg-indigo-600/30 text-white/80 hover:text-white transition-all rounded-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem.title}
                                  <ArrowRight size={8} className="mr-1 rotate-180" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
