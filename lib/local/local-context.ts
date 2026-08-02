export interface DistrictSupportInfo {
  district: string;
  state: "Telangana" | "Andhra Pradesh";
  primaryCrops: string[];
  meesevaHint: string;
  hospitalHint: string;
  marketHint: string;
}

export const districtSupportData: DistrictSupportInfo[] = [
  // Telangana Districts
  {
    district: "Warangal",
    state: "Telangana",
    primaryCrops: ["Cotton", "Paddy", "Chilli", "Maize"],
    meesevaHint: "MeeSeva centres available in Hanamkonda and Warangal town mandals.",
    hospitalHint: "Nearest district referral hospitals are MGM Hospital in Warangal.",
    marketHint: "Enquire daily arrivals and prices in Enumamula market yard.",
  },
  {
    district: "Karimnagar",
    state: "Telangana",
    primaryCrops: ["Paddy", "Maize", "Turmeric", "Cotton"],
    meesevaHint: "MeeSeva centres operate in Karimnagar urban and major mandal headquarters.",
    hospitalHint: "District Government Hospital Karimnagar serves all surrounding mandals.",
    marketHint: "Check regulated market rates for paddy and turmeric before sale.",
  },
  {
    district: "Nalgonda",
    state: "Telangana",
    primaryCrops: ["Paddy", "Cotton", "Red gram", "Chilli"],
    meesevaHint: "MeeSeva service points are available across Nalgonda mandals.",
    hospitalHint: "District General Hospital services are concentrated in Nalgonda town.",
    marketHint: "Compare local mandi rates with nearby Miryalaguda paddy market.",
  },
  {
    district: "Khammam",
    state: "Telangana",
    primaryCrops: ["Chilli", "Cotton", "Paddy", "Mango"],
    meesevaHint: "MeeSeva centres are available in Khammam urban and Wyra mandal hubs.",
    hospitalHint: "District Government Headquarters Hospital is located in Khammam town.",
    marketHint: "Monitor Chilli price rates at the Khammam Agriculture Market Yard.",
  },
  {
    district: "Nizamabad",
    state: "Telangana",
    primaryCrops: ["Paddy", "Soybean", "Turmeric", "Sugarcane"],
    meesevaHint: "MeeSeva points are located in Nizamabad urban, Bodhan and Armoor.",
    hospitalHint: "Nizamabad Government Medical College & Hospital serves the area.",
    marketHint: "Check turmeric rates in Nizamabad market yard, one of the state's largest.",
  },
  {
    district: "Mahabubnagar",
    state: "Telangana",
    primaryCrops: ["Groundnut", "Paddy", "Castor", "Cotton"],
    meesevaHint: "MeeSeva centres serve Mahabubnagar town and Jadcherla mandal.",
    hospitalHint: "Government General Hospital Mahabubnagar provides 24/7 emergency care.",
    marketHint: "Verify Groundnut minimum support price (MSP) at Badepally market yard.",
  },
  {
    district: "Medak",
    state: "Telangana",
    primaryCrops: ["Paddy", "Maize", "Cotton", "Sugarcane"],
    meesevaHint: "MeeSeva centres are active in Medak town, Toopran, and Narsapur.",
    hospitalHint: "Medak District Area Hospital is the primary referral point.",
    marketHint: "Medak and Tupran market yards report daily grain price arrivals.",
  },
  {
    district: "Adilabad",
    state: "Telangana",
    primaryCrops: ["Cotton", "Soybean", "Paddy", "Red gram"],
    meesevaHint: "MeeSeva services are available in Adilabad town and Utnoor mandal.",
    hospitalHint: "RIMS Adilabad (Rajiv Gandhi Institute of Medical Sciences) is the main hospital.",
    marketHint: "Adilabad cotton market yard offers competitive prices for BT Cotton.",
  },
  {
    district: "Rangareddy",
    state: "Telangana",
    primaryCrops: ["Vegetables", "Maize", "Paddy", "Red Gram"],
    meesevaHint: "MeeSeva centers are located in Chevella, Ibrahimpatnam and Shadnagar.",
    hospitalHint: "Referral facilities are available in Hyderabad and Shadnagar Area Hospital.",
    marketHint: "Shadnagar and Vikarabad market yards are popular for pulse sales.",
  },
  {
    district: "Suryapet",
    state: "Telangana",
    primaryCrops: ["Paddy", "Cotton", "Chilli", "Greengram"],
    meesevaHint: "MeeSeva points operate in Suryapet, Kodad, and Huzurnagar.",
    hospitalHint: "Suryapet Government General Hospital offers full referral services.",
    marketHint: "Suryapet market yard is a major hub for paddy and greengram sales.",
  },

  // Andhra Pradesh Districts
  {
    district: "Guntur",
    state: "Andhra Pradesh",
    primaryCrops: ["Chilli", "Cotton", "Paddy", "Tobacco"],
    meesevaHint: "MeeSeva/eSeva centres available in Guntur city and mandal centers.",
    hospitalHint: "Government General Hospital (GGH) in Guntur serves nearby mandals.",
    marketHint: "Track Guntur Chilli Yard rates frequently due to high market volatility.",
  },
  {
    district: "Krishna",
    state: "Andhra Pradesh",
    primaryCrops: ["Paddy", "Sugarcane", "Maize", "Banana"],
    meesevaHint: "MeeSeva counters are accessible in Machilipatnam and Vijayawada mandals.",
    hospitalHint: "GGH Vijayawada and local community health centers serve rural Krishna.",
    marketHint: "Check government paddy procurement details at nearest Rythu Bharosa Kendra (RBK).",
  },
  {
    district: "Anantapur",
    state: "Andhra Pradesh",
    primaryCrops: ["Groundnut", "Millets", "Cotton", "Sweet Orange"],
    meesevaHint: "MeeSeva centres are available in Anantapur municipal and Gooty mandal hubs.",
    hospitalHint: "Government General Hospital Anantapur provides specialized maternal care.",
    marketHint: "Monitor groundnut price arrivals at Hindupur and Anantapur market yards.",
  },
  {
    district: "East Godavari",
    state: "Andhra Pradesh",
    primaryCrops: ["Paddy", "Coconut", "Banana", "Tapioca"],
    meesevaHint: "MeeSeva centers operate in Rajamahendravaram and Kakinada mandals.",
    hospitalHint: "Government General Hospital Kakinada and Rajahmundry District Hospital.",
    marketHint: "Rajahmundry and Ravulapalem are key trading yards for banana and coconut.",
  },
  {
    district: "West Godavari",
    state: "Andhra Pradesh",
    primaryCrops: ["Paddy", "Sugarcane", "Oil Palm", "Maize"],
    meesevaHint: "MeeSeva centers available in Eluru, Bhimavaram, and Tadepalligudem.",
    hospitalHint: "District Headquarters Hospital is located in Eluru.",
    marketHint: "Tadepalligudem market is highly active for paddy and horticultural crops.",
  },
  {
    district: "Chittoor",
    state: "Andhra Pradesh",
    primaryCrops: ["Groundnut", "Sugarcane", "Mango", "Tomato"],
    meesevaHint: "MeeSeva centers serve Chittoor town, Madanapalle and Kuppam.",
    hospitalHint: "Chittoor Government Hospital and SVIMS Tirupati offer emergency care.",
    marketHint: "Madanapalle tomato market yard is one of the largest in Asia.",
  },
  {
    district: "Kurnool",
    state: "Andhra Pradesh",
    primaryCrops: ["Cotton", "Groundnut", "Paddy", "Onion"],
    meesevaHint: "MeeSeva points are located in Kurnool city, Nandyal and Adoni.",
    hospitalHint: "Government General Hospital Kurnool is the premier healthcare center.",
    marketHint: "Adoni cotton market yard and Kurnool onion market have regular auctions.",
  },
  {
    district: "Visakhapatnam",
    state: "Andhra Pradesh",
    primaryCrops: ["Paddy", "Sugarcane", "Millets", "Coffee"],
    meesevaHint: "MeeSeva centers serve Visakhapatnam urban and Anakapalli rural mandals.",
    hospitalHint: "King George Hospital (KGH) Visakhapatnam is the major referral center.",
    marketHint: "Anakapalli market yard is famous for sugarcane and jaggery trading.",
  },
  {
    district: "Kadapa",
    state: "Andhra Pradesh",
    primaryCrops: ["Banana", "Turmeric", "Bengal Gram", "Groundnut"],
    meesevaHint: "MeeSeva service points are active in Kadapa, Proddatur and Pulivendula.",
    hospitalHint: "Rajiv Gandhi Institute of Medical Sciences (RIMS) Kadapa serves the public.",
    marketHint: "Kadapa and Proddatur yards report daily turmeric and gram pricing.",
  },
  {
    district: "Nellore",
    state: "Andhra Pradesh",
    primaryCrops: ["Paddy", "Sugarcane", "Cotton", "Citrus Fruits"],
    meesevaHint: "MeeSeva hubs operate in Nellore urban, Gudur and Kavali.",
    hospitalHint: "Government General Hospital Nellore offers advanced emergency services.",
    marketHint: "Nellore is a prominent hub for high-quality rice trading.",
  }
];

export const emergencyContacts = {
  ambulance: "108",
  healthHelpline: "104",
  womenHelpline: "181",
  police: "100",
  farmerCallCenter: "1800-180-1551",
};

export const findDistrictContext = (district: string): DistrictSupportInfo | null => {
  const normalized = district.trim().toLowerCase();
  return (
    districtSupportData.find((item) => item.district.toLowerCase() === normalized) ?? null
  );
};
