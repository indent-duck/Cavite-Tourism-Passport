import { Linking } from 'react-native';

/**
 * Opens the device's maps app at the given coordinates
 * 
 * @param latitude - GPS latitude coordinate
 * @param longitude - GPS longitude coordinate
 * @param label - Optional label for the location (e.g., site or event name)
 * 
 * Tries to open native maps app first using geo: URI,
 * falls back to Google Maps web URL if native app fails.
 */
export async function openInMaps(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const geoUri = `geo:${latitude},${longitude}?q=${encodeURIComponent(label || '')}`;
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  try {
    await Linking.openURL(geoUri);
  } catch {
    // Fallback to Google Maps web URL
    await Linking.openURL(fallbackUrl);
  }
}
