import React, { useState, useEffect } from 'react'
import Nav from './Nav'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ClipLoader } from "react-spinners"
import { FaMotorcycle, FaMapMarkerAlt, FaBox, FaCheckCircle, FaUser } from "react-icons/fa"
import { MdOutlineCurrencyRupee, MdDeliveryDining } from "react-icons/md"
import { BsInboxFill } from "react-icons/bs"


function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user)
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("")
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const navigate = useNavigate();
  const [todayDelivery, setTodayDelivery] = useState([])
  const [loading, setLoading] = useState(false);
  const [message,setMessage] = useState("")


  useEffect(() => {
    if (!socket || userData.role !== "deliveryboy") return;

    console.log("📍 Starting location tracking for delivery boy:", userData.fullname);

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log("📡 Location updated:", { latitude, longitude });
        setDeliveryBoyLocation({ lat: latitude, lon: longitude })
        socket.emit('updateLocation', {
          latitude,
          longitude,
          userId: userData._id
        })
      }),
        (error) => {
          console.log("❌ Error in getting location:", error);
        },
      {
        enableHighAccuracy: true,
      }
    } else {
      console.log("❌ Geolocation not supported by this browser");
    }
    return () => {
      if (watchId) {
        console.log("🛑 Stopping location tracking");
        navigator.geolocation.clearWatch(watchId);
      }
    }

  }, [socket, userData])



  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/getassignment`, {
        withCredentials: true
      })
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log("error in fetching assignments", error);
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/getcurrentorder`, {
        withCredentials: true
      })
      setCurrentOrder(result.data)

    } catch (error) {
      // No current order is not an error - just means delivery person has no active delivery
      if (error.response?.status !== 404) {
        console.log("error in fetching get current order", error);
      }
      setCurrentOrder(null);
    }
  }

  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/acceptorder/${assignmentId}`, {
        withCredentials: true
      })

      await getAssignments();
      await getCurrentOrder()
    } catch (error) {
      console.log("error in fetching orders", error);
    }
  }

  const sendOtp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/order/senddeliveryotp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id },
        { withCredentials: true })
      setLoading(false);
      setShowOtpBox(true);
      
    } catch (error) {
      console.log("error in send otp", error);
      setLoading(false);
    }
  }

  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(`${serverUrl}/api/order/verifydeliveryotp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp },
        { withCredentials: true })
       
      if (result.data.message === "order delivered successfully") {
        alert("Order delivered successfully!");
        setCurrentOrder(null);
        setShowOtpBox(false);
        setOtp("");
        await getAssignments();
      }
      setMessage(result.data.message)
      navigate('/deliveredorder')

    } catch (error) {
      console.log("error in verify otp", error);
    }
  }
  const handleTodayDelivery = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/gettodaydelivery`,
        { withCredentials: true })
      setTodayDelivery(result.data)
      console.log("today delivery", result.data);

    } catch (error) {
      console.log("error in verify otp", error);
    }
  }

  useEffect(() => {
    socket?.on("newAssignment", (data) => {
      console.log("🔔 New assignment received:", data);
      if (data.sentTo == userData._id) {
        console.log("✅ Assignment is for me, adding to list");
        setAvailableAssignments(prev => prev ? [...prev, data] : [data])
      } else {
        console.log("⚠️ Assignment not for me, ignoring");
      }
    })
    return () => {
      socket?.off("newAssignment")
    }
  }, [socket, userData])

  useEffect(() => {
    console.log("🚀 DeliveryBoy component mounted, fetching initial data...");
    getAssignments()
    getCurrentOrder()
    handleTodayDelivery()
  }, [userData])

  return (
    <div className='w-screen min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex flex-col items-center overflow-y-auto pb-10'>
      <Nav />
      <div className='w-full max-w-5xl flex flex-col gap-6 items-center px-4 mt-6'>
        {/* Welcome Header */}
        <div className='bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 flex items-center gap-4 w-full border border-orange-100 animate-slideInLeft'>
          <div className='bg-gradient-to-br from-[#ff4d2d] to-[#ff6b4d] p-4 rounded-2xl shadow-lg'>
            <FaMotorcycle className='text-white text-4xl' />
          </div>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
              Welcome, {userData.fullname}!
            </h1>
            <p className='text-gray-600 mt-1'>Ready to deliver happiness today</p>
          </div>
        </div>

        {/* Today Delivery Stats */}
        <div className='bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 w-full border-2 border-blue-200 animate-fadeIn'>
          <div className='flex items-center gap-3 mb-5'>
            <div className='bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg'>
              <MdDeliveryDining className='text-white text-2xl' />
            </div>
            <h1 className='text-xl font-bold text-gray-900'>Today's Deliveries</h1>
          </div>
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={todayDelivery}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDecimals={false} />
              <Tooltip 
                formatter={(value) => [value, "orders"]} 
                labelFormatter={(label) => `${label}:00`}
                contentStyle={{ borderRadius: '12px', border: '2px solid #ff4d2d' }}
              />
              <Bar dataKey="count" fill='url(#colorGradient)' radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4d2d" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ff6b4d" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Available Orders */}
        <div className='bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl w-full border-2 border-orange-200 animate-fadeIn'>
          <div className='flex items-center gap-3 mb-5'>
            <div className='bg-gradient-to-br from-[#ff4d2d] to-[#ff6b4d] p-3 rounded-xl shadow-lg'>
              <FaBox className='text-white text-2xl' />
            </div>
            <h1 className='text-xl font-bold text-gray-900'>Available Orders</h1>
          </div>
          <div className='space-y-4'>
            {availableAssignments?.length > 0 ? (
              availableAssignments.map((a, index) => (
                <div key={index} className='border-2 border-orange-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-orange-50 to-pink-50 hover:shadow-xl transition-all hover:scale-[1.02]'>
                  <div className='flex-1'>
                    <p className='text-[#ff4d2d] font-bold text-lg mb-2'>{a.shopName}</p>
                    <p className='text-sm text-gray-800 flex items-center gap-2 mb-2'>
                      <FaMapMarkerAlt className='text-green-600' />
                      {a.deliveryAddress.text}
                    </p>
                    <p className='text-sm text-gray-600 flex items-center gap-2'>
                      <FaBox className='text-blue-600' />
                      {a.items?.length} items | 
                      <span className='flex items-center font-bold text-[#ff4d2d]'>
                        <MdOutlineCurrencyRupee />{a.subtotal}
                      </span>
                    </p>
                  </div>
                  <button
                    className='bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-full font-bold hover:shadow-xl hover:shadow-green-500/50 transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap'
                    onClick={() => acceptOrder(a.assignmentId)}>
                    Accept Order
                  </button>
                </div>
              ))
            ) : (
              <div className='text-center py-12'>
                <BsInboxFill className='text-gray-300 text-6xl mx-auto mb-4' />
                <p className='text-gray-500 text-lg font-medium'>No available orders at the moment</p>
                <p className='text-gray-400 text-sm mt-2'>Check back soon for new delivery opportunities</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Order */}
        {currentOrder &&
          <div className='bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl w-full border-2 border-purple-200 animate-fadeIn'>
            <div className='flex items-center gap-3 mb-5'>
              <div className='bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg'>
                <MdDeliveryDining className='text-white text-2xl' />
              </div>
              <h2 className='text-xl font-bold text-gray-900'>Current Delivery</h2>
            </div>
            
            <div className='border-2 border-purple-200 rounded-2xl p-5 mb-5 bg-gradient-to-r from-purple-50 to-pink-50'>
              <p className='font-bold text-lg text-gray-900 mb-3 flex items-center gap-2'>
                <FaBox className='text-purple-600' />
                {currentOrder?.shopOrder.shop.name}
              </p>
              <p className='text-sm text-gray-700 flex items-center gap-2 mb-2'>
                <FaMapMarkerAlt className='text-green-600' />
                {currentOrder?.deliveryAddress.text}
              </p>
              <p className='text-sm text-gray-600 flex items-center gap-2'>
                <FaBox className='text-blue-600' />
                {currentOrder?.shopOrder?.shopOrderItems?.length} items | 
                <span className='flex items-center font-bold text-[#ff4d2d]'>
                  <MdOutlineCurrencyRupee />{currentOrder?.shopOrder.subtotal}
                </span>
              </p>
            </div>

            <div className='mb-5'>
              <DeliveryBoyTracking data={{
                deliveryBoyLocation: deliveryBoyLocation ||
                {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0]
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude
                }
              }} />
            </div>
            
            {!showOtpBox ? (
              <div className='flex justify-center'>
                <button
                  className='bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white font-bold py-3 px-8 rounded-full shadow-xl hover:shadow-2xl hover:shadow-[#ff4d2d]/50 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 text-lg'
                  onClick={sendOtp} disabled={loading}>
                  {loading ? <ClipLoader size={20} color='white'/> : (
                    <>
                      <FaCheckCircle />
                      Mark As Delivered
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className='p-6 border-2 border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50'>
                <div className='flex items-center gap-2 mb-4'>
                  <FaUser className='text-green-600 text-xl' />
                  <p className='text-sm font-semibold text-gray-800'>
                    Enter OTP sent to <span className='text-[#ff4d2d] font-bold'>{currentOrder.user.fullname}</span>
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className='w-full border-2 border-green-300 px-4 py-3 rounded-xl mb-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-center text-lg font-bold tracking-widest'
                  onChange={(e) => setOtp(e.target.value)} 
                  value={otp}
                  maxLength={6}
                />
                {message && <p className='text-center text-[#ff4d2d] mb-3 font-semibold'>{message}</p>}
                <button className='w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-green-500/50 transition-all cursor-pointer hover:scale-105 active:scale-95'
                  onClick={verifyOtp}>
                  Submit OTP
                </button>
              </div>
            )}
          </div>
        }
      </div>
    </div>
  )
}

export default DeliveryBoy
