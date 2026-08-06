import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "en" | "ar";

const translations = {
  en: {
    // Login / Grid
    lifecoDigital: "LIFECO PMS 2026",
    opsLoggingSystem: "Plant Management System",
    departmentAccess: "Department Access",
    enterPin: "Enter PIN",
    selectDepartment: "Select Department",
    pinRequired: "Enter 4-digit PIN",

    // Dashboard
    department: "Department",
    dateFilter: "Date Filter:",
    locked: "Locked (Read-Only)",
    finalizeAndLock: "Finalize & Lock (تم الإدراج)",
    viewDailyHistory: "View Daily History (عرض السجل)",
    newLogEntry: "New Log Entry",
    employeeId: "Employee ID",
    employeeIdPlaceholder: "Enter Employee ID...",
    unitTag: "Unit / Tag",
    selectUnit: "Select unit...",
    value: "Value",
    saveEntry: "Save Entry",
    missingFields: "Please fill all required fields (Employee ID, Tag, Value).",
    logs: "Logs",
    analytics: "Analytics",
    noLogs: "No logs for this date.",
    exit: "Exit",
    pdf: "PDF",
    excel: "Excel",
    save: "Save",
    cancel: "Cancel",
    deleted: "Deleted",
    updated: "Updated",
    saved: "Saved",
    logEntrySaved: "Log entry recorded successfully",
    errorSaving: "Failed to save log entry",
    alreadyLocked: "Already locked or error",
    dateLocked: "Date is now locked.",

    // Lab
    laboratory: "LABORATORY",
    technicianName: "Technician Name",
    technicianNamePlaceholder: "Enter technician name...",
    selectPlant: "Select Plant",
    sampleType: "Sample Type",
    daily: "Daily",
    weekly: "Weekly",
    parameter: "Parameter",
    labResults: "Lab Results",
    noLabResults: "No lab results for this date.",
    saveSample: "Save Sample",
    labMissingFields: "Please fill all required fields.",
    labSaved: "Lab result saved successfully",

    // Admin
    adminAccess: "Admin Access",
    masterPin: "Master PIN",
    authenticate: "Authenticate",
    invalidPin: "Invalid Master PIN",
    adminSettings: "ADMIN SETTINGS",
    adminPortal: "Developer / Admin Portal",
    emergencyUnlock: "Emergency Master Unlock",
    overrideAllLocks: "Override all date locks temporarily",
    lockedDates: "Locked Dates",
    noLockedDates: "No dates are currently locked.",
    unlock: "Unlock",
    dateUnlocked: "Date unlocked",
    departmentPins: "Department PINs",
    changePins: "Change PINs",
    pinUpdated: "PIN updated successfully",
    pinUpdateError: "Failed to update PIN",
    activityLogs: "Activity Logs",
    noActivityLogs: "No activity logs yet.",
    tagManagement: "Tag Management",
    addTag: "Add Tag",
    deleteTag: "Delete",
    tagAdded: "Tag added",
    tagDeleted: "Tag deleted",
    selectDept: "Select Department",
    newTagName: "New tag name...",

    // Lab results on dashboard
    labReadings: "Lab Readings",
    noLabReadings: "No lab readings for your plant on this date.",

    // Analytics
    comparisonAnalytics: "Comparison Analytics",
    selectDate1: "Date 1",
    selectDate2: "Date 2",
    compare: "Compare",
    deptDistribution: "Department Distribution",
    trendAnalysis: "Trend Analysis",
    performanceRadar: "Performance Radar",

    // Footer
    footer: "Prepared by Eng. Mohammed Gadallah",

    // Field Operations
    fieldOpsEntry: "Field Operations Entry",
    fieldOpsMissing: "Please fill Employee ID, Equipment and at least one reading.",
    fieldOpsSaved: "Field operation reading saved.",
    equipmentTag: "Equipment / Asset",
    selectEquipment: "Select equipment...",
    runningHours: "Running Hours",
    dischargePressure: "Discharge Pressure",
    temperature: "Temperature",
    notes: "Notes",
    notesPlaceholder: "Optional remarks...",
    fieldOps: "Field Ops",

    // Language
    language: "Load the security issues from the scan results and fix the selected issues.",
    managementFlow: "Factory -> Engineer -> Permits -> Electrical Permit -> Engineer fills permit -> Send -> System saves PDF -> Maintenance Management -> Incoming work requests -> Review request -> Determine work type -> Choose specialized team -> Assign Engineer/Supervisor/Technician -> Execute work -> Close work -> Record returns to Factory + Equipment + Permit",
  },
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

    adminAccess: "دخول الإداره",
    masterPin: "الرمز الرئيسي",
    authenticate: "تحقق",
    invalidPin: "الرمز الرئيسي غير صحيح",
    adminSettings: "إعدادات المسؤول",
    adminPortal: "بوابة المطور / المسؤول",
    emergencyUnlock: "إلغاء القفل الرئيسي للطوارئ",
    overrideAllLocks: "تجاوز جميع أقفال التاريخ مؤقتًا",
    lockedDates: "التواريخ المقفلة",
    noLockedDates: "لا توجد تواريخ مقفلة حاليًا.",
    unlock: "إلغاء القفل",
    dateUnlocked: "تم إلغاء قفل التاريخ",
    departmentPins: "رموز الأقسام",
    changePins: "تغيير الرموز",
    pinUpdated: "تم تحديث الرمز بنجاح",
    pinUpdateError: "فشل في تحديث الرمز",
    activityLogs: "سجلات النشاط",
    noActivityLogs: "لا توجد سجلات نشاط بعد.",
    tagManagement: "إدارة العناصر",
    addTag: "إضافة عنصر",
    deleteTag: "حذف",
    tagAdded: "تم إضافة العنصر",
    tagDeleted: "تم حذف العنصر",
    selectDept: "اختر القسم",
    newTagName: "اسم العنصر الجديد...",

    labReadings: "قراءات المعمل",
    noLabReadings: "لا توجد قراءات معمل لمصنعك في هذا التاريخ.",

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

    language: "Load the security issues from the scan results and fix the selected issues.",
    managementFlow: "المصنع\n\n↓\n\nالمهندس\n\n↓\n\nالتصاريح\n\n↓\n\nتصريح عمل كهربائي\n\n↓\n\nالمهندس يعبي التصريح\n\n↓\n\nإرسال\n\n↓\n\nالنظام يحفظ التصريح PDF\n\n↓\n\nإدارة الصيانة\n\n↓\n\nطلبات العمل الواردة\n\n↓\n\nمراجعة الطلب\n\n↓\n\nتحديد نوع العمل\n\n↓\n\nاختيار الفريق المختص\n\n↓\n\nتعيين المهندس / المشرف / الفني\n\n↓\n\nتنفيذ العمل\n\n↓\n\nإغلاق العمل\n\n↓\n\nيرجع السجل للمصنع + المعدة + التصريح",
  },
} as const;

type Translations = Record<keyof typeof translations.en, string>;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  lang: "ar",
  setLang: () => {},
  t: translations.ar,
  dir: "rtl",
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ar";
    return (localStorage.getItem("lifeco_lang") as Lang) || "ar";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("lifeco_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const value: I18nContextType = {
    lang,
    setLang,
    t: translations[lang],
    dir: lang === "ar" ? "rtl" : "ltr",
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
