"use client";

import React from "react";
import {
  TrendingUp,
  Package,
  Tag,
  Users,
  Compass,
  ShieldAlert,
} from "lucide-react";
import RadialOrbitalTimeline, {
  AgentTimelineItem,
} from "@/components/ui/radial-orbital-timeline";

const baseeraAgentsData: AgentTimelineItem[] = [
  {
    id: 1,
    title: "وكيل التحليل المالي",
    subtitle: "السيولة والأرباح",
    date: "Feb 2024",
    content: "تحليل الإيرادات ومخاطر التدفقات النقدية ونقاط التعادل والتنبؤ بعجز السيولة.",
    category: "Finance",
    icon: TrendingUp,
    color: "#6366f1", // Indigo
    inputData: "بيانات البنوك، الفواتير، التدفقات النقدية، وقوائم الأرباح والخسائر.",
    actionDetails: "تحليل السيولة النقدية، حساب معدل الحرق المالي، واكتشاف نقاط التعادل.",
    outputData: "تنبؤات التدفق النقدي لـ 90 يوماً، تقارير الربحية، وتوصيات السيولة.",
    relatedIds: [2, 3, 6],
    status: "completed",
    energy: 95,
  },
  {
    id: 2,
    title: "وكيل سلاسل الإمداد",
    subtitle: "المخزون والتوريد",
    date: "Feb 2024",
    content: "تتبع البضاعة الراكدة وحساب توقيت إعادة الطلب الأمثل لتفادي تجميد رأس المال.",
    category: "Supply",
    icon: Package,
    color: "#3b82f6", // Blue
    inputData: "سجلات المشتريات، حركة المخزون، بيانات الموردين، ومعدل الدوران.",
    actionDetails: "رصد البضائع الراكدة، تقييم كفاءة التوريد، وحساب توقيت إعادة الطلب.",
    outputData: "جداول إعادة الشراء التلقائية، تحليلات تقليل الهدر، وخطة تعظيم رأس المال.",
    relatedIds: [1, 3],
    status: "completed",
    energy: 90,
  },
  {
    id: 3,
    title: "وكيل استراتيجية التسعير",
    subtitle: "التسعير والهوامش",
    date: "Mar 2024",
    content: "مرونة الأسعار، هندسة الحزم (Bundles)، وتعظيم متوسط قيمة الفاتورة.",
    category: "Pricing",
    icon: Tag,
    color: "#a855f7", // Lavender
    inputData: "تكاليف المنتجات، أسعار المنافسين، مرونة الطلب، وقيمة السلة.",
    actionDetails: "محاكاة خيارات التسعير، هندسة حزم المنتجات، وحساب الهوامش.",
    outputData: "توصيات التعديل السعري الديناميكي، عروض AOV، وخطة حماية الربحية.",
    relatedIds: [1, 2, 5],
    status: "in-progress",
    energy: 88,
  },
  {
    id: 4,
    title: "وكيل ولاء العملاء",
    subtitle: "ولاء العملاء",
    date: "Apr 2024",
    content: "رصد إشارات فقدان العملاء (Churn) وحساب القيمة الدائمة LTV.",
    category: "Retention",
    icon: Users,
    color: "#4f46e5", // Violet-Indigo
    inputData: "سجلات التسوق، تكرار الشراء، مراجعات العملاء، وسلوك التسوق.",
    actionDetails: "تحليل معدل تسرب العملاء (Churn)، واكتشاف الشرائح الأكثر قيمة.",
    outputData: "خطط الاستعادة المخصصة، تصميم برامج الولاء، وتوصيات رفع LTV.",
    relatedIds: [3, 5],
    status: "pending",
    energy: 82,
  },
  {
    id: 5,
    title: "وكيل ذكاء السوق",
    subtitle: "ذكاء السوق",
    date: "May 2024",
    content: "قراءة اتجاهات السوق، رصد المنافسين، واقتناص الفرص ذات العائد المرتفع.",
    category: "Market",
    icon: Compass,
    color: "#0284c7", // Sky Blue
    inputData: "تقارير القطاع، أسعار المنافسين، التغيرات الاقتصادية، واتجاهات السوق.",
    actionDetails: "مراقبة التغيرات التنافسية، تحليل الفجوات، وتتبع نمو القطاع.",
    outputData: "مقارنات التموضع التنافسي، تقارير الفرص النامية، وتحليل SWOT.",
    relatedIds: [3, 4, 6],
    status: "completed",
    energy: 92,
  },
  {
    id: 6,
    title: "وكيل التدقيق الجنائي",
    subtitle: "التدقيق ومكافحة الهدر",
    date: "May 2024",
    content: "كشف الفواتير المكررة، المصاريف غير الموثقة، والشذوذ المحاسبي.",
    category: "Forensic",
    icon: ShieldAlert,
    color: "#8b5cf6", // Deep Lavender
    inputData: "المعاملات المالية اليومية، الفواتير، قيود اليومية، واستثناءات الصرف.",
    actionDetails: "التدقيق الجنائي الآلي، رصد الانحرافات المحاسبية، ومتابعة المصروفات.",
    outputData: "تنبيهات الاحتيال والهدر، تقارير الانحرافات، وتوصيات الحوكمة.",
    relatedIds: [1, 5],
    status: "completed",
    energy: 96,
  },
];

export function RadialOrbitalTimelineDemo() {
  return <RadialOrbitalTimeline timelineData={baseeraAgentsData} />;
}

export default {
  RadialOrbitalTimelineDemo,
};
