import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBackSharp } from "react-icons/io5";
import { serverUrl } from '../App';
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';
import { useSelector } from 'react-redux';

function TrackOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState(null);
  const {socket} = useSelector(state=>state.user)
  const [liveLocation, setLiveLocation] = useState({});

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/getorderbyid/${orderId}`, {
        withCredentials: true
      });
      setCurrentOrder(result.data);
      console.log("order details", result.data);
    } catch (error) {
      console.log("error in fetching order by id", error);
    }
  }

  useEffect(()=>{
      socket?.on('updateDeliveryLocation',({ deliveryBoyId,latitude,longitude})=>{
       setLiveLocation(prev=>({
        ...prev,
        [deliveryBoyId]:{lat:latitude,lon:longitude}
       })) 

      })
  },[socket])

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>
      <div className='relative top-[20px] flex items-center gap-4 left-[20px] z-[10] mb-[10px] cursor-pointer'
        onClick={() => navigate("/")}>
        <IoArrowBackSharp size={20} className='text-[#ff4d2d]' />
        <h1 className='text-2xl font-bold md:text-center'>Track Order</h1>
      </div>
      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div className='bg-white p-4 rounded-2xl shadow-md border border-orange-50 space-y-4' key={index}>
          <div>
            <p className='text-lg font-bold mb-2 text-[#ff4d2d]'>{shopOrder.shop.name}</p>
            <p className='font-semibold'><span>Items: </span>
              {shopOrder.shopOrderItems?.map(i => i.name).join(",")}
            </p>
            <p><span className='font-semibold'>Subtotal: </span>{shopOrder.subtotal}</p>
            <p className='mt-6'><span className='font-semibold'>Delivery Address: </span>{currentOrder.deliveryAddress?.text}</p>
          </div>

          {shopOrder.status === "pending" || shopOrder.status === "preparing" || shopOrder.status === "out of delivery" ? (
            <div>
              {shopOrder.assignedDeliveryBoy ? (
                <div>

                  <div className='text-sm text-gray-800'>
                    <p className='font-semibold'><span className='font-bold text-gray-800'>Delivery Boy: </span>
                      {shopOrder.assignedDeliveryBoy.fullname}</p>
                    <p className='font-semibold'><span className='font-bold text-gray-800'>Contect: </span>
                      {shopOrder.assignedDeliveryBoy.mobile}</p>
                  </div>
                </div>
              ) : (
                <p className='font-semibold'>Delivery Boy is not assigned yet.</p>
              )}
            </div>
          ) : (
            <p className='text-[#ff4d2d] font-semibold text-lg'>Delivered</p>
          )}

          {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" &&
            <div className='h-[400px] w-full rounded-2xl overflow-hidden shadow-md'>
              <DeliveryBoyTracking data={{
                  deliveryBoyLocation:liveLocation[shopOrder.assignedDeliveryBoy._id] ||  
                  {
                    lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                    lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                  },
                  customerLocation: {
                    lat: currentOrder.deliveryAddress.latitude,
                    lon: currentOrder.deliveryAddress.longitude
                  }
                }}/> </div>}
        </div>
      ))}

    </div>
  );
}

export default TrackOrderPage;
