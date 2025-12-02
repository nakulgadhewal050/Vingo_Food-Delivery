import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';



function UserDashboard() {
  const navigate = useNavigate();
  const { currentCity, shopsInMyCity,itemsInMyCity,searchItems } = useSelector(state => state.user)
  const cateScrollRef = useRef(null);
  const shopScrollRef = useRef(null);
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemsList,setUpdatedItemsList]=useState([]);


 const handleFilterByCategory=(category)=>{
    if(category==="All"){
      setUpdatedItemsList(itemsInMyCity)
    }else{
      const filteredList = itemsInMyCity?.filter(i=>i.category===category)
      setUpdatedItemsList(filteredList)
    }
 } 

 useEffect(()=>{
  setUpdatedItemsList(itemsInMyCity)
 },[itemsInMyCity])

  const updateButtonVisibility = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(element.scrollWidth > element.clientWidth + element.scrollLeft);
    }
  }

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth"
      });
    }
  };



  useEffect(() => {
    if (cateScrollRef.current) {
      cateScrollRef.current.addEventListener('scroll', () => {
        updateButtonVisibility(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      })
      updateButtonVisibility(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)

    }

  }, [])

  useEffect(() => {
    if (shopScrollRef.current) {
      shopScrollRef.current.addEventListener('scroll', () => {
        updateButtonVisibility(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      })
      updateButtonVisibility(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

    }

  }, [])

  return (
    <div className='w-screen min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex flex-col items-center overflow-y-auto'>
      <Nav />

      {/* Hero Section with Welcome Message */}
      <div className='w-full max-w-6xl px-5 pt-8 pb-4'>
        <div className='bg-gradient-to-r from-[#ff4d2d] via-[#ff6b4d] to-[#ff8c6d] rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300'>
          <h1 className='text-white text-3xl sm:text-4xl font-bold mb-2'>
            🍕 Welcome to Delicious Delights!
          </h1>
          <p className='text-white/90 text-lg'>
            Discover amazing food from {currentCity}'s best restaurants
          </p>
        </div>
      </div>

      {searchItems && searchItems?.length>0 && (
        <div className='w-full max-w-6xl flex flex-col gap-6 items-start p-5 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl mt-6 mx-5 border border-orange-100'> 
          <div className='flex items-center gap-3'>
            <div className='w-1 h-8 bg-gradient-to-b from-[#ff4d2d] to-[#ff8c6d] rounded-full'></div>
            <h1 className='text-gray-900 text-2xl sm:text-3xl font-bold'>🔍 Search Results</h1>
          </div>
          <div className='w-full h-auto flex flex-wrap gap-6 justify-center pb-4'>
            {searchItems.map((item,index)=>(
              <div key={index} className='animate-fadeIn'>
                <FoodCard data={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='w-full max-w-6xl flex flex-col gap-6 items-start p-5 mt-8'>
        <div className='flex items-center gap-3'>
          <div className='w-1 h-10 bg-gradient-to-b from-[#ff4d2d] to-[#ff8c6d] rounded-full'></div>
          <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
            ✨ Inspiration for your first order
          </h1>
        </div>

        {/* {categories} */}
        <div className='w-full relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-orange-100'>
          {/* LEFT BUTTON */}
          {showLeftCateButton &&
            <button
              className='absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white p-3 rounded-full shadow-2xl hover:shadow-[#ff4d2d]/50 hover:scale-110 z-10 transition-all duration-300'
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft size={28} />
            </button>}


          {/* SCROLLABLE LIST */}
          <div
            className='w-full flex overflow-x-auto gap-5 pb-3 scroll-smooth scrollbar-hide'
            ref={cateScrollRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories?.map((cate, index) => (
              <div key={index} className='transform hover:-translate-y-2 transition-all duration-300'>
                <CategoryCard name={cate.category} image={cate.image} 
                onClick={()=>handleFilterByCategory(cate.category)}/>
              </div>
            ))}
          </div>

          {/* RIGHT BUTTON */}
          {showRightCateButton &&
            <button
              className='absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white p-3 rounded-full shadow-2xl hover:shadow-[#ff4d2d]/50 hover:scale-110 z-10 transition-all duration-300'
              onClick={() => scrollHandler(cateScrollRef, "right")}>
              <FaCircleChevronRight size={28} />
            </button>}
        </div>
      </div>

      <div className='w-full max-w-6xl flex flex-col gap-6 items-start p-5 mt-4'>
        <div className='flex items-center gap-3'>
          <div className='w-1 h-10 bg-gradient-to-b from-[#ff4d2d] to-[#ff8c6d] rounded-full'></div>
          <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
            🏆 Best Shops in {currentCity}
          </h1>
        </div>

        {/* {shops} */}
        <div className='w-full relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-orange-100'>
          {/* LEFT BUTTON */}
          {showLeftShopButton && (
            <button
              className='absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white p-3 rounded-full shadow-2xl hover:shadow-[#ff4d2d]/50 hover:scale-110 z-10 transition-all duration-300'
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaCircleChevronLeft size={28} />
            </button>
          )}

          {/* SCROLLABLE LIST */}
          <div
            className='w-full flex overflow-x-auto gap-5 pb-3 scroll-smooth scrollbar-hide'
            ref={shopScrollRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {shopsInMyCity?.map((shop, index) => (
              <div key={index} className='transform hover:-translate-y-2 transition-all duration-300'>
                <CategoryCard name={shop.name} image={shop.image} 
                onClick={()=>navigate(`/shop/${shop._id}`)}/>
              </div>
            ))}
          </div>

          {/* RIGHT BUTTON */}
          {showRightShopButton && (
            <button
              className='absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white p-3 rounded-full shadow-2xl hover:shadow-[#ff4d2d]/50 hover:scale-110 z-10 transition-all duration-300'
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaCircleChevronRight size={28} />
            </button>
          )}
        </div>
      </div>

      <div className='w-full max-w-6xl flex flex-col gap-6 items-start p-5 mt-4 mb-10'>
        <div className='flex items-center gap-3'>
          <div className='w-1 h-10 bg-gradient-to-b from-[#ff4d2d] to-[#ff8c6d] rounded-full'></div>
          <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
            🍽️ Suggested Food Items
          </h1>
        </div>
        <div className='w-full h-auto flex flex-wrap gap-6 justify-center pb-6'>
          {updatedItemsList?.map((item,index)=>(
            console.log("item:",item),
            <div key={index} className='animate-fadeIn' style={{ animationDelay: `${index * 0.05}s` }}>
              <FoodCard data={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard
