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
    language: "Goal\n\n- Build a high-precision Work Permit Document Processing and Text Extraction application that allows users to upload work permit images and capture, verify, and display the exact text content from the documents with maximum accuracy.\n\nPages/Routes\n\n- `/dashboard`: Main overview showing recent work permit uploads, processing status, and quick extraction actions.\n\n- `/upload`: Document submission page featuring image upload zones, live camera capture, and real-time OCR processing preview.\n\n- `/permits/:id`: Detailed view of an individual work permit displaying side-by-side original image and extracted text fields for verification.\n\nComponents\n\n- `DocumentUploader`: Drag-and-drop zone supporting image uploads (PNG, JPG, WEBP) with client-side image optimization and preview.\n\n- `SideBySideViewer`: Interactive visual inspector featuring image zoom/pan controls alongside corresponding editable text fields.\n\n- `TextExtractionForm`: Form layout auto-populated with extracted document data (e.g., Permit Number, Full Name, Issue Date, Expiration Date, Employer Name, Job Title, Conditions).\n\n- `AccuracyIndicator`: Visual badge indicating confidence scores and flagging low-confidence text fields for manual review.\n\n- `ExportToolbar`: Action bar to copy extracted raw text, export structured data to JSON/CSV, or save records to the database.\n\nData Model\n\n- `work_permits` table:\n\n  - `id` (uuid, primary key)\n\n  - `image_url` (text, required)\n\n  - `raw_extracted_text` (text, required)\n\n  - `permit_number` (text)\n\n  - `holder_name` (text)\n\n  - `employer` (text)\n\n  - `issue_date` (date)\n\n  - `expiry_date` (date)\n\n  - `status` (enum: 'pending', 'verified', 'flagged')\n\n  - `created_at` (timestamp)\n\nStates\n\n- `idle`: Ready for image upload.\n\n- `processing`: Active extraction loader with visual progress feedback.\n\n- `success`: Extraction complete; original image and mapped text displayed side-by-side.\n\n- `error`: Clear error message for unreadable images or unsupported formats with retry options.\n\nUX Details\n\n- Clean, high-contrast interface designed for rapid visual verification against source document images.\n\n- Highlight corresponding image regions when focusing or hovering over extracted text fields.\n\n- One-click \"Copy All Text\" button preserving original layout and line breaks.\n\n- Responsive layout converting side-by-side view to stacked layout on mobile devices.\n\nAccessibility\n\n- Full keyboard navigation for all form fields and image manipulation controls.\n\n- Screen reader announcements for extraction completion and status updates.\n\n- Accessible color contrast ratios (WCAG AA compliant) for all text and badges.\n\nAcceptance Criteria\n\n- Uploading a work permit image accurately populates all text fields to match the source document text exactly.\n\n- Users can manually edit any field if discrepancies exist between the image and extracted text.\n\n- Data successfully saves to the backend database with audit timestamps.",
    اكمل: "اكمل",
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

    language: "Goal\n\n- Build a high-precision Work Permit Document Processing and Text Extraction application that allows users to upload work permit images and capture, verify, and display the exact text content from the documents with maximum accuracy.\n\nPages/Routes\n\n- `/dashboard`: Main overview showing recent work permit uploads, processing status, and quick extraction actions.\n\n- `/upload`: Document submission page featuring image upload zones, live camera capture, and real-time OCR processing preview.\n\n- `/permits/:id`: Detailed view of an individual work permit displaying side-by-side original image and extracted text fields for verification.\n\nComponents\n\n- `DocumentUploader`: Drag-and-drop zone supporting image uploads (PNG, JPG, WEBP) with client-side image optimization and preview.\n\n- `SideBySideViewer`: Interactive visual inspector featuring image zoom/pan controls alongside corresponding editable text fields.\n\n- `TextExtractionForm`: Form layout auto-populated with extracted document data (e.g., Permit Number, Full Name, Issue Date, Expiration Date, Employer Name, Job Title, Conditions).\n\n- `AccuracyIndicator`: Visual badge indicating confidence scores and flagging low-confidence text fields for manual review.\n\n- `ExportToolbar`: Action bar to copy extracted raw text, export structured data to JSON/CSV, or save records to the database.\n\nData Model\n\n- `work_permits` table:\n\n  - `id` (uuid, primary key)\n\n  - `image_url` (text, required)\n\n  - `raw_extracted_text` (text, required)\n\n  - `permit_number` (text)\n\n  - `holder_name` (text)\n\n  - `employer` (text)\n\n  - `issue_date` (date)\n\n  - `expiry_date` (date)\n\n  - `status` (enum: 'pending', 'verified', 'flagged')\n\n  - `created_at` (timestamp)\n\nStates\n\n- `idle`: Ready for image upload.\n\n- `processing`: Active extraction loader with visual progress feedback.\n\n- `success`: Extraction complete; original image and mapped text displayed side-by-side.\n\n- `error`: Clear error message for unreadable images or unsupported formats with retry options.\n\nUX Details\n\n- Clean, high-contrast interface designed for rapid visual verification against source document images.\n\n- Highlight corresponding image regions when focusing or hovering over extracted text fields.\n\n- One-click \"Copy All Text\" button preserving original layout and line breaks.\n\n- Responsive layout converting side-by-side view to stacked layout on mobile devices.\n\nAccessibility\n\n- Full keyboard navigation for all form fields and image manipulation controls.\n\n- Screen reader announcements for extraction completion and status updates.\n\n- Accessible color contrast ratios (WCAG AA compliant) for all text and badges.\n\nAcceptance Criteria\n\n- Uploading a work permit image accurately populates all text fields to match the source document text exactly.\n\n- Users can manually edit any field if discrepancies exist between the image and extracted text.\n\n- Data successfully saves to the backend database with audit timestamps.",
    اكمل: "اكمل",
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
