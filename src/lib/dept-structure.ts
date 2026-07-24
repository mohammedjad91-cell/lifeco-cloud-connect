// Department → sub-plants → modules taxonomy (from official LIFECO spec).
// Used by DepartmentHome to render the entry hub for every department.

export interface DeptModule {
  key: string;
  label: string;
  // If set, opening this module switches the active dashboard department id
  // (e.g. AMMONIA → AMM1) so existing Operations/Assets/Reports UI keeps working.
  targetDept?: string;
  // Tab to auto-select inside the dashboard body when opening ("operations" is default).
  tab?: "logs" | "fieldOps" | "labReadings" | "assets" | "nitrogen" | "report" | "ots" | "analytics";
}

export interface DeptPlant {
  key: string;
  label: string;
  icon?: string; // lucide icon name
  modules: DeptModule[];
}

const std = (targetDept?: string): DeptModule[] => [
  { key: "operations",  label: "Operations",         targetDept, tab: "logs" },
  { key: "equipment",   label: "Equipment",          targetDept, tab: "assets" },
  { key: "maintenance", label: "Maintenance",        targetDept, tab: "assets" },
  { key: "laboratory",  label: "Laboratory",         targetDept, tab: "labReadings" },
  { key: "process",     label: "Process Engineering" },
  { key: "documents",   label: "Documents" },
  { key: "reports",     label: "Reports",            targetDept, tab: "report" },
  { key: "spares",      label: "Spare Parts" },
  { key: "drawings",    label: "Drawings" },
  { key: "photos",      label: "Photos" },
];

export const DEPT_STRUCTURE: Record<string, DeptPlant[]> = {
  AMMONIA: [
    { key: "AMM1", label: "AMMONIA PLANT 1", icon: "Factory", modules: std("AMM1") },
    { key: "AMM2", label: "AMMONIA PLANT 2", icon: "Factory", modules: std("AMM2") },
    {
      key: "NITROGEN", label: "Nitrogen Plant", icon: "Wind",
      modules: [
        { key: "operations",  label: "Operations",         targetDept: "NITROGEN", tab: "logs" },
        { key: "equipment",   label: "Equipment",          targetDept: "NITROGEN", tab: "assets" },
        { key: "maintenance", label: "Maintenance",        targetDept: "NITROGEN", tab: "assets" },
        { key: "process",     label: "Process Engineering" },
        { key: "documents",   label: "Documents" },
        { key: "reports",     label: "Reports",            targetDept: "NITROGEN", tab: "report" },
        { key: "n2sheets",    label: "N₂ Log Sheets",      targetDept: "NITROGEN", tab: "nitrogen" },
      ],
    },
    {
      key: "DEMIN1", label: "DEMIN Plant 1", icon: "Droplets",
      modules: [
        { key: "operations",  label: "Operations",   targetDept: "DEMIN1", tab: "logs" },
        { key: "equipment",   label: "Equipment",    targetDept: "DEMIN1", tab: "assets" },
        { key: "maintenance", label: "Maintenance",  targetDept: "DEMIN1", tab: "assets" },
        { key: "water",       label: "Water Quality",targetDept: "DEMIN1", tab: "labReadings" },
        { key: "reports",     label: "Reports",      targetDept: "DEMIN1", tab: "report" },
      ],
    },
    {
      key: "DEMIN2", label: "DEMIN Plant 2", icon: "Droplets",
      modules: [
        { key: "operations",  label: "Operations",   targetDept: "DEMIN2", tab: "logs" },
        { key: "equipment",   label: "Equipment",    targetDept: "DEMIN2", tab: "assets" },
        { key: "maintenance", label: "Maintenance",  targetDept: "DEMIN2", tab: "assets" },
        { key: "water",       label: "Water Quality",targetDept: "DEMIN2", tab: "labReadings" },
        { key: "reports",     label: "Reports",      targetDept: "DEMIN2", tab: "report" },
      ],
    },
    {
      key: "PROCESS", label: "Process Engineering", icon: "GitBranch",
      modules: [
        { key: "pfd",        label: "PFD" },
        { key: "pid",        label: "P&ID" },
        { key: "sop",        label: "SOP" },
        { key: "calc",       label: "Calculations" },
        { key: "eng",        label: "Engineering Reports" },
        { key: "ops-proc",   label: "Operating Procedures" },
        { key: "shutdown",   label: "Shutdown Procedures" },
      ],
    },
  ],
  UREA: [
    { key: "UREA1", label: "UREA PLANT 1", icon: "Factory", modules: [
      { key: "operations", label: "Operations" }, { key: "equipment", label: "Equipment" },
      { key: "maintenance", label: "Maintenance" }, { key: "laboratory", label: "Laboratory" },
      { key: "documents", label: "Documents" }, { key: "reports", label: "Reports" },
    ]},
    { key: "UREA2", label: "UREA PLANT 2", icon: "Factory", modules: [
      { key: "operations", label: "Operations" }, { key: "equipment", label: "Equipment" },
      { key: "maintenance", label: "Maintenance" }, { key: "laboratory", label: "Laboratory" },
      { key: "documents", label: "Documents" }, { key: "reports", label: "Reports" },
    ]},
    { key: "WATER", label: "Water Treatment", icon: "Droplets", modules: [
      { key: "equipment", label: "Equipment" }, { key: "maintenance", label: "Maintenance" }, { key: "reports", label: "Reports" },
    ]},
    { key: "NH3TANKS", label: "Ammonia Storage Tanks", icon: "Container", modules: [
      { key: "status", label: "Tank Status" }, { key: "pressure", label: "Pressure" },
      { key: "temperature", label: "Temperature" }, { key: "level", label: "Level" },
      { key: "inspection", label: "Inspection" }, { key: "maintenance", label: "Maintenance" },
    ]},
    { key: "UREA_LOAD", label: "Urea Loading", icon: "Truck", modules: [
      { key: "schedule", label: "Loading Schedule" }, { key: "trucks", label: "Trucks" }, { key: "reports", label: "Reports" },
    ]},
    { key: "NH3_LOAD", label: "Ammonia Loading", icon: "Truck", modules: [
      { key: "schedule", label: "Loading Schedule" }, { key: "trucks", label: "Trucks" }, { key: "reports", label: "Reports" },
    ]},
    { key: "PROCESS", label: "Process Engineering", icon: "GitBranch", modules: [
      { key: "pfd", label: "PFD" }, { key: "pid", label: "P&ID" }, { key: "sop", label: "SOP" },
      { key: "reports", label: "Reports" }, { key: "docs", label: "Engineering Documents" },
    ]},
  ],
  LAB: [
    { key: "NH3LAB", label: "Ammonia Laboratory", icon: "FlaskConical", modules: [
      { key: "register", label: "Sample Registration" }, { key: "analysis", label: "Analysis" },
      { key: "certificates", label: "Certificates" }, { key: "equipment", label: "Equipment" }, { key: "reports", label: "Reports" },
    ]},
    { key: "UREALAB", label: "Urea Laboratory", icon: "FlaskConical", modules: [
      { key: "register", label: "Sample Registration" }, { key: "analysis", label: "Analysis" },
      { key: "certificates", label: "Certificates" }, { key: "equipment", label: "Equipment" }, { key: "reports", label: "Reports" },
    ]},
    { key: "LABEQ", label: "Laboratory Equipment", icon: "Wrench", modules: [
      { key: "calibration", label: "Calibration" }, { key: "maintenance", label: "Maintenance" }, { key: "manuals", label: "Manuals" },
    ]},
    { key: "CHEMSTORE", label: "Chemical Store", icon: "Beaker", modules: [
      { key: "chemicals", label: "Chemicals" }, { key: "sds", label: "SDS" }, { key: "inventory", label: "Inventory" },
    ]},
  ],
  MAINTENANCE: [
    { key: "NH3MNT", label: "Ammonia Maintenance", icon: "Wrench", modules: [
      { key: "mech", label: "Mechanical" }, { key: "elec", label: "Electrical" },
      { key: "inst", label: "Instrumentation" }, { key: "civil", label: "Civil" },
    ]},
    { key: "UREAMNT", label: "Urea Maintenance", icon: "Wrench", modules: [
      { key: "mech", label: "Mechanical" }, { key: "elec", label: "Electrical" },
      { key: "inst", label: "Instrumentation" }, { key: "civil", label: "Civil" },
    ]},
    { key: "WORKSHOP", label: "Workshop", icon: "Hammer", modules: [
      { key: "machines", label: "Machines" }, { key: "welding", label: "Welding" }, { key: "fab", label: "Fabrication" },
    ]},
    { key: "SHUTDOWN", label: "Shutdown Management", icon: "Power", modules: [
      { key: "planning", label: "Planning" }, { key: "activities", label: "Activities" },
      { key: "resources", label: "Resources" }, { key: "reports", label: "Reports" },
    ]},
  ],
  WAREHOUSE: [
    { key: "MECH", label: "Mechanical Spare Parts", icon: "Cog", modules: [{ key: "list", label: "Inventory" }] },
    { key: "ELEC", label: "Electrical Spare Parts", icon: "Zap", modules: [{ key: "list", label: "Inventory" }] },
    { key: "INST", label: "Instrument Spare Parts", icon: "Gauge", modules: [{ key: "list", label: "Inventory" }] },
    { key: "SAFETY", label: "Safety Equipment", icon: "ShieldCheck", modules: [{ key: "list", label: "Inventory" }] },
    { key: "LUBE", label: "Lubricants", icon: "Droplet", modules: [{ key: "list", label: "Inventory" }] },
    { key: "CHEM", label: "Chemicals", icon: "Beaker", modules: [{ key: "list", label: "Inventory" }] },
    { key: "CONS", label: "Consumables", icon: "Package", modules: [{ key: "list", label: "Inventory" }] },
    { key: "ELECTRONIC", label: "Electronic Spare Parts Request", icon: "Cpu", modules: [{ key: "request", label: "New Request" }] },
    { key: "SUPPLIERS", label: "Suppliers", icon: "Users", modules: [{ key: "list", label: "Suppliers" }] },
  ],
};
