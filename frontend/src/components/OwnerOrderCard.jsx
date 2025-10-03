import React from 'react'
import { FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import axios from 'axios';
import { serverUrl } from "../App"
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';
import { useState } from 'react';

function OwnerOrderCard({ data }) {

  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/updatestatus/${orderId}/${shopId}`, { status },
        { withCredentials: true })
      dispatch(updateOrderStatus({ orderId, shopId, status }))
      setAvailableBoys(result.data.availableBoys)
      console.log("order status updated", result.data);

    } catch (error) {
      console.log("error updating status", error);
    }
  }
  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      <div>
        <h2 className='text-lg font-semibold text-gray-800'>{data.user.fullname}</h2>
        <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'><MdEmail className='text-[#ff4d2d]' size={20} />
          <span>{data.user.email}</span></p>
        <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'><FaPhoneAlt className='text-[#ff4d2d]' size={15} />
          <span>{data.user.mobile}</span></p>
        {data.paymentMethod == "online" ? <p className='flex items-center gap-2 text-sm text-gray-600'>
          Payment Method: <span className='text-[#ff4d2d]'>{data.paymentMethod ? "Online" : "False"}</span></p>
          : <p className='flex items-center gap-2 text-sm text-gray-600'>
            Payment Method: <span className='text-[#ff4d2d]'>{data.paymentMethod}</span></p>}

      </div>

      <div className='flex items-start gap-2 text-gray-600 text-sm flex-col'>
        <p className='text-xs text-gray-500'>{data?.deliveryAddress?.text}</p>
      </div>

      <div className='flex space-x-4 overflow-x-auto pb-2'>
        {data.shopOrders.shopOrderItems.map((item, index) => (
          <div key={index} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
            <img src={item.item.image} alt={item.item.name}
              className='w-full h-24 object-cover rounded' />
            <p className='text-sm font-semibold mt-1'>{item.name}</p>
            <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price}</p>
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center border-t pt-3 mt-auto border-gray-100'>
        <span className='text-sm'>status: <span className='font-semibold capitalize text-[#ff4d2d]'>
          {data.shopOrders.status}</span></span>

        <select className='rounded-md border px-3 py-1 text-sm focus:outline-none  border-[#ff4d2d] text-[#ff4d2d] cursor-pointer'
          onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop._id, e.target.value)}>

          <option value="change">Change</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out Of Delivery</option>
        </select>
      </div>

      {data?.shopOrders?.status === "out of delivery" &&
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {data.shopOrders.assignedDeliveryBoy ? <div>Assigned Delivery Boy</div>
            : <p>Available Delivery Boys:</p>}

          {availableBoys.length > 0 ? (
            availableBoys.map((b, index) => (
              <div key={index} className='text-gray-800'>
                {b?.fullname} - {b?.mobile}
              </div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? <div>{data.shopOrders.assignedDeliveryBoy.fullname}- {data.shopOrders.assignedDeliveryBoy.mobile}</div>
            : <div className="text-gray-800">Waiting for delivery boy to accept</div>
          }
        </div>
      }

      <div className='text-right font-bold text-gray-800 text-sm'>
        Total: ₹{data.shopOrders.subtotal}
      </div>
    </div>
  )
}

export default OwnerOrderCard