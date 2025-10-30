import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocation(e.latlng); 
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

export default function LocationPicker({ setLocation }) {
  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "10px" }}>
      <MapContainer
        center={[30.7865, 31.0004]} 
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker setLocation={setLocation} />
      </MapContainer>
    </div>
  );
}
