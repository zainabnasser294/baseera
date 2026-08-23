"use client";

import { CircularCarousel } from "@/components/ui/circular-carousel";
import {
  TrendingUp,
  Truck,
  Tag,
  Heart,
  ShieldCheck,
  Bot,
} from "lucide-react";

const baseeraAgentsItems = [
  {
    id: "1",
    title: "المساعد العام",
    description: "إدارة وتوزيع الجلسة التنسيقية وتجميع التحليلات من كافة الوكلاء.",
    tag: "المنسق العام",
    icon: Bot,
    badgeColorClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  },
  {
    id: "2",
    title: "الوكيل المالي",
    description: "تحليل الإيرادات ومخاطر التدفقات النقدية ونقاط التعادل والتنبؤ بعجز السيولة.",
    tag: "السيولة والأرباح",
    icon: TrendingUp,
    badgeColorClass: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "3",
    title: "وكيل الإمداد",
    description: "تتبع البضاعة الراكدة وحساب توقيت إعادة الطلب الأمثل لتفادي تجميد رأس المال.",
    tag: "المخزون والتوريد",
    icon: Truck,
    badgeColorClass: "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
  },
  {
    id: "4",
    title: "وكيل التسعير",
    description: "مرونة الأسعار، هندسة الحزم (Bundles)، وتعظيم متوسط قيمة الفاتورة.",
    tag: "التسعير والهوامش",
    icon: Tag,
    badgeColorClass: "bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400",
  },
  {
    id: "5",
    title: "التدقيق والرقابة",
    description: "كشف الفواتير المكررة، المصاريف غير الموثقة، والشذوذ المحاسبي ومكافحة الهدر.",
    tag: "التدقيق الجنائي",
    icon: ShieldCheck,
    badgeColorClass: "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "6",
    title: "استعادة العملاء",
    description: "رصد إشارات فقدان العملاء (Churn) وحساب القيمة الدائمة LTV واستعادتهم.",
    tag: "ولاء العملاء",
    icon: Heart,
    badgeColorClass: "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
  },
];

export default function CircularCarouselDemo() {
  return (
    <div className="flex min-h-[440px] w-full items-center justify-center bg-transparent p-0 border-0 shadow-none">
      <CircularCarousel items={baseeraAgentsItems} />
    </div>
  );
}
