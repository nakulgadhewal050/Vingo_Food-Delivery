import React, { useState, useEffect } from 'react'
import Nav from './Nav'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ClipLoader } from "react-spinners"


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

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setDeliveryBoyLocation({ lat: latitude, lon: longitude })
        socket.emit('updateLocation', {
          latitude,
          longitude,
          userId: userData._id
        })
      }),
        (error) => {
          console.log("error in getting location", error);
        },
      {
        enableHighAccuracy: true,
      }
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
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
      console.log("error in fetching get current order", error);
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
      if (data.sentTo == userData._id) {
        setAvailableAssignments(prev => prev ? [...prev, data] : [data])
      }
    })
    return () => {
      socket?.off("newAssignment")
    }
  }, [socket, userData])

  useEffect(() => {
    getAssignments()
    getCurrentOrder()
    handleTodayDelivery()
  }, [userData])

  return (
    <div className='w-screen min-h-screen bg-[#fff9f6] flex flex-col items-center overflow-y-auto gap-5'>
      <Nav />
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center '>
        <div className='bg-white rounded-2xl shadow-md p-5 flex justify-center gap-2 items-center w-[90%] border border-orange-100 item-center'>
          <h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome {userData.fullname}</h1>
        </div>

        <div className='bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100'>
          <h1 className='text-lg font-bold mb-3 text-[#ff4d2d]'>Today Delivery</h1>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={todayDelivery}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [value, "orders"]} labelFormatter={(label) => `${label}:00`} />
              <Bar dataKey="count" fill='#ff4d2d' />
            </BarChart >

          </ResponsiveContainer>
        </div>

        <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
          <h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>
          <div className='space-y-4'>
            {availableAssignments?.length > 0 ? (
              availableAssignments.map((a, index) => (
                <div key={index} className='border rounded-lg p-4 flex justify-between items-center'>
                  <div>
                    <p className='text-[#ff4d2d] font-semibold'>{a.shopName}</p>
                    <p className='text-sm text-gray-800'>{a.deliveryAddress.text}</p>
                    <p className='text-xs text-gray-500'>
                      {a.items?.length} items | ₹{a.subtotal}
                    </p>
                  </div>
                  <button
                    className='bg-[#ff4d2d] text-white px-4 py-1 text-sm rounded-lg hover:bg-[#e64323] transition cursor-pointer'
                    onClick={() => acceptOrder(a.assignmentId)}>
                    Accept
                  </button>
                </div>
              ))
            ) : (
              <p>No Available Orders</p>
            )}
          </div>
        </div>

        {currentOrder &&
          <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
            <h2 className='text-lg font-bold mb-3'>📦 Current Order</h2>
            <div className='border rounded-lg p-4 mb-3'>
              <p className='font-semibold text-sm'>{currentOrder?.shopOrder.shop.name}</p>
              <p className='text-sm text-gray-500'>{currentOrder?.deliveryAddress.text}</p>
              <p className='text-xs text-gray-500'>
                {currentOrder?.shopOrder?.shopOrderItems?.length} items | ₹{currentOrder?.shopOrder.subtotal}
              </p>
            </div>

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
            {!showOtpBox ? (
              <div className='flex justify-center'>
                <button
                  className='mt-4 w-[30%] bg-[#ff4d2d] text-white font-semibold py-2 px-4 rounded-xl shadow-md cursor-pointer hover:bg-[#e64323] active:scale-95 transition-all duration-200'
                  onClick={sendOtp} disabled={loading}>
                  {loading?<ClipLoader size={20} color='white'/>:"Mark As Delivered"}
                </button>
              </div>
            ) : (
              <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
                <p className='text-sm font-semibold mb-2'>
                  Enter OTP sent to <span className='text-[#ff4d2d]'>{currentOrder.user.fullname}</span>
                </p>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:border-orange-500'
                  onChange={(e) => setOtp(e.target.value)} value={otp}/>
                  {message && <p className='text-center text-[#ff4d2d]'>{message}</p>}
                <button className='w-full bg-[#ff4d2d] text-white py-2 rounded-lg font-semibold hover:bg-[#e64323] transition-all cursor-pointer'
                  onClick={verifyOtp} >
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
