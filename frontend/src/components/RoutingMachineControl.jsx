import L from 'leaflet'
import 'leaflet-routing-machine'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

function RoutingMachineControl({ waypoints, color, visible, onRouteFound }) {
  const map = useMap()

  useEffect(() => {
    if (!visible || waypoints.length < 2) {
      return undefined
    }

    const control = L.Routing.control({
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      lineOptions: {
        styles: [{ color, opacity: 0.86, weight: 6 }],
      },
      routeWhileDragging: false,
      show: false,
      showAlternatives: false,
      waypoints: waypoints.map((waypoint) => L.latLng(waypoint[0], waypoint[1])),
      createMarker: () => null,
    }).addTo(map)

    control.on('routesfound', (event) => {
      const coordinates = event.routes[0]?.coordinates?.map((coordinate) => [
        coordinate.lat,
        coordinate.lng,
      ])

      if (coordinates?.length) {
        onRouteFound(coordinates)
        map.fitBounds(L.latLngBounds(coordinates), { padding: [28, 28] })
      }
    })

    return () => {
      map.removeControl(control)
    }
  }, [color, map, onRouteFound, visible, waypoints])

  return null
}

export default RoutingMachineControl
