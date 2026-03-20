import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

export default function Mapa({ center, prestadores }) {
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

      {prestadores.map((prestador) => (
        <Marker key={prestador.id} position={[prestador.lat, prestador.lng]}>
          <Popup>
            <strong>{prestador.nome}</strong>
            <br />
            {prestador.tipo}
            <br />
            {prestador.cidade}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
