import { mockLocations, saferRouteBiasPoints } from './mockRouteData'

const EARTH_RADIUS_METERS = 6371000
const ROUTE_PROXIMITY_METERS = 190
const HIGH_DENSITY_THRESHOLD = 4

const severityWeights = {
  low: 6,
  medium: 12,
  severe: 22,
}

export function resolveLocation(query) {
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

export function buildSaferWaypoint(source, destination) {
  const midPoint = [
    (source[0] + destination[0]) / 2,
    (source[1] + destination[1]) / 2,
  ]

  return saferRouteBiasPoints.reduce((nearest, point) => {
    const nearestDistance = getDistanceMeters(midPoint, nearest)
    const pointDistance = getDistanceMeters(midPoint, point)
    return pointDistance < nearestDistance ? point : nearest
  }, saferRouteBiasPoints[0])
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
