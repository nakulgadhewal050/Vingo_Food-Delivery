import axios from 'axios';
import React from 'react'
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';

function OwnerItemCard({ data}) {
  const navigate = useNavigate();
  const dispatch =useDispatch();

  const handleDeleteItem = async () => {
    try {
       const result = await axios.get(`${serverUrl}/api/item/deleteitem/${data._id}`,
        {withCredentials: true});
        dispatch(setMyShopData(result.data))
        navigate("/");
    } catch (error) {
      console.log("error in deleting item", error);
    }
  }
  return (
    <div className='flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl'>
      
      {/* Image */}
      <div className='w-36 h-full flex-shrink-0 bg-gray-50'>
        <img 
          src={data.image} 
          alt={data.name || "food image"} 
          className='w-full h-40 object-cover' 
        />
      </div>

      {/* Content */}
      <div className='flex flex-col justify-between p-3 flex-1'>
        <div>
          <h2 className='text-base font-semibold text-[#ff4d2d]'>{data.name}</h2>
          <p><span className='font-medium text-gray-700'>Category:</span> {data.category}</p>
          <p><span className='font-medium text-gray-700'>Food Type:</span> {data.foodType}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="text-[#ff4d2d] font-bold">₹{data.price}</div>
          <div className='flex items-center gap-2'>
            <div 
              className='p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer'
              onClick={() => navigate(`/edititem/${data._id}`)}>
              <FaPencilAlt size={15} />
            </div>
            <div 
              className='p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer'>
              <MdDelete size={15} onClick={handleDeleteItem}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerItemCard
