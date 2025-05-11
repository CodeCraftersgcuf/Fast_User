// utils/geocode.ts
import axios from "axios";

export async function geocodeAddress(address: string, apiKey: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  const res = await axios.get(url);
  if (res.data.status === "OK") {
    const { lat, lng } = res.data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  }
  return null;
}