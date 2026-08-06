import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "ar";

const translations = {
  ar: {
    lifecoDigital: "LIFECO PMS 2026",
    opsLoggingSystem: "نظام إدارة المصنع",
    departmentAccess: "دخول القسم",
    enterPin: "أدخل الرمز",
    selectDepartment: "اختر القسم",
    pinRequired: "أدخل رمز من 4 أرقام",
    
    department: "القسم",
    dateFilter: "فلتر التاريخ:",
    locked: "مقفل (للقراءة فقط)",
    finalizeAndLock: "تم الإدراج (قفل وتأكيد)",
    viewDailyHistory: "عرض السجل اليومي",
    newLogEntry: "إدخال جديد",
    employeeId: "الرقم الوظيفي",
    employeeIdPlaceholder: "أدخل الرقم الوظيفي...",
    unitTag: "الوحدة / العنصر",
    selectUnit: "اختر الوحدة...",
    value: "القيمة",
    saveEntry: "حفظ الإدخال",
    missingFields: "يرجى ملء جميع الحقول المطلوبة (الرقم الوظيفي، العنصر، القيمة).",
    logs: "السجلات",
    analytics: "التحليلات",
    noLogs: "لا توجد سجلات لهذا التاريخ.",
    exit: "خروج",
    pdf: "PDF",
    excel: "Excel",
    save: "حفظ",
    cancel: "إلغاء",
    deleted: "تم الحذف",
    updated: "تم التحديث",
    saved: "تم الحفظ",
    logEntrySaved: "تم تسجيل الإدخال بنجاح",
    errorSaving: "فشل في حفظ الإدخال",
    alreadyLocked: "مقفل بالفعل أو حدث خطأ",
    dateLocked: "تم قفل التاريخ.",
    
    laboratory: "المختبر",
    technicianName: "اسم الفني",
    technicianNamePlaceholder: "أدخل اسم الفني...",
    selectPlant: "اختر المصنع",
    sampleType: "نوع العينة",
    daily: "يومي",
    weekly: "أسبوعي",
    parameter: "المعامل",
    labResults: "نتائج المختبر",
    noLabResults: "لا توجد نتائج مختبر لهذا التاريخ.",
    saveSample: "حفظ العينة",
    labMissingFields: "يرجى ملء جميع الحقول المطلوبة.",
    labSaved: "تم حفظ نتيجة المختبر بنجاح",
    
    adminAccess: "دخول المسؤول",
    masterPin: "الرمز الرئيسي",
    authenticate: "تسجيل الدخول",
    invalidPin: "الرمز الرئيسي غير صحيح",
    adminSettings: "إعدادات المسؤول",
    adminPortal: "لوحة المطور / المسؤول",
    emergencyUnlock: "فتح طوارئ رئيسي",
    overrideAllLocks: "تجاوز جميع الأقفال مؤقتاً",
    lockedDates: "التواريخ المقفلة",
    noLockedDates: "لا توجد تواريخ مقفلة حالياً.",
    unlock: "فتح القفل",
    dateUnlocked: "تم فتح القفل",
    departmentPins: "أرقام الأقسام السرية",
    changePins: "تغيير الأرقام",
    pinUpdated: "تم تحديث الرمز بنجاح",
    pinUpdateError: "فشل في تحديث الرمز",
    activityLogs: "سجل النشاطات",
    noActivityLogs: "لا توجد سجلات نشاط بعد.",
    tagManagement: "إدارة العناصر",
    addTag: "إضافة عنصر",
    deleteTag: "حذف",
    tagAdded: "تم إضافة العنصر",
    tagDeleted: "تم حذف العنصر",
    selectDept: "اختر القسم",
    newTagName: "اسم العنصر الجديد...",
    
    labReadings: "قراءات المختبر",
    noLabReadings: "لا توجد قراءات مختبر لمصنعك في هذا التاريخ.",
    
    comparisonAnalytics: "تحليلات المقارنة",
    selectDate1: "التاريخ ١",
    selectDate2: "التاريخ ٢",
    compare: "مقارنة",
    deptDistribution: "توزيع الأقسام",
    trendAnalysis: "تحليل الاتجاه",
    performanceRadar: "رادار الأداء",
    
    footer: "إعداد م. محمد جادالله",
    
    fieldOpsEntry: "إدخال العمليات الميدانية",
    fieldOpsMissing: "يرجى ملء الرقم الوظيفي والمعدة وقراءة واحدة على الأقل.",
    fieldOpsSaved: "تم حفظ قراءة العمليات الميدانية.",
    equipmentTag: "المعدة / الأصل",
    selectEquipment: "اختر المعدة...",
    runningHours: "ساعات التشغيل",
    dischargePressure: "ضغط التفريغ",
    temperature: "درجة الحرارة",
    notes: "ملاحظات",
    notesPlaceholder: "ملاحظات اختيارية...",
    fieldOps: "العمليات الميدانية",
    
    languageGoal: "Goal\n\n- Perform a complete visual and structural redesign of the application to deliver an executive-grade, modern, and highly cohesive user interface.\n\n\n\nDesign & Theme System\n\n- Implement a sophisticated, modern color palette using rich neutral backgrounds (e.g., deep slate or clean off-white), vibrant primary accents (e.g., indigo, violet, or electric blue), and distinct semantic colors for success, warning, and error states.\n\n- Establish unified CSS design tokens using Tailwind utilities for smooth background gradients, card elevations, glassmorphism backdrops, and consistent border radii (`rounded-xl` or `rounded-2xl`).\n\n- Refine typography with a modern sans-serif hierarchy (e.g., Inter or Plus Jakarta Sans), ensuring crisp readability, proportional tracking, and clear heading-to-body contrast.\n\n\n\nComponent Refinement\n\n- Redesign key interface components—including cards, tables, modal dialogs, navigation bars, and forms—with elevated surface styling, soft drop shadows (`shadow-sm` to `shadow-lg`), and clean border accents (`border-border/40`).\n\n- Modernize interactive controls (buttons, inputs, toggle switches, select dropdowns) with defined hover, active, dynamic focus-visible rings, and disabled states.\n\n- Integrate clean Lucide React iconography and pill-style status badges to enhance visual data hierarchy and readability.\n\n\n\nStates & Micro-Interactions\n\n- Incorporate subtle, performant transitions (`duration-200 ease-in-out`) on interactive elements, hover cards, and modal overlay entrances.\n\n- Implement polished skeletal loading shimmers during asynchronous data fetching, and create engaging empty states featuring iconography, helpful descriptions, and primary call-to-action buttons.\n\n- Display inline form validation and toast notification popups with clear color-coded iconography for immediate user feedback.\n\n\n\nUX & Responsiveness\n\n- Build a mobile-first responsive layout that seamlessly adapts from mobile screen sizes to ultra-wide desktop monitors using fluid CSS grids and flexbox containers.\n\n- Implement an intuitive mobile navigation system (e.g., sliding drawer or sticky bottom navigation bar) for seamless touch-screen usability.\n\n\n\nAccessibility & Standards\n\n- Maintain strict WCAG AA contrast ratios across all text elements, iconography, and semantic indicators in both dark and light modes.\n\n- Ensure full keyboard navigation accessibility with custom focus-visible outlines and appropriate ARIA roles across all interactive components.\n\n\n\nAcceptance Criteria\n\n- The application presents a modern, visually striking visual identity with a refined color hierarchy and cohesive component styling.\n\n- Layouts are fluid and fully responsive across all device breakpoints without horizontal overflow or alignment glitches.\n\n- Every interactive element provides clear, tactile feedback across default, hover, focus, loading, and disabled states.",
  }
} as const;

type TranslationKeys = keyof typeof translations.ar;
type Translations = Record<TranslationKeys, string>;

interface I18nContextType {
  lang: Lang;
  t: Translations;
  dir: "rtl";
}

const I18nContext = createContext<I18nContextType>({
  lang: "ar",
  t: translations.ar,
  dir: "rtl",
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const value: I18nContextType = {
    lang: "ar",
    t: translations.ar,
    dir: "rtl",
  };

  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};