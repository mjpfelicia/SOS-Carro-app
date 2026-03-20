import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

export default function Mapa({ center, prestadores }) {

  // 🛑 proteção contra erro
  if (!center || !center.lat) {
    return <p>Carregando mapa...</p>
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ width: "100%", height: "300px" }}
    >

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {prestadores.map((p, i) => {

        const lat = center.lat + (Math.random() * 0.02)
        const lng = center.lng + (Math.random() * 0.02)

        return (
          <Marker key={i} position={[lat, lng]}>
            <Popup>
              <strong>{p.nome}</strong><br/>
              {p.tipo}
            </Popup>
          </Marker>
        )
      })}

    </MapContainer>
  )
}