import { KnowledgeDocument } from "@/types/assistant";

export const knowledgeBase: KnowledgeDocument[] = [
  {
    id: "agri-soil-paddy",
    domain: "agriculture",
    title: "Paddy planning basics",
    tags: ["paddy", "fertilizer", "irrigation", "soil"],
    content:
      "For paddy cultivation, test soil before sowing. Use nitrogen in split doses to reduce loss. Keep standing water shallow during early growth and avoid continuous flooding when unnecessary. Watch for leaf folder and stem borer signs and consult local agriculture extension officers for spray schedules.",
  },
  {
    id: "agri-pest-ipm",
    domain: "agriculture",
    title: "Integrated pest management",
    tags: ["pest", "disease", "ipm", "prevention"],
    content:
      "Use Integrated Pest Management: field sanitation, resistant seeds, pheromone traps, and targeted pesticide use only when economic threshold is crossed. Avoid repeated use of the same chemical group to reduce resistance. For leaf diseases, remove heavily infected leaves and improve field ventilation.",
  },
  {
    id: "agri-seasonal-planning",
    domain: "agriculture",
    title: "Seasonal crop planning",
    tags: ["seasonal", "crop recommendation", "rain", "market"],
    content:
      "Select crops based on rainfall pattern, irrigation availability, and local market demand. During low rainfall periods, prefer short-duration and drought-tolerant crops. Track mandi prices weekly and stagger harvest dates when possible to avoid distress selling.",
  },
  {
    id: "gov-pm-kisan",
    domain: "government",
    title: "PM-KISAN overview",
    tags: ["pm-kisan", "farmer", "income support", "eligibility"],
    content:
      "PM-KISAN provides annual income support to eligible farmer families in installments. Applicant should have cultivable land records and valid Aadhaar-linked details. Exclusion criteria include institutional landholders and certain higher-income public office categories.",
  },
  {
    id: "gov-pension-basic",
    domain: "government",
    title: "Senior pension baseline guidance",
    tags: ["pension", "senior citizen", "age", "income"],
    content:
      "Old-age pension programs usually prioritize senior citizens from low-income households. Documents often include Aadhaar, age proof, income certificate, bank passbook, and domicile evidence. Scheme specifics vary by state and district portals.",
  },
  {
    id: "gov-documents-common",
    domain: "government",
    title: "Common scheme documents",
    tags: ["aadhaar", "income certificate", "ration", "documents"],
    content:
      "Common documents for welfare schemes include Aadhaar, ration card, income certificate, caste certificate (if applicable), residence proof, and bank account details. Applicants should verify latest checklists from official MeeSeva or district websites before submission.",
  },
  {
    id: "health-primary-care",
    domain: "healthcare",
    title: "Primary symptom guidance",
    tags: ["symptoms", "fever", "hydration", "doctor"],
    content:
      "For mild fever and cold symptoms, rest, hydration, and medical advice from a licensed doctor are recommended. If symptoms persist beyond 2-3 days, worsen rapidly, or include breathing difficulty, chest pain, confusion, or dehydration signs, seek urgent medical care.",
  },
  {
    id: "health-emergency-signs",
    domain: "healthcare",
    title: "Emergency warning signs",
    tags: ["emergency", "hospital", "warning", "urgent"],
    content:
      "Emergency signs include severe chest pain, stroke-like weakness, seizures, heavy bleeding, high fever in infants, persistent vomiting, and breathing trouble. In these cases, do not rely on AI advice alone; contact emergency services or visit the nearest hospital immediately.",
  },
  {
    id: "health-medicine-safety",
    domain: "healthcare",
    title: "Medicine safety disclaimer",
    tags: ["medicine", "dosage", "disclaimer", "safety"],
    content:
      "AI guidance cannot replace medical diagnosis. Never start, stop, or change medicine dosage solely based on AI output. Confirm medicine interactions, dosage, and contraindications with qualified healthcare professionals.",
  },
];
