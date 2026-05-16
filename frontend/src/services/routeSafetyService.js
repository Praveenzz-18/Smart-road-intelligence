import { mockLocations, saferRouteBiasPoints } from './mockRouteData'

const EARTH_RADIUS_METERS = 6371000
const ROUTE_PROXIMITY_METERS = 190
const HIGH_DENSITY_THRESHOLD = 4

const severityWeights = {
  low: 6,
  medium: 12,
  severe: 22,
}

export function resolveLocationSync(query) {
  const normalizedQuery = query.trim().toLowerCase()

  const coordinateMatch = normalizedQuery.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/)
  if (coordinateMatch) {
    return {
      name: query.trim(),
      coordinates: [Number(coordinateMatch[1]), Number(coordinateMatch[3])],
    }
  }

  return mockLocations.find((location) => location.name.toLowerCase().includes(normalizedQuery))
}

export async function resolveLocation(query) {
  const syncResult = resolveLocationSync(query)
  if (syncResult) return syncResult

  const fetchNominatim = async (searchQuery) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      const response = await fetch(url)
      const data = await response.json()
      if (data && data.length > 0) {
        return {
          name: data[0].display_name,
          coordinates: [Number(data[0].lat), Number(data[0].lon)]
        }
      }
    } catch (error) {
      console.error("Geocoding failed for", searchQuery, error)
    }
    return null
  }

  // 1. Try full query
  let result = await fetchNominatim(query)
  if (result) return result

  // 2. Fallback: progressively simplify by dropping the first comma-separated part
  if (query.includes(',')) {
    let parts = query.split(',').map((p) => p.trim())
    while (parts.length > 1) {
      parts.shift() // Remove the most specific part (e.g. "Unnamed Road")
      const simplifiedQuery = parts.join(', ')
      result = await fetchNominatim(simplifiedQuery)
      if (result) return result
    }
  }

  return null
}

export function buildSaferWaypoint(source, destination, potholes) {
  const [lat1, lon1] = source
  const [lat2, lon2] = destination

  const midLat = (lat1 + lat2) / 2
  const midLon = (lon1 + lon2) / 2

  const dLat = lat2 - lat1
  const dLon = lon2 - lon1

  const distance = Math.sqrt(dLat * dLat + dLon * dLon)
  if (distance === 0) return [midLat, midLon]

  // Test detours to the left and right at varying distances proportional to the route length.
  const candidates = []
  const scales = [0.15, -0.15, 0.3, -0.3] 
  
  for (const scale of scales) {
    const offsetLat = (-dLon) * scale
    const offsetLon = (dLat) * scale
    candidates.push([midLat + offsetLat, midLon + offsetLon])
  }

  // Find the waypoint that is furthest from the dense pothole clusters
  let bestWaypoint = candidates[0]
  let lowestPenalty = Infinity

  for (const waypoint of candidates) {
    let penalty = 0
    for (const pothole of potholes) {
      const dist = getDistanceMeters(waypoint, [pothole.latitude, pothole.longitude])
      if (dist < 4000) { // Penalize if it's within 4km of a pothole
        const weight = pothole.severity === 'severe' ? 5000 : pothole.severity === 'medium' ? 2000 : 500
        penalty += weight / (dist + 1)
      }
    }
    
    if (penalty < lowestPenalty) {
      lowestPenalty = penalty
      bestWaypoint = waypoint
    }
  }

  return bestWaypoint
}

export function analyzeRoute(routeCoordinates, potholes) {
  if (!routeCoordinates.length) {
    return createEmptyAnalysis()
  }

  const potholesNearRoute = potholes
    .map((pothole) => ({
      ...pothole,
      distanceFromRoute: getDistanceToRouteMeters(
        [pothole.latitude, pothole.longitude],
        routeCoordinates,
      ),
    }))
    .filter((pothole) => pothole.distanceFromRoute <= ROUTE_PROXIMITY_METERS)

  const severeCount = potholesNearRoute.filter((pothole) => pothole.severity === 'severe').length
  const penalty = potholesNearRoute.reduce(
    (total, pothole) => total + severityWeights[pothole.severity],
    0,
  )
  const roadHealthScore = Math.max(0, Math.min(100, 100 - penalty))
  const saferRouteRecommended = potholesNearRoute.length >= HIGH_DENSITY_THRESHOLD || severeCount >= 2

  return {
    potholesNearRoute,
    potholeCount: potholesNearRoute.length,
    severeCount,
    roadHealthScore,
    saferRouteRecommended,
    alertLevel: severeCount > 0 ? 'severe' : potholesNearRoute.length > 0 ? 'warning' : 'clear',
  }
}

function createEmptyAnalysis() {
  return {
    potholesNearRoute: [],
    potholeCount: 0,
    severeCount: 0,
    roadHealthScore: 100,
    saferRouteRecommended: false,
    alertLevel: 'clear',
  }
}

function getDistanceToRouteMeters(point, routeCoordinates) {
  return routeCoordinates.reduce((nearestDistance, coordinate) => {
    const distance = getDistanceMeters(point, coordinate)
    return Math.min(nearestDistance, distance)
  }, Number.POSITIVE_INFINITY)
}

function getDistanceMeters([lat1, lon1], [lat2, lon2]) {
  const latitudeDelta = toRadians(lat2 - lat1)
  const longitudeDelta = toRadians(lon2 - lon1)
  const lat1Radians = toRadians(lat1)
  const lat2Radians = toRadians(lat2)

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(lat1Radians) * Math.cos(lat2Radians) * Math.sin(longitudeDelta / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function toRadians(value) {
  return (value * Math.PI) / 180
}
