import { AppLanguage } from "@/types/assistant";

interface GeocodeResult {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
}

interface WeatherResult {
  place: string;
  temperatureC: number;
  rainProbability: number;
  humidity: number;
  windSpeed: number;
  farmingAdvice: string;
}

const getFarmingAdvice = (
  rainProbability: number,
  humidity: number,
  windSpeed: number,
  language: AppLanguage
): string => {
  if (language === "en") {
    if (rainProbability > 60) {
      return "High rain chance: avoid immediate pesticide spraying, improve drainage, and protect harvested produce.";
    }
    if (humidity > 75) {
      return "High humidity: monitor fungal diseases, improve spacing and airflow in crops.";
    }
    if (windSpeed > 25) {
      return "Strong winds: support tall crops and avoid foliar sprays during peak winds.";
    }
    return "Weather is relatively stable: continue planned irrigation and monitor local field conditions.";
  }

  if (rainProbability > 60) {
    return "వర్షం వచ్చే అవకాశం ఎక్కువగా ఉంది: వెంటనే స్ప్రే చేయకండి, నీరు నిల్వ కాకుండా డ్రెయినేజ్ మెరుగుపరచండి.";
  }
  if (humidity > 75) {
    return "ఆర్ద్రత ఎక్కువగా ఉంది: ఫంగల్ వ్యాధుల పర్యవేక్షణ చేయండి, గాలి ప్రసరణ మెరుగుపరచండి.";
  }
  if (windSpeed > 25) {
    return "గాలి వేగం ఎక్కువగా ఉంది: పొడవైన పంటలకు మద్దతు ఇవ్వండి, స్ప్రేలను నివారించండి.";
  }
  return "వాతావరణం స్థిరంగా ఉంది: షెడ్యూల్ ప్రకారం నీరుపారుదల కొనసాగించండి.";
};

const geocodePlace = async (location: string): Promise<GeocodeResult> => {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    location
  )}&count=1&language=en&format=json`;
  const response = await fetch(geoUrl);
  if (!response.ok) {
    throw new Error("Failed to resolve location");
  }

  const data = (await response.json()) as {
    results?: Array<{ latitude: number; longitude: number; name: string; country?: string }>;
  };
  const first = data.results?.[0];
  if (!first) {
    throw new Error("Location not found");
  }

  return {
    latitude: first.latitude,
    longitude: first.longitude,
    name: first.name,
    country: first.country,
  };
};

export const getWeatherAdvisory = async (
  location: string,
  language: AppLanguage
): Promise<WeatherResult> => {
  const geo = await geocodePlace(location);
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&hourly=relative_humidity_2m,precipitation_probability,wind_speed_10m&current=temperature_2m,wind_speed_10m&timezone=auto&forecast_days=1`;
  const response = await fetch(weatherUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  const data = (await response.json()) as {
    current?: { temperature_2m?: number; wind_speed_10m?: number };
    hourly?: {
      relative_humidity_2m?: number[];
      precipitation_probability?: number[];
      wind_speed_10m?: number[];
    };
  };

  const temperatureC = data.current?.temperature_2m ?? 0;
  const rainProbability = data.hourly?.precipitation_probability?.[0] ?? 0;
  const humidity = data.hourly?.relative_humidity_2m?.[0] ?? 0;
  const windSpeed = data.current?.wind_speed_10m ?? data.hourly?.wind_speed_10m?.[0] ?? 0;

  return {
    place: `${geo.name}${geo.country ? `, ${geo.country}` : ""}`,
    temperatureC,
    rainProbability,
    humidity,
    windSpeed,
    farmingAdvice: getFarmingAdvice(rainProbability, humidity, windSpeed, language),
  };
};
