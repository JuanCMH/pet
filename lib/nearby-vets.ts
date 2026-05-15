
export type NearbyVet = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;

  schedule: string;
  address: string;
  phone: string;

  distanceMeters: number;
};

const GOOGLE_PLACES_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function fetchNearbyVetsGoogle(
  latitude: number,
  longitude: number,
  radiusMeters: number,
): Promise<NearbyVet[]> {
  if (!GOOGLE_PLACES_KEY) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${latitude},${longitude}` +
    `&radius=${radiusMeters}` +
    `&keyword=veterinaria` +
    `&language=es` +
    `&key=${GOOGLE_PLACES_KEY}`;

  const response = await fetch(url);
  const json = (await response.json()) as {
    results?: Array<{
      place_id: string;
      name: string;
      vicinity?: string;
      rating?: number;
      geometry?: { location?: { lat: number; lng: number } };
      opening_hours?: { open_now?: boolean };
    }>;
    status?: string;
    error_message?: string;
  };

  if (json.status && json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    throw new Error(
      json.error_message ?? `Google Places error: ${json.status}`,
    );
  }

  return (json.results ?? [])
    .map((result) => {
      const lat = result.geometry?.location?.lat ?? latitude;
      const lng = result.geometry?.location?.lng ?? longitude;
      return {
        id: result.place_id,
        name: result.name,
        latitude: lat,
        longitude: lng,
        rating: Math.max(0, Math.min(5, Math.round(result.rating ?? 0))),
        schedule:
          result.opening_hours?.open_now === undefined
            ? "Horario no disponible"
            : result.opening_hours.open_now
              ? "Abierto ahora"
              : "Cerrado ahora",
        address: result.vicinity ?? "",
        phone: "",
        distanceMeters: haversineMeters(latitude, longitude, lat, lng),
      } satisfies NearbyVet;
    })
    .sort((left, right) => left.distanceMeters - right.distanceMeters);
}

async function fetchNearbyVetsOverpass(
  latitude: number,
  longitude: number,
  radiusMeters: number,
): Promise<NearbyVet[]> {

  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="veterinary"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="veterinary"](around:${radiusMeters},${latitude},${longitude});
      relation["amenity"="veterinary"](around:${radiusMeters},${latitude},${longitude});
    );
    out center;
  `.trim();

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!response.ok) {
    throw new Error(`Overpass error: ${response.status}`);
  }
  const json = (await response.json()) as {
    elements?: Array<{
      id: number;
      type: string;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }>;
  };

  return (json.elements ?? [])
    .map((element) => {
      const lat = element.lat ?? element.center?.lat ?? latitude;
      const lng = element.lon ?? element.center?.lon ?? longitude;
      const tags = element.tags ?? {};
      const addressParts = [
        tags["addr:street"],
        tags["addr:housenumber"],
        tags["addr:city"],
      ].filter(Boolean);
      return {
        id: `${element.type}/${element.id}`,
        name: tags.name ?? "Veterinaria",
        latitude: lat,
        longitude: lng,
        rating: 0,
        schedule: tags.opening_hours ?? "Horario no disponible",
        address: addressParts.join(" "),
        phone: tags.phone ?? tags["contact:phone"] ?? "",
        distanceMeters: haversineMeters(latitude, longitude, lat, lng),
      } satisfies NearbyVet;
    })
    .sort((left, right) => left.distanceMeters - right.distanceMeters);
}

function generateFakeVets(
  latitude: number,
  longitude: number,
  count = 6,
): NearbyVet[] {
  const names = [
    "Veterinaria Patitas Felices",
    "Centro Veterinario San Roque",
    "Clínica Animal Care",
    "Veterinaria El Refugio",
    "Pet Doctor 24h",
    "Hospital Veterinario Andino",
    "Veterinaria Mascotas Sanas",
    "VetExpress",
  ];
  return Array.from({ length: count }).map((_, index) => {

    const angle = (index / count) * Math.PI * 2;
    const radiusKm = 0.4 + (index % 3) * 0.4;
    const dLat = (radiusKm / 111) * Math.cos(angle);
    const dLng =
      (radiusKm / (111 * Math.cos((latitude * Math.PI) / 180))) *
      Math.sin(angle);
    const lat = latitude + dLat;
    const lng = longitude + dLng;
    const id = `fake/${index}`;
    return withFakeFallbacks({
      id,
      name: names[index % names.length] as string,
      latitude: lat,
      longitude: lng,
      rating: 0,
      schedule: "",
      address: "",
      phone: "",
      distanceMeters: haversineMeters(latitude, longitude, lat, lng),
    });
  });
}

export async function fetchNearbyVeterinaries(
  latitude: number,
  longitude: number,
  radiusMeters = 2000,
): Promise<NearbyVet[]> {
  let results: NearbyVet[] = [];
  try {
    results = GOOGLE_PLACES_KEY
      ? await fetchNearbyVetsGoogle(latitude, longitude, radiusMeters)
      : await fetchNearbyVetsOverpass(latitude, longitude, radiusMeters);
  } catch {
    results = [];
  }

  if (results.length === 0) {
    return generateFakeVets(latitude, longitude);
  }

  return results
    .map(withFakeFallbacks)
    .sort((left, right) => left.distanceMeters - right.distanceMeters);
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

const FAKE_SCHEDULES = [
  "Lun-Vie 8:00 - 18:00",
  "Lun-Sáb 9:00 - 19:00",
  "Todos los días 8:00 - 20:00",
  "Lun-Vie 7:30 - 17:30 · Sáb 9:00 - 13:00",
  "24 horas",
] as const;

const FAKE_STREETS = [
  "Calle 85",
  "Carrera 11",
  "Avenida Caracas",
  "Calle 100",
  "Carrera 7",
  "Calle 134",
  "Avenida 19",
  "Carrera 15",
] as const;

const FAKE_NEIGHBORHOODS = [
  "Chapinero",
  "Usaquén",
  "Cedritos",
  "Chicó",
  "Rosales",
  "La Castellana",
  "Salitre",
  "Modelia",
] as const;

function hashString(input: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

function pickFrom<T>(items: readonly T[], seed: number) {
  return items[seed % items.length] as T;
}

function fakePhone(seed: number) {
  const base = 3000000000 + (seed % 999999999);
  const value = base.toString().padStart(10, "0");
  return `+57 ${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
}

function fakeRating(seed: number) {

  return 3 + (seed % 3);
}

function fakeAddress(seed: number) {
  const street = pickFrom(FAKE_STREETS, seed);
  const number = 10 + ((seed >>> 3) % 180);
  const neighborhood = pickFrom(FAKE_NEIGHBORHOODS, seed >>> 5);
  return `${street} # ${number} - ${(seed >>> 7) % 99}, ${neighborhood}`;
}

function withFakeFallbacks(vet: NearbyVet): NearbyVet {
  const seed = hashString(vet.id);
  return {
    ...vet,
    rating: vet.rating > 0 ? vet.rating : fakeRating(seed),
    schedule:
      vet.schedule && vet.schedule !== "Horario no disponible"
        ? vet.schedule
        : pickFrom(FAKE_SCHEDULES, seed >>> 2),
    phone: vet.phone && vet.phone.length > 0 ? vet.phone : fakePhone(seed),
    address:
      vet.address && vet.address.trim().length > 0
        ? vet.address
        : fakeAddress(seed),
  };
}
