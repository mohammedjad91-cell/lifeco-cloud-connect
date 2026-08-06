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
    language: "@Lovable\r\n\r\nURGENT CORRECTION — OFFICIAL LIFECO WORK PERMIT\r\n\r\nPlease completely replace the previously created \"Work Permit\" form.\r\n\r\nThe previous version is incomplete and must NOT be used.\r\n\r\nThe uploaded LIFECO WORK PERMIT image is the ONLY source of truth.\r\n\r\nI need the digital Work Permit to contain ALL sections, questions,\r\ncheckboxes, fields, signatures, tables, labels, numbers, and wording\r\nvisible in the uploaded official LIFECO Work Permit.\r\n\r\nDO NOT summarize.\r\nDO NOT simplify.\r\nDO NOT remove fields.\r\nDO NOT invent fields.\r\nDO NOT merge sections.\r\nDO NOT change the meaning of any question.\r\n\r\n==================================================\r\n1. FORM IDENTITY\r\n==================================================\r\n\r\nTitle:\r\n\r\nWORK PERMIT\r\n\r\nCompany:\r\n\r\nLIFECO\r\nLibyan Fertilizer Company\r\n\r\nForm number:\r\n\r\nSFF - 06 - 01 - 03\r\n\r\nRevision:\r\n\r\nREV - 0\r\n\r\nPage:\r\n\r\nP 1 of 2\r\n\r\nThe form must visually and functionally represent the official\r\nLIFECO Work Permit shown in the uploaded image.\r\n\r\n==================================================\r\n2. GENERAL INFORMATION\r\n==================================================\r\n\r\nCreate the following fields exactly:\r\n\r\nWORK PERMIT\r\n\r\n1 - General Information\r\n\r\nWork Type:\r\n\r\n[ ] Cold\r\n[ ] Hot\r\n[ ] Confined Space Entry\r\n\r\nPERMIT No:\r\n\r\nDate:\r\n\r\nNo. of People in Area:\r\n\r\nPlant:\r\n\r\nEquipment / Location:\r\n\r\nDescription of the Work to be done:\r\n\r\nThese fields must be editable by the engineer.\r\n\r\n==================================================\r\n3. HAZARD IDENTIFICATION\r\n==================================================\r\n\r\nCreate the complete section:\r\n\r\n2 - Hazard Identification\r\n\r\nThe form must include the hazard groups exactly as shown.\r\n\r\nGroup 1:\r\n\r\nCombustible\r\nToxic\r\nCorrosive\r\nHigh Pressure\r\nHot Surface\r\n\r\nEach hazard has:\r\n\r\nYES\r\nNO\r\n\r\nand the following hazard indicators:\r\n\r\nFlying Sparks\r\nEquipment Operating\r\nMoving Machinery\r\nRadiation - X-Ray\r\n\r\nGroup 2:\r\n\r\nTripping Hazard\r\nRough Weather\r\nWorking at Height\r\nSharp Objects\r\n\r\nEach with:\r\n\r\nYES\r\nNO\r\n\r\nGroup 3:\r\n\r\nElectrical Hazard\r\nHigh Noise\r\nPoor Lighting\r\n\r\nEach with:\r\n\r\nYES\r\nNO\r\n\r\nDo NOT remove any of these hazards.\r\n\r\nEach item must have its own selectable YES / NO checkbox.\r\n\r\n==================================================\r\n4. SAFE WORK PREPARATION\r\n==================================================\r\n\r\nCreate:\r\n\r\n3 - Safe Work Preparation\r\n\r\nThe following questions MUST appear individually:\r\n\r\n1.\r\nEquipment:\r\n[ ] Blinded\r\n[ ] Disconnected\r\n[ ] Locked and tagged\r\n\r\n2.\r\nEquipment:\r\n[ ] De-energized\r\n[ ] Depressurized\r\n\r\n3.\r\nEquipment:\r\n[ ] Isolated\r\n[ ] Washed\r\n\r\n4.\r\nEquipment:\r\n[ ] Plugged (Nitrogen)\r\n[ ] Ventilated (air)\r\n\r\n5.\r\nGas test required for:\r\n[ ] Combustible\r\n[ ] Oxygen\r\n[ ] Ammonia\r\n\r\n6.\r\nGas test required for:\r\n[ ] Continuous\r\n\r\n7.\r\nElectric isolation & lock out / tag out\r\n(Permit attached if required)\r\n\r\n8.\r\nFire brigade support / firefighting equipment\r\n[ ] Fire resistant blankets\r\n\r\n9.\r\nStand by:\r\n[ ] Fire Watch\r\n[ ] Support\r\n\r\n10.\r\nNo other works / activity allowed within ______ m\r\n\r\n11.\r\nSewer covered within ______ m\r\n\r\n12.\r\nRadiation source:\r\n[ ] Sealed\r\n[ ] Removed\r\n\r\n13.\r\nSafe job analysis required:\r\n[ ] Yes (JSA attached if required)\r\n[ ] No\r\n\r\n14.\r\nOther (specify):\r\n\r\nThe section must contain a \"Remarks\" area exactly like the official form.\r\n\r\n==================================================\r\n5. ADDITIONAL SPECIAL TOOLS / PROTECTION REQUIRED\r\n==================================================\r\n\r\nCreate the section:\r\n\r\n4 - Additional Special Tools / Protection Required\r\n\r\nThe following items must be present:\r\n\r\nPPE Required:\r\n\r\n[ ] Helmet\r\n[ ] Safety shoes\r\n[ ] Coverall\r\n[ ] Safety glasses\r\n[ ] Gloves\r\n\r\nAdditional Special Tools / Protection Required:\r\n\r\n[ ] Face shield / Goggles\r\n[ ] Rubber Boots / Gloves\r\n[ ] No smoking tools\r\n[ ] Breathing equipment\r\n[ ] Other\r\n\r\nAlso include:\r\n\r\nTools Required:\r\n\r\n[ ] Fire extinguisher\r\n[ ] Welding machine\r\n[ ] 24V lighting\r\n[ ] Battery operated equipment\r\n[ ] Breathing equipment\r\n[ ] Heat Protection\r\n\r\nPreserve the structure of the original form.\r\n\r\n==================================================\r\n6. GAS TESTING\r\n==================================================\r\n\r\nCreate:\r\n\r\n5 - GAS TESTING\r\n(must be performed by a competent person only)\r\n\r\nInclude a gas testing table.\r\n\r\nThe table must include:\r\n\r\nTime\r\n\r\nOperator\r\n\r\n% Min\r\n\r\n% Max\r\n\r\nppm Max\r\n\r\nOther\r\n\r\nThe gas test values shown in the original form must be represented.\r\n\r\nInclude the fields for:\r\n\r\nOxygen\r\nLEL\r\nToxic / Ammonia or applicable gas\r\nOther\r\n\r\nAlso include:\r\n\r\n[ ] Gas Test Repeated Every ______\r\n\r\nand:\r\n\r\nThe equipment and/or location where the work has to be performed\r\nwere inspected & safety precautions listed in this Work Permit\r\nhave been fully implemented.\r\n\r\nSignature of the Shift Supervisor:\r\n\r\nPN:\r\n\r\nDo not remove this statement.\r\n\r\n==================================================\r\n7. CONTINUOUS GAS TESTING\r\n==================================================\r\n\r\nInclude:\r\n\r\n[ ] Continuous Gas Testing\r\n\r\nThe system must allow the user to specify whether continuous gas\r\ntesting is required.\r\n\r\n==================================================\r\n8. WORK PLACE CHECK LIST\r\n==================================================\r\n\r\nCreate:\r\n\r\n6 - WORK PLACE CHECK LIST\r\n(answer with Y / N / N/A)\r\n\r\nEvery question must be individually selectable as:\r\n\r\nY\r\nN\r\nN/A\r\n\r\nand must include:\r\n\r\nRemarks\r\n\r\nQuestions:\r\n\r\n1.\r\nHave you located the nearest safety shower? Is it OK?\r\n\r\n2.\r\nHave you located the nearest eye washing equipment? Is it OK?\r\n\r\n3.\r\nHave you located the nearest escape route? Is it free from obstacles\r\nor debris?\r\n\r\n4.\r\nHave you located the nearest emergency communication system? Is it OK?\r\n\r\n5.\r\nWorking area is clean and free of debris or material?\r\n\r\n6.\r\nTools and equipment are in good condition and suitable for the job?\r\n\r\n7.\r\nAre other works going on above / beneath your working area that may\r\ninterfere?\r\n\r\n8.\r\nLighting is sufficient? Do you need extra lighting?\r\n\r\n9.\r\nIf you are using scaffolding is it safe and easy to access?\r\n\r\n10.\r\nHave you been explained about all the risks involved in this work\r\nand the safety precautions that must be taken and are clear to me\r\n(must be signed by authorized Foreman only)?\r\n\r\n11.\r\nSignature of the Main/Shift Foreman covering the permit\r\n\r\nPN:\r\n\r\nThe wording must not be shortened.\r\n\r\n==================================================\r\n9. WORK COMPLETED / PERMIT CLOSED OUT\r\n==================================================\r\n\r\nCreate the bottom section exactly:\r\n\r\nWORK COMPLETED\r\n\r\n[ ] Yes\r\n[ ] No\r\n\r\nINCOMPLETE\r\n\r\n[ ] Why\r\n\r\nSTOPPED\r\n\r\n[ ] Why\r\n\r\nHOUSEKEEPING DONE\r\n\r\n[ ] Yes\r\n[ ] No\r\n\r\nInclude:\r\n\r\nShift Supervisor\r\nSign:\r\nPN:\r\n\r\nAuthorized Foreman\r\nSign:\r\nPN:\r\n\r\nThe system must allow signatures.\r\n\r\n==================================================\r\n10. PERMIT CLOSED OUT\r\n==================================================\r\n\r\nInclude:\r\n\r\n7 - PERMIT CLOSED OUT\r\n\r\nWork Completed:\r\n\r\n[ ] Yes\r\n[ ] No\r\n\r\nIncomplete:\r\n[ ] Why\r\n\r\nStopped:\r\n[ ] Why\r\n\r\nHousekeeping Done:\r\n[ ] Yes\r\n[ ] No\r\n\r\nShift Supervisor\r\n\r\nSign:\r\nPN:\r\n\r\nAuthorized Foreman\r\n\r\nSign:\r\nPN:\r\n\r\n==================================================\r\n11. FORM BEHAVIOR\r\n==================================================\r\n\r\nThis is NOT a normal generic web form.\r\n\r\nIt must behave like an official digital LIFECO permit.\r\n\r\nEvery checkbox must be interactive.\r\n\r\nEvery blank line must become an editable field.\r\n\r\nEvery YES / NO must be selectable.\r\n\r\nEvery Y / N / N/A item must be selectable.\r\n\r\nEvery Remarks area must allow text.\r\n\r\nEvery signature area must allow:\r\n\r\nDigital Signature\r\n\r\nName\r\n\r\nPN\r\n\r\nDate / Time where applicable\r\n\r\n==================================================\r\n12. AUTOMATIC PLANT INFORMATION\r\n==================================================\r\n\r\nThe Work Permit is opened from:\r\n\r\nDepartment\r\n→ Plant\r\n→ Permits & Work Requests\r\n→ New Permit\r\n→ Work Permit\r\n\r\nTherefore automatically populate:\r\n\r\nDepartment\r\nPlant\r\n\r\nIf opened from equipment:\r\n\r\nDepartment\r\nPlant\r\nArea\r\nEquipment\r\nEquipment Tag\r\n\r\nmust automatically populate.\r\n\r\nThe engineer must NOT re-enter information that already exists\r\nin the system.\r\n\r\n==================================================\r\n13. PERMIT NUMBER\r\n==================================================\r\n\r\nGenerate a unique Permit Number automatically.\r\n\r\nExample:\r\n\r\nWP-2026-000001\r\n\r\nDo not allow duplicate Permit Numbers.\r\n\r\n==================================================\r\n14. WORKFLOW\r\n==================================================\r\n\r\nThe workflow must be:\r\n\r\nDRAFT\r\n\r\n↓\r\n\r\nSUBMITTED\r\n\r\n↓\r\n\r\nUNDER REVIEW\r\n\r\n↓\r\n\r\nAPPROVED\r\n\r\n↓\r\n\r\nACTIVE\r\n\r\n↓\r\n\r\nWORK COMPLETED\r\n\r\n↓\r\n\r\nCLOSED\r\n\r\nOther possible statuses:\r\n\r\nREJECTED\r\nCANCELLED\r\nEXPIRED\r\nSTOPPED\r\nINCOMPLETE\r\n\r\n==================================================\r\n15. MAINTENANCE INTEGRATION\r\n==================================================\r\n\r\nWhen the engineer submits the Work Permit for maintenance work,\r\nautomatically create a linked Maintenance Work Request.\r\n\r\nExample:\r\n\r\nWork Permit:\r\nWP-2026-000001\r\n\r\nMaintenance Work Request:\r\nMNT-2026-000001\r\n\r\nThe Maintenance Department must receive the work request.\r\n\r\nThe maintenance record must automatically contain:\r\n\r\nDepartment\r\nPlant\r\nArea\r\nEquipment\r\nEquipment Tag\r\nPermit Number\r\nWork Description\r\nRequested By\r\nDate\r\nPriority\r\nStatus\r\n\r\nThe permit and maintenance request must remain linked.\r\n\r\n==================================================\r\n16. EQUIPMENT HISTORY\r\n==================================================\r\n\r\nAfter the maintenance work is completed:\r\n\r\nPlant\r\n→ Equipment\r\n→ Equipment History\r\n\r\nmust automatically record:\r\n\r\nWork Permit Number\r\nMaintenance Request Number\r\nWork Description\r\nDate\r\nTechnician\r\nWork Completed\r\nParts / Materials\r\nAttachments\r\nMaintenance Report\r\n\r\n==================================================\r\n17. OFFICIAL PDF\r\n==================================================\r\n\r\nAdd:\r\n\r\nVIEW FORM\r\n\r\nPRINT\r\n\r\nDOWNLOAD PDF\r\n\r\nThe PDF must reproduce the official LIFECO Work Permit.\r\n\r\nThe digital data must be inserted into the corresponding fields.\r\n\r\nDo not create a completely different modern PDF design.\r\n\r\nThe official form structure must remain recognizable.\r\n\r\n==================================================\r\n18. IMPORTANT — DO NOT LOSE ANYTHING\r\n==================================================\r\n\r\nBefore completing this task, compare the implementation against\r\nthe uploaded LIFECO Work Permit image section by section.\r\n\r\nVerify:\r\n\r\n✓ General Information\r\n✓ Work Type\r\n✓ Permit Number\r\n✓ Date\r\n✓ No. of People in Area\r\n✓ Plant\r\n✓ Equipment / Location\r\n✓ Description of Work\r\n✓ Hazard Identification\r\n✓ YES / NO selections\r\n✓ Safe Work Preparation\r\n✓ All 14 preparation items\r\n✓ Remarks\r\n✓ PPE\r\n✓ Additional Special Tools / Protection\r\n✓ Gas Testing\r\n✓ Continuous Gas Testing\r\n✓ Work Place Check List\r\n✓ Y / N / N/A\r\n✓ Remarks\r\n✓ Work Completed\r\n✓ Incomplete\r\n✓ Stopped\r\n✓ Housekeeping Done\r\n✓ Permit Closed Out\r\n✓ Shift Supervisor\r\n✓ Authorized Foreman\r\n✓ PN\r\n✓ Signatures\r\n✓ Form Number\r\n✓ Revision\r\n✓ Page Number\r\n\r\nIf any item visible in the uploaded official form is missing,\r\nadd it before finishing.\r\n\r\n==================================================\r\nFINAL COMMAND\r\n==================================================\r\n\r\nDELETE/REPLACE THE PREVIOUS INCOMPLETE WORK PERMIT IMPLEMENTATION.\r\n\r\nDO NOT create a new standalone Permit Center.\r\n\r\nKEEP THE WORK PERMIT INSIDE EACH PLANT.\r\n\r\nUSE THE UPLOADED OFFICIAL LIFECO WORK PERMIT IMAGE AS THE\r\nSOURCE OF TRUTH.\r\n\r\nTHE FINAL RESULT MUST BE A COMPLETE DIGITAL VERSION OF THE\r\nACTUAL LIFECO WORK PERMIT, NOT A SIMPLIFIED GENERIC WORK PERMIT.",
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

    language: "تحقق من عدم بقاء أي ظهور لعبارة \"language selector\" في الواجهة بعد التعديل.",
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
