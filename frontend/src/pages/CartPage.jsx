import React from 'react'
import { IoArrowBackSharp } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';

function CartPage() {
    const navigate = useNavigate();
    const { cartItems, totalAmount } = useSelector(state => state.user)
    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
            <div className='w-full max-w-[800px]'>
                <div className='flex items-center gap-[20px] mb-6 '>
                    <div className='z-[10]  cursor-pointer'
                        onClick={() => navigate("/")}>
                        <IoArrowBackSharp size={20} className='text-[#ff4d2d]' />
                    </div>
                    <h1 className='text-2xl font-bold text-start'>Your Cart</h1>
                </div>
                {cartItems?.length == 0 ? (
                    <p className='text-gray-500 text-lg text-center'>Your Cart is Empty</p>) : (
                    <>
                        <div className='space-y-4'>
                            {cartItems?.map((item, index) => (
                                <CartItemCard data={item} key={index} />
                            ))}
                        </div>
                        <div className='mt-6 p-4 bg-white rounded-xl shadow border flex items-center justify-between'>
                            <h1 className='font-semibold text-lg'>Total Amount</h1>
                             <span className='text-xl font-bold text-[#ff4d2d]'>₹{totalAmount}</span>
                        </div>
                        <div className='mt-4 flex justify-center'
                        onClick={()=>navigate("/checkout")}>
                            <button className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer'>CheckOut</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default CartPage