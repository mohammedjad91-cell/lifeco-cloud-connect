export const LAB_SOURCES = {
  NITROGEN: {
    id: "NITROGEN",
    plant: "N2-1",
    area: "NITROGEN GENERATION",
    sampleTypes: ["Nitrogen Process Sample", "Nitrogen Product Sample", "Other / Pending Verification"],
    points: ["60-AL-003", "60-AT-001", "PSA Unit Outlet", "Air Receiver Outlet"],
    parameters: [
      { name: "Oxygen Content in N2", unit: "ppm", spec: "< 5-10" },
      { name: "Nitrogen Purity", unit: "%", spec: "99.99" },
      { name: "Dew Point", unit: "°C", spec: "-40 to -60" },
      { name: "Instrument Air Moisture", unit: "°C", spec: "<-40" }
    ]
  },
  AMM1: {
    id: "AMM1",
    plant: "AMMONIA PLANT 1",
    area: "AMMONIA PRODUCTION",
    sampleTypes: ["Process Sample", "Product Sample", "Other / Pending Verification"],
    points: ["Synthesis Loop", "Reformer Outlet", "Separator"],
    parameters: [
      { name: "NH3 Concentration", unit: "%", spec: "> 99.5" },
      { name: "Moisture", unit: "ppm", spec: "< 100" },
      { name: "Oil Content", unit: "ppm", spec: "< 5" }
    ]
  },
  AMM2: {
    id: "AMM2",
    plant: "AMMONIA PLANT 2",
    area: "AMMONIA PRODUCTION",
    sampleTypes: ["Process Sample", "Product Sample", "Other / Pending Verification"],
    points: ["Synthesis Loop", "Reformer Outlet", "Separator"],
    parameters: [
      { name: "NH3 Concentration", unit: "%", spec: "> 99.5" },
      { name: "Moisture", unit: "ppm", spec: "< 100" },
      { name: "Oil Content", unit: "ppm", spec: "< 5" }
    ]
  },
  AMM_STORAGE: {
    id: "AMM_STORAGE",
    plant: "AMMONIA STORAGE",
    area: "STORAGE TANKS",
    sampleTypes: ["Storage Sample", "Product Sample", "Other / Pending Verification"],
    points: ["Tank A", "Tank B", "Loading Line"],
    parameters: [
      { name: "Temperature", unit: "°C", spec: "-33" },
      { name: "Pressure", unit: "bar", spec: "Atmospheric" },
      { name: "Purity", unit: "%", spec: "99.9" }
    ]
  }
};
