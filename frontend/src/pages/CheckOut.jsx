import React, { useEffect, useState } from 'react'
import { IoArrowBackSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { TileLayer } from 'react-leaflet';
import { Marker } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation, setMapAddress } from '../redux/mapSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileAlt } from "react-icons/fa";
import { FaCreditCard } from "react-icons/fa";
import { serverUrl } from "../App"
import { ClipLoader } from "react-spinners"
import { addMyOrder } from '../redux/userSlice';



function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap();
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}


function CheckOut() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const apikey = import.meta.env.VITE_GEO_APIKEY
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const amountWithDeliveryFee = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAdddressByLatLng(lat, lng)
  }

  const getAdddressByLatLng = async (lat, lng) => {
    try {

      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apikey}`);
      dispatch(setMapAddress(result?.data?.results[0].formatted))

    } catch (error) {

      console.log("error in get address by lat lng", error);
    }
  }

  const getCurrentLocation = () => {
    setLoading(true);
    const latitude = userData.location.coordinates[1];
    const longitude = userData.location.coordinates[0];
    dispatch(setLocation({ lat: latitude, lon: longitude }));
    getAdddressByLatLng(latitude, longitude);
    setLoading(false);
  }

  const getLatLngByAddress = async (address) => {
    setLoading(true);
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apikey}`);
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error in get lat lng by address", error);
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/order/placeorder`, {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon,
        },
        totalAmount : amountWithDeliveryFee,
        cartItems,

      }, { withCredentials: true });

      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data))
        navigate("/orderplaced")
      } else {
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        openRazorpayWindow(orderId, razorOrder)
      }
      setLoading(false);
    
    } catch (error) {
      setLoading(false);
      console.log("error in place order in chekout", error);
    }
  }

  const openRazorpayWindow = (orderId, razorOrder) => {

    if (!window.Razorpay) {
      alert("Payment gateway not available. Please refresh and try again.");
      setLoading(false);
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Vingo Food Delivery",
      description: "Test Transaction",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verifypayment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId,
            }, { withCredentials: true })
          dispatch(addMyOrder(result.data))
          navigate("/orderplaced")
        } catch (error) {
          console.log("error in verify payment handler", error);
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open();
  }

  useEffect(() => {
    setAddressInput(address)
  }, [address])

  return (
    <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center'>
      <div className='absolute top-[20px] left-[20px] z-[10] cursor-pointer'
        onClick={() => navigate("/cart")}>
        <IoArrowBackSharp size={20} className='text-[#ff4d2d]' />
      </div>
      <div className='w-full max-w-[900px] bg-white p-6 rounded-lg shadow space-y-6'>
        <h1 className='font-bold text-2xl text-gray-800'>Checkout</h1>

        <section>
          <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
            <FaLocationDot size={20} className='text-[#ff4d2d]' />
            Delivery Location</h2>
          <div className='flex gap-2 mb-3'>
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#ff4d2d]"
              placeholder='Enter Your Delivery Address'
              value={addressInput}
              onChange={(e) => { setAddressInput(e.target.value) }}
            />
            <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer'
              onClick={getLatLngByAddress} >
              {loading ? (
                <ClipLoader size={20} color="#fff" />
              ) : (
                <IoSearch size={17} />
              )}
            </button>
            <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer'
              onClick={getCurrentLocation}>
              {loading ? (
                <ClipLoader size={20} color="#fff" />
              ) : (
                <TbCurrentLocation size={17} />
              )}
            </button>
          </div>
          <div className='rounded-xl border overflow-hidden'>
            <div className='h-64 w-full flex items-center justify-center'>
              <MapContainer className={'w-full h-full'}
                center={[location?.lat, location?.lon]}
                zoom={13}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker position={[location?.lat, location?.lon]}
                  draggable eventHandlers={{ dragend: onDragEnd }} />

              </MapContainer>
            </div>

          </div>
        </section>

        <section>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>Payment Method</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition cursor-pointer ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"}`} onClick={() => setPaymentMethod("cod")}>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
                <MdDeliveryDining className='text-green-600 text-xl' /></span>

              <div>
                <p className='font-medium text-gray-800'>Cash On Delivery</p>
                <p className='text-xs text-gray-500'>Pay when your food arrives</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300 cursor-pointer"}`} onClick={() => setPaymentMethod("online")}>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100'>
                <FaMobileAlt className='text-purple-700 text-lg' /></span>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                <FaCreditCard className='text-blue-700 text-xl' /></span>

              <div>
                <p className='font-medium text-gray-800'>UPI / Credit / Debit Card</p>
                <p className='text-xs text-gray-500'>Pay Secuely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-gray-800 text-lg font-semibold mb-3'>Order Summary</h2>
          <div className='rounded-xl border border-gray-300 bg-gray-50 p-4 space-y-2'>
            {cartItems?.map((item, index) => (
              <div key={index} className='flex justify-between text-sm text-gray-700'>
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}

            <hr className='border-gray-500 my-2' />
            <div className='flex justify-between font-medium text-gray-800'>
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className='flex justify-between font-medium text-gray-800'>
              <span>Delivery Fee</span>
              <span>₹{deliveryFee == 0 ? "Free" : deliveryFee}</span>
            </div>
            <div className='flex justify-between text-lg font-bold text-[#ff4d2d] pt-2'>
              <span>Total</span>
              <span>₹{amountWithDeliveryFee}</span>
            </div>
          </div>
        </section>
        <button className='w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold cursor-pointer'
          onClick={handlePlaceOrder}>
          {loading ? (
            <>
              <ClipLoader size={20} color="#fff" />
            </>
          ) : (
            <span>{paymentMethod === "cod" ? "Place Order" : "Pay Now"}</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default CheckOut