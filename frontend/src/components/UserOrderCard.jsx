import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';


function UserOrderCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [seletctedRating, setSelectedRating] = useState({});

  const formateDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-Us', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleRating = async (itemId, rating) => {
  try {
    const result = await axios.post(
      `${serverUrl}/api/item/rating`,
      { itemId, rating },
      { withCredentials: true }
    );

    setSelectedRating(prev => ({
      ...prev,
      [itemId]: rating
    }));
  } catch (error) {
    console.log("rating error", error);
  }
};


  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      <div className='flex justify-between border-b pb-2'>
        <div>
          <p className='font-semibold'>
            order #{data._id.slice(-6)}
          </p>
          <p className='text-sm text-gray-600'>
            Date: {formateDate(data.createdAt)}
          </p>
        </div>
        <div className='text-right'>
          <p className='text-sm font-bold text-gray-800'>{data.paymentMethod?.toUpperCase()}</p>
          <p className='font-medium text-[#ff4d2d]'>{data.shopOrders?.[0].status}</p>
        </div>
      </div>
      {data.shopOrders?.map((shopOrder, index) => (
        <div className='border rounded-lg p-3 bg-[#fffaf7] space-y-3' key={index}>
          <p>{shopOrder?.shop?.name}</p>
          <div className='flex space-x-4 overflow-x-auto pb-2'>
            {shopOrder.shopOrderItems.map((item, index) => (
              <div key={index} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                <img src={item.item.image} alt={item.item.name}
                  className='w-full h-24 object-cover rounded' />
                <p className='text-sm font-semibold mt-1'>{item.name}</p>
                <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price}</p>

                {shopOrder.status == "delivered" &&
                  <div className='flex space-x-1 nt-2'>
                    {[1,2,3,4,5].map((star,index)=>(
                      <button key={index} className={`text-lg cursor-pointer ${seletctedRating[item.item._id]>=star?
                        "text-yellow-400":"text-gray-400"}`}
                        onClick={()=>handleRating(item.item._id,star)}>★</button>
                    ))}
                  </div>}

              </div>
            ))}
          </div>
          <div className='flex justify-between items-center border-t pt-2'>
            <p className='font-semibold'>Subtotal: {shopOrder.subtotal}</p>
            <span className='text-sm font-medium text-[#ff4d2d]'>{shopOrder.status}</span>
          </div>
        </div>
      ))}

      <div className='flex justify-between items-center border-t pt-2'>
        <p className='font-semibold'>Total: ₹{data.totalAmount}</p>
        <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm cursor-pointer'
          onClick={() => navigate(`/trackorder/${data._id}`)}>
          Track Order</button>
      </div>
    </div>
  )
}

export default UserOrderCard