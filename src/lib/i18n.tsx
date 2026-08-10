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
    footer: "Prepared by Eng. Mohamed Gadalla",

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
    language: "System Operation and Usage Manual",
    managementFlow: "Factory -> Engineer -> Permits -> Electrical Permit -> Engineer fills permit -> Send -> System saves PDF -> Maintenance Management -> Incoming work requests -> Review request -> Determine work type -> Choose specialized team -> Assign Engineer/Supervisor/Technician -> Execute work -> Close work -> Record returns to Factory + Equipment + Permit",
  },
  ar: {
    lifecoDigital: "LIFECO PMS 2026",
    opsLoggingSystem: "'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                            \n                                            Act as a Senior Industrial UI/UX Developer and React Architect. Please build a comprehensive, interactive digital entry module inside the \"Nitrogen Plant\" under the \"Logs & Operations\" tab on Lovable, incorporating all 3 Commissioning Log Sheets.\n\n---\n\n### 1. NAVIGATION & TAB STRUCTURE\n\nCreate 3 interactive tabs within the \"Logs & Operations\" section:\n\n- Tab 1: \"SHEET-1: Air Compressors (60-1001 A/B/C)\"\n\n- Tab 2: \"SHEET-2: Nitrogen Plant & Utilities\"\n\n- Tab 3: \"SHEET-3: Nitrogen Plant Hourly Operations (8-8-2026)\"\n\n---\n\n### 2. FAST DATA ENTRY & KEYBOARD NAVIGATION\n\n- Smooth Input Flow: Ensure all table cells support fast numeric entry. Pressing \"Enter\" or using the Keyboard Arrow Keys must automatically move the cursor to the next input cell (down or right).\n\n- Mouse & Touch Friendly: Optimized for high-contrast click/tap selection on plant industrial tablets.\n\n---\n\n### 3. ACTION TOOLBAR (EXPORT & PRINT)\n\nProvide a clear top action bar featuring 4 primary buttons:\n\n- Save Log Entries (Saves data locally / to state)\n\n- Export PDF (Generates a clean PDF document for the active sheet)\n\n- Send Report (Quick dispatch via WhatsApp API / Email)\n\n- Print Sheet (Direct printer output format)\n\n---\n\n### 4. EXACT PARAMETERS FOR ALL 3 SHEETS\n\n#### TAB 1: SHEET-1 (AIR COMPRESSOR UNITS)\n\n- Header: \"Commissioning Log Sheet - SHEET-1\"\n\n- Logging Time Columns: \"08:00\", \"10:00\", \"12:00\", \"14:00\", \"16:00\"\n\n- Equipment Tag Groups (Collapsible): 60-1001/A, 60-1001/B, 60-1001/C\n\n- Parameters per tag:\n\n  * Amper\n\n  * Compressed air outlet press\n\n  * ΔP Air Filter\n\n  * Lub oil pressure\n\n  * First stage air discharge\n\n  * Compressed air temp\n\n  * Element one outlet\n\n  * Element two inlet\n\n  * Element two outlet\n\n  * Cooling water inlet temp\n\n  * LP. Cooling water outlet temp\n\n  * Cooling water outlet temp\n\n  * Lub oil temp\n\n  * Lub oil tank level %\n\n#### TAB 2: SHEET-2 (NITROGEN PLANT & UTILITIES)\n\n- Header: \"Ammonia plants dept. - Nitrogen plant Commissioning log sheet\"\n\n- Logging Time Columns: \"08:00\", \"10:00\", \"12:00\", \"14:00\", \"16:00\"\n\n- Row Parameters:\n\n  * 60-PT-0014 C.W.P. discharge\n\n  * 60-lt-0001 C.W. tank level %\n\n  * 60-PT-0016 S.W. pressure\n\n  * 60-PT-0017 S.W. pressure\n\n  * 60-PI-0009 compressed air press\n\n  * 61-TI-029 compressed air TEMP\n\n  * 60-PI-029 INST. Air press\n\n  * 60-TI-010 inst. Air TEMP\n\n  * 60-AT-001 common dew point\n\n  * 60-pt-0001 dryers outlet press\n\n  * 60-FIC-001 inlet flow to 2201\n\n  * 61-FIC-002 INLET FLOW TO 2202\n\n  * 60-2201 A/B filter ΔP\n\n  * 60-2202 A/B filter ΔP\n\n  * 60-FT-0005 inst. Air flow\n\n  * P.S.A unit\n\n  * 60-2203 A/B inlet filter ΔP\n\n  * 61-2203 CV/D inlet filter ΔP\n\n  * 60-301-O2 analyzer\n\n  * 61-303-o2 analyzer\n\n  * 62-302 production o2 analyzer\n\n  * 60-FT-0004 air flow to P.S.A\n\n  * 60-PT-010 N2 header pressure\n\n  * 60-PG-308 N2 Receiver pressure\n\n  * 60-AL-003 P.S.A Oxygen cont\n\n#### TAB 3: SHEET-3 (NITROGEN PLANT HOURLY LOG)\n\n- Header: \"Ammonia Plants Dept. - Nitrogen Plant Commissioning Log Sheet\"\n\n- Logging Time Columns: \"8\", \"10\", \"12\", \"14\", \"16\", \"18\"\n\n- Row Parameters:\n\n  * 60-PIC-006 PRESSURE/OPENING%\n\n  * 60-PI-012 Compressor discharge\n\n  * 60-TI-002 Compressor temp\n\n  * 60-TI-005 C.W. Tank inlet temp\n\n  * 60-LI-001 C.W. Tank level\n\n  * 60-PI-014 C.W. Pressure\n\n  * 60-FIC-001 Inlet flow to 2201 A/B\n\n  * 60-FIC-001 Inlet flow to 2202 A/B\n\n  * 60-TI-001 Dryers outlet temp\n\n  * 60-PI-001 Dryers outlet pressure\n\n  * 60-PIC-005 Pressure / Opening %\n\n  * 60-FT-0005 Inst. Air flow\n\n  * 60-PI-005 Inst. Air pressure\n\n  * 60-PIC-022 pro. Air from Amm-1\n\n  * 60-FT-004 Air flow to P.S.A\n\n  * 60-FI-305 P.S.A production\n\n  * 60-PI-010 P.S.A production\n\n  * 60-TI-305 P.S.A production\n\n  * 60-AI-001 main dew point\n\n  * 60-AL-003 P.S.A Production purity\n\n- Shift Signatures Section at the bottom: MORNING SHIFT, AFTERNOON SHIFT, NIGHT SHIFT.\n\n---\n\n### 5. UI/UX STYLING\n\nDesign a high-contrast dark-mode DCS layout with large bold fonts for Tag IDs, crisp table borders, color-coded status highlights, and a clean digital layout.",
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

    language: "دليل تشغيل واستخدام المنظومة",
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
