const SIMPLE_MODULES: PlantModule[] = [
  { key: "ops-logs", label: "Operations & Records", labelAr: "السجلات والتشغيل" },
  { key: "lab-readings", label: "Lab Readings", labelAr: "قراءات المعمل" },
  { key: "permits", label: "Permits", labelAr: "التصاريح" },
  { key: "maintenance", label: "Maintenance", labelAr: "الصيانة" },
  { key: "safety", label: "Safety", labelAr: "السلامة" },
  { key: "documents", label: "Documents", labelAr: "الوثائق" },
  { key: "reports", label: "Reports", labelAr: "التقارير" },
  { key: "history", label: "History", labelAr: "السجل التاريخي" },
  { key: "general-info", label: "General Information", labelAr: "المعلومات العامة" },
];

export interface PlantModule {
  key: string;
  label: string;
  labelAr?: string;
  route?: string; // when defined, tile navigates here
  icon?: string;
}

// Module catalogs per plant type (Ammonia Department)
const AMMONIA_MODULES: PlantModule[] = SIMPLE_MODULES;
const NITROGEN_MODULES: PlantModule[] = SIMPLE_MODULES;
const DEMIN_MODULES: PlantModule[] = SIMPLE_MODULES;
const PROC_ENG_MODULES: PlantModule[] = SIMPLE_MODULES;
const UREA_MODULES: PlantModule[] = SIMPLE_MODULES;
const WATER_MODULES: PlantModule[] = SIMPLE_MODULES;
const AMMONIA_STORAGE_MODULES: PlantModule[] = SIMPLE_MODULES;
const UREA_LOADING_MODULES: PlantModule[] = SIMPLE_MODULES;
const AMMONIA_LOADING_MODULES: PlantModule[] = SIMPLE_MODULES;

const LAB_AMMONIA_MODULES: PlantModule[] = [
  { key: "lab", label: "Samples & Results", labelAr: "العينات والنتائج" },
];
const LAB_UREA_MODULES: PlantModule[] = [
  { key: "lab", label: "Samples & Results", labelAr: "العينات والنتائج" },
];
const LAB_EQUIPMENT_MODULES: PlantModule[] = [
  { key: "lab-equipment", label: "Laboratory Equipment", labelAr: "معدات المختبر" },
];
const LAB_CHEM_STORE_MODULES: PlantModule[] = [
  { key: "chemical-store", label: "Chemical Store", labelAr: "المخزن الكيميائي" },
];
const LAB_REPORTS_MODULES: PlantModule[] = [
  { key: "lab-reports", label: "Laboratory Reports", labelAr: "تقارير المعمل" },
];

export const SHARED_FEATURES: PlantModule[] = SIMPLE_MODULES;

const MAINT_PLANT_MODULES: PlantModule[] = SIMPLE_MODULES;
const MAINT_PLANNING_MODULES: PlantModule[] = SIMPLE_MODULES;
const MAINT_WORKSHOP_MODULES: PlantModule[] = SIMPLE_MODULES;
const MAINT_WO_MODULES: PlantModule[] = SIMPLE_MODULES;

export const getModulesForPlant = (plantCode: string, departmentKey?: string): PlantModule[] => {
  if (departmentKey === "LAB") {
    if (plantCode === "LAB-EQ") return LAB_EQUIPMENT_MODULES;
    if (plantCode === "LAB-CHEM") return LAB_CHEM_STORE_MODULES;
    if (plantCode === "LAB-AMM") return LAB_AMMONIA_MODULES;
    if (plantCode === "LAB-UREA") return LAB_UREA_MODULES;
    return [{ key: "lab", label: "Samples & Results", labelAr: "العينات والنتائج" }, { key: "lab-reports", label: "Laboratory Reports", labelAr: "تقارير المعمل" }];
  }
  return SIMPLE_MODULES;
};
