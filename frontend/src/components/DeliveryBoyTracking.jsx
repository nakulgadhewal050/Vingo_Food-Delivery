import React from 'react'
import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { MapContainer, Polyline, Popup } from 'react-leaflet';
import { TileLayer } from 'react-leaflet';
import { Marker } from 'react-leaflet';

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
})
const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
})

function DeliveryBoyTracking({ data }) {

  const deliveryBoyLat = data.deliveryBoyLocation?.lat
  const deliveryBoyLon = data.deliveryBoyLocation?.lon
  const custsomerLat = data.customerLocation?.lat
  const custsomerLon = data.customerLocation?.lon

  const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [custsomerLat, custsomerLon]
  ]

  const center = [deliveryBoyLat, deliveryBoyLon]

  return (
    <div className='w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md'>
      <MapContainer className={'w-full h-full'}
        center={center}
        zoom={13}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[deliveryBoyLat, deliveryBoyLon]} icon={deliveryBoyIcon}>
        <Popup>Delivery Boy</Popup>
        </Marker>
        <Marker position={[custsomerLat, custsomerLon]} icon={customerIcon}>
        <Popup>Delivery Boy</Popup>
        </Marker>

        <Polyline positions={path} color='blue' weight={5}>

        </Polyline>

      </MapContainer>
    </div>
  )
}

export default DeliveryBoyTracking