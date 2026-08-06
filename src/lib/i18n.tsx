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
    language: "LIFECO DIGITAL TRANSFORMATION PLATFORM\n\nPLANT-CENTRIC PERMIT & WORKFLOW ARCHITECTURE\n\nIMPORTANT:\n\nThe uploaded LIFECO permit images are NOT standalone system pages.\n\nDO NOT create a new main dashboard or separate \"Permit Center\" interface for these forms.\n\nDO NOT place these permits as a top-level department.\n\nDO NOT make HSE Permit Center the primary navigation.\n\nThe permits shown in the uploaded images are OFFICIAL OPERATIONAL FORMS that must exist INSIDE EACH PLANT.\n\nThe plant is the main context.\n\nThe permit is a function INSIDE the plant.\n\n========================================================\n\nCORE ARCHITECTURE\n\n========================================================\n\nThe system hierarchy must be:\n\nLIFECO DIGITAL TRANSFORMATION PLATFORM\n\n→ Department\n\n→ Plant\n\n→ Plant Dashboard\n\n→ Plant Functions\n\n→ Equipment\n\n→ Documents\n\n→ Permits\n\n→ Maintenance\n\n→ Records / History\n\nExample:\n\nAmmonia Department\n\n    ↓\n\nAmmonia Plant 1\n\n    ↓\n\nPlant Dashboard\n\n    ↓\n\nPermits & Work Requests\n\n    ↓\n\nSelect Permit Type\n\n    ↓\n\nFill Permit\n\n    ↓\n\nSubmit\n\n    ↓\n\nMaintenance receives the work\n\n    ↓\n\nMaintenance performs / schedules the work\n\n    ↓\n\nWork completed\n\n    ↓\n\nPermit closed\n\n    ↓\n\nHistory stored under Plant + Equipment\n\n========================================================\n\nVERY IMPORTANT — NO STANDALONE PERMIT INTERFACE\n\n========================================================\n\nREMOVE the previously created standalone Permit Center interface.\n\nDo not show:\n\nHSE\n\n→ Permit Center\n\n→ Work Permit\n\nas the main way of accessing permits.\n\nInstead:\n\nEvery plant must have its own:\n\n\"Permits & Work Requests\"\n\nsection.\n\nFor example:\n\nAmmonia Department\n\n→ Ammonia Plant 1\n\n→ Permits & Work Requests\n\nUrea Department\n\n→ Urea Plant 1\n\n→ Permits & Work Requests\n\nMaintenance Department\n\n→ Maintenance Operations\n\n→ Incoming Work\n\nThe same permit system must be shared by all plants, but each permit belongs to a specific plant.\n\n========================================================\n\nPLANT DASHBOARD\n\n========================================================\n\nWhen the user enters a plant, show a dedicated plant dashboard.\n\nExample:\n\nAMMONIA PLANT 1\n\nPlant Overview\n\nPlant Status\n\nRunning / Shutdown / Maintenance\n\nCurrent Operations\n\nActive Work\n\nOpen Work Requests\n\nActive Permits\n\nPending Permits\n\nEquipment Under Maintenance\n\nSafety Alerts\n\nRecent Activities\n\nDocuments\n\nProcess Information\n\nEquipment\n\nMaintenance\n\nPermits & Work Requests\n\nReports\n\nHistory\n\nDo NOT create another separate application interface.\n\nThis must be part of the existing plant page.\n\n========================================================\n\nPLANT PERMIT SECTION\n\n========================================================\n\nInside each plant create:\n\nPERMITS & WORK REQUESTS\n\nThis is where the engineer sees all permits related specifically to the current plant.\n\nDisplay:\n\nActive Permits\n\nPending Permits\n\nClosed Permits\n\nRejected Permits\n\nExpired Permits\n\nDraft Permits\n\nAlso show:\n\nTotal Permits\n\nActive\n\nPending Approval\n\nClosed\n\nExpired\n\n========================================================\n\nNEW PERMIT\n\n========================================================\n\nWhen the engineer clicks:\n\n+ NEW PERMIT\n\nshow the permit types.\n\nThe permit types must be based on the official LIFECO forms provided in the uploaded images:\n\n1. WORK PERMIT\n\n2. ELECTRICAL WORK PERMIT\n\n3. SCAFFOLDING PERMIT\n\n4. SAFETY VALVE WORK PERMIT\n\nThese are NOT separate dashboards.\n\nThey are four FORM TYPES inside the current plant.\n\n========================================================\n\nAUTOMATIC PLANT CONTEXT\n\n========================================================\n\nThis is extremely important.\n\nIf the engineer is already inside:\n\nAmmonia Department\n\n→ Ammonia Plant 1\n\nand creates a permit:\n\nDO NOT ask the engineer to manually select the plant again.\n\nAutomatically set:\n\nDepartment = Ammonia Department\n\nPlant = Ammonia Plant 1\n\nThe system must store this automatically.\n\nThe engineer should only select:\n\nArea\n\nEquipment\n\nEquipment Tag\n\nWork Type\n\nPermit Type\n\nWork Description\n\nOther required fields\n\n========================================================\n\nEQUIPMENT CONTEXT\n\n========================================================\n\nIf the engineer starts the permit from an equipment page:\n\nPlant\n\n→ Equipment\n\n→ Create Permit\n\nautomatically set:\n\nDepartment\n\nPlant\n\nArea\n\nEquipment\n\nEquipment Tag\n\nThe engineer must not enter these manually.\n\nExample:\n\nAmmonia Department\n\n→ Ammonia Plant 1\n\n→ Compressor ZR400\n\n→ Create Work Permit\n\nThe form automatically contains:\n\nDepartment:\n\nAmmonia Department\n\nPlant:\n\nAmmonia Plant 1\n\nEquipment:\n\nCompressor ZR400\n\nEquipment Tag:\n\nAutomatically populated\n\nThe engineer completes the remaining permit fields.\n\n========================================================\n\nOFFICIAL LIFECO FORMS\n\n========================================================\n\nUse the uploaded images as the exact source for the four official forms.\n\nThe four forms are:\n\nWORK PERMIT\n\nELECTRICAL WORK PERMIT\n\nSCAFFOLDING PERMIT\n\nSAFETY VALVE WORK PERMIT\n\nDO NOT redesign the official forms.\n\nDO NOT remove fields.\n\nDO NOT simplify questions.\n\nDO NOT merge questions.\n\nDO NOT omit checkboxes.\n\nDO NOT omit PN fields.\n\nDO NOT omit signatures.\n\nDO NOT omit shift sections.\n\nDO NOT omit form numbers.\n\nDO NOT omit revision numbers.\n\nDO NOT omit \"SEE REVERSE SIDE\".\n\nEvery visible field in the reference forms must be represented digitally.\n\n========================================================\n\nFORM ENTRY EXPERIENCE\n\n========================================================\n\nThe engineer opens:\n\nPlant\n\n→ Permits & Work Requests\n\n→ New Permit\n\nSelects:\n\nWORK PERMIT\n\nThen the official LIFECO Work Permit form opens.\n\nThe engineer fills it digitally.\n\nThe form must include all fields from the uploaded image.\n\nThe same applies to:\n\nElectrical Work Permit\n\nScaffolding Permit\n\nSafety Valve Work Permit\n\n========================================================\n\nFORM STATUS\n\n========================================================\n\nEvery permit must have:\n\nDRAFT\n\nSUBMITTED\n\nUNDER REVIEW\n\nAPPROVED\n\nACTIVE\n\nREJECTED\n\nCOMPLETED\n\nCLOSED\n\nCANCELLED\n\nEXPIRED\n\n========================================================\n\nENGINEER WORKFLOW\n\n========================================================\n\nEngineer:\n\n1. Opens Plant.\n\n2. Opens:\n\n   Permits & Work Requests\n\n3. Clicks:\n\n   New Permit\n\n4. Selects permit type.\n\n5. Plant information is automatically populated.\n\n6. Engineer selects equipment.\n\n7. Engineer completes the official LIFECO form.\n\n8. Engineer saves Draft OR submits.\n\n9. The system generates a unique Permit Number.\n\n10. Permit becomes:\n\n    SUBMITTED\n\n11. The appropriate responsible department receives the request.\n\n========================================================\n\nMAINTENANCE WORKFLOW\n\n========================================================\n\nIMPORTANT:\n\nWhen a permit involves maintenance work, DO NOT make the engineer manually send a separate message to Maintenance.\n\nThe platform must automatically create a connected Maintenance Work Request.\n\nExample:\n\nPlant:\n\nAmmonia Plant 1\n\nEquipment:\n\nCompressor ZR400\n\nPermit:\n\nLIFECO-WP-2026-000125\n\nAfter submission:\n\nMaintenance Department\n\n→ Incoming Work Requests\n\nmust receive:\n\nNEW WORK REQUEST\n\nSource:\n\nAmmonia Plant 1\n\nPermit:\n\nLIFECO-WP-2026-000125\n\nEquipment:\n\nCompressor ZR400\n\nWork Description:\n\n[Description from permit]\n\nPriority:\n\n[Priority]\n\nRequested By:\n\n[Engineer]\n\nDate:\n\n[Date]\n\nRequired By:\n\n[Date]\n\nPermit Type:\n\nWork Permit\n\n========================================================\n\nMAINTENANCE RECEIVING SCREEN\n\n========================================================\n\nInside:\n\nMaintenance Department\n\ncreate:\n\nINCOMING WORK\n\nThis is NOT another permit interface.\n\nIt is a maintenance work queue.\n\nShow:\n\nNew Requests\n\nUnder Review\n\nAssigned\n\nIn Progress\n\nWaiting Parts\n\nCompleted\n\nClosed\n\nEach request must show:\n\nWork Request No.\n\nPermit No.\n\nDepartment\n\nPlant\n\nArea\n\nEquipment\n\nEquipment Tag\n\nRequested By\n\nPriority\n\nDescription\n\nDate\n\nStatus\n\n========================================================\n\nMAINTENANCE ACTIONS\n\n========================================================\n\nMaintenance can:\n\nAccept Request\n\nReject Request\n\nAssign Technician\n\nAssign Maintenance Team\n\nSet Priority\n\nSet Planned Date\n\nSet Start Date\n\nSet Completion Date\n\nAdd Work Notes\n\nAdd Spare Parts\n\nAdd Materials\n\nAdd Labor\n\nAdd Photos\n\nAdd Maintenance Report\n\nChange Status\n\nComplete Work\n\nClose Work Request\n\n========================================================\n\nLINK BETWEEN PERMIT AND MAINTENANCE\n\n========================================================\n\nThe permit and maintenance work request must be linked.\n\nExample:\n\nPermit:\n\nLIFECO-WP-2026-000125\n\nLinked Work Request:\n\nLIFECO-MNT-2026-000342\n\nThe user can open either record and see the other.\n\nPermit page:\n\nLinked Maintenance Request\n\n→ LIFECO-MNT-2026-000342\n\nMaintenance page:\n\nSource Permit\n\n→ LIFECO-WP-2026-000125\n\n========================================================\n\nEQUIPMENT HISTORY\n\n========================================================\n\nWhen the maintenance request is completed, automatically update:\n\nPlant\n\n→ Equipment\n\n→ Equipment History\n\nThe equipment history must show:\n\nMaintenance Work\n\nPermits\n\nWork Requests\n\nInspections\n\nFailures\n\nRepairs\n\nParts Used\n\nDocuments\n\nPhotos\n\nReports\n\nExample:\n\nCompressor ZR400\n\History:\n\n2026-08-01\n\nWork Permit\n\nLIFECO-WP-2026-000125\n\n2026-08-01\n\nMaintenance Request\n\nLIFECO-MNT-2026-000342\n\n2026-08-02\n\nMaintenance Completed\n\nThis creates a complete digital history of the equipment.\n\n========================================================\n\nPLANT DASHBOARD LIVE INDICATORS\n\n========================================================\n\nThe plant dashboard must automatically show:\n\nACTIVE PERMITS\n\nPENDING APPROVAL\n\nOPEN MAINTENANCE REQUESTS\n\nWORK IN PROGRESS\n\nEQUIPMENT UNDER MAINTENANCE\n\nCOMPLETED WORK\n\nOVERDUE WORK\n\nSAFETY ALERTS\n\nRECENT ACTIVITIES\n\nThese values must come from the database.\n\nDo NOT use fake static numbers.\n\n========================================================\n\nPLANT ACTIVITY FEED\n\n========================================================\n\nEvery plant must have:\n\nRECENT ACTIVITY\n\nExample:\n\n08:30\n\nEngineer created Work Permit\n\nLIFECO-WP-2026-000125\n\n09:05\n\nMaintenance received Work Request\n\nLIFECO-MNT-2026-000342\n\n09:20\n\nSupervisor approved Permit\n\n10:00\n\nTechnician assigned\n\n11:30\n\nMaintenance started\n\n15:30\n\nMaintenance completed\n\n16:00\n\nPermit closed\n\nThe activity feed must be linked to real database events.\n\n========================================================\n\nNOTIFICATIONS\n\n========================================================\n\nWhen a permit is submitted:\n\nNotify the responsible person.\n\nWhen maintenance receives a request:\n\nNotify Maintenance.\n\nWhen a permit is approved:\n\nNotify the requesting engineer.\n\nWhen work is assigned:\n\nNotify assigned technician.\n\nWhen work is completed:\n\nNotify the engineer / responsible supervisor.\n\nWhen the permit is closed:\n\nUpdate the plant dashboard automatically.\n\n========================================================\n\nSEARCH\n\n========================================================\n\nSearch across the plant by:\n\nPermit Number\n\nWork Request Number\n\nEquipment\n\nEquipment Tag\n\nArea\n\nEmployee\n\nDate\n\nStatus\n\nPermit Type\n\n========================================================\n\nDOCUMENTS\n\n========================================================\n\nDocuments uploaded to a permit must be linked to:\n\nDepartment\n\nPlant\n\nArea\n\nEquipment\n\nPermit\n\nWork Request\n\nAttachments may include:\n\nPDF\n\nPhotos\n\nDrawings\n\nTechnical Documents\n\nMaintenance Reports\n\nInspection Reports\n\n========================================================\n\nPERMIT PDF\n\n========================================================\n\nWhen the user clicks:\n\nVIEW OFFICIAL FORM\n\nshow the completed LIFECO form.\n\nWhen the user clicks:\n\nEXPORT PDF\n\ngenerate the official LIFECO form in A4.\n\nThe PDF must preserve the original form layout.\n\nThe web interface should NOT replace the official form.\n\nThe official form is a document generated from the database.\n\n========================================================\n\nIMPORTANT DISTINCTION\n\n========================================================\n\nThere are TWO different things:\n\n1. SYSTEM UI\n\nThis is the modern 2026 LIFECO platform interface.\n\n2. OFFICIAL FORM\n\nThis is the LIFECO paper permit reproduced digitally.\n\nDO NOT confuse these two.\n\nThe user navigates through the modern platform.\n\nBut when opening the permit, the actual official LIFECO form must appear.\n\n========================================================\n\nNO DUPLICATE DATA\n\n========================================================\n\nDo not create duplicate equipment, plant, department, or user records.\n\nUse the existing LIFECO database entities.\n\nA permit must reference existing:\n\nDepartment ID\n\nPlant ID\n\nArea ID\n\nEquipment ID\n\nUser ID\n\nUse relational references.\n\n========================================================\n\nMULTI-PLANT SUPPORT\n\n========================================================\n\nThe same system must work for every plant.\n\nExample:\n\nAmmonia Department\n\n→ Ammonia Plant 1\n\n→ Permits\n\nAmmonia Department\n\n→ Ammonia Plant 2\n\n→ Permits\n\nUrea Department\n\n→ Urea Plant 1\n\n→ Permits\n\nEvery plant has its own records.\n\nDo not mix records between plants.\n\n========================================================\n\nPERMISSIONS\n\n========================================================\n\nEngineer:\n\nCreate Draft\n\nFill Permit\n\nSubmit Permit\n\nView Own Permits\n\nSupervisor:\n\nReview\n\nApprove\n\nReject\n\nClose\n\nMaintenance:\n\nReceive Work Requests\n\nAssign\n\nSchedule\n\nExecute\n\nComplete\n\nHSE:\n\nReview Safety Permits\n\nMonitor\n\nAudit\n\nClose / Approve according to permissions\n\nAdministrator:\n\nFull access\n\n========================================================\n\nFINAL REQUIRED STRUCTURE\n\n========================================================\n\nThe final navigation should conceptually look like:\n\nLIFECO PLATFORM\n\nDepartments\n\n↓\n\nAmmonia Department\n\n↓\n\nAmmonia Plant 1\n\n↓\n\nPLANT DASHBOARD\n\nOverview\n\nOperations\n\nProcess\n\nEquipment\n\nDocuments\n\nPermits & Work Requests\n\nMaintenance\n\nSafety\n\nReports\n\nHistory\n\n↓\n\nPermits & Work Requests\n\nActive\n\nPending\n\nClosed\n\nHistory\n\n+ New Permit\n\n↓\n\nNew Permit\n\nWork Permit\n\nElectrical Work Permit\n\nScaffolding Permit\n\nSafety Valve Work Permit\n\n↓\n\nEngineer fills official LIFECO form\n\n↓\n\nSUBMIT\n\n↓\n\nMaintenance receives connected Work Request\n\n↓\n\nMaintenance assigns / schedules / executes work\n\n↓\n\nWork Completed\n\n↓\n\nPermit Closed\n\n↓\n\nEquipment History Updated\n\n↓\n\nPlant Dashboard Updated\n\n========================================================\n\nCRITICAL INSTRUCTION\n\n========================================================\n\nDO NOT create a separate standalone Permit Center.\n\nDO NOT create a separate permit dashboard outside the plant.\n\nDO NOT create a new department for permits.\n\nDO NOT make the uploaded forms the main navigation.\n\nThe forms are operational documents that belong INSIDE EACH PLANT.\n\nThe PLANT is the parent.\n\nThe EQUIPMENT is the operational asset.\n\nThe PERMIT is the authorization/work document.\n\nThe MAINTENANCE WORK REQUEST is the execution workflow.\n\nThe EQUIPMENT HISTORY stores the final record.\n\nBuild the system around this relationship.\n\nBefore finishing, verify that the same permit functionality works independently inside every plant without mixing plant records.",
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
