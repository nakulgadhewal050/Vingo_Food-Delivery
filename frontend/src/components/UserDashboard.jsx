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
    <div className='w-screen min-h-screen bg-[#fff9f6] flex flex-col items-center overflow-y-auto'>
      <Nav />

      {searchItems && searchItems?.length>0 && (
        <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4'> 
          <h1 className='text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>Search Results</h1>
          <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
            {searchItems.map((item,index)=>(
              <FoodCard key={index} data={item} />
            ))}
          </div>
        </div>
      )}

      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>
          Inspiration for your first order
        </h1>

        {/* {categories} */}
        <div className='w-full relative'>
          {/* LEFT BUTTON */}
          {showLeftCateButton &&
            <button
              className='absolute left-2 top-1/2 -translate-y-1/2 text-white p-2 rounded-full shadow-lg hover:bg-[#ff4d2d] z-10 cursor-pointer'
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft size={25} />
            </button>}


          {/* SCROLLABLE LIST */}
          <div
            className='w-full flex overflow-x-auto gap-4 pb-2 scroll-smooth cursor-pointer'
            ref={cateScrollRef}
          >
            {categories?.map((cate, index) => (
              <CategoryCard key={index} name={cate.category} image={cate.image} 
              onClick={()=>handleFilterByCategory(cate.category)}/>
            ))}
          </div>

          {/* RIGHT BUTTON */}
          {showRightCateButton &&
            <button
              className='absolute right-2 top-1/2 -translate-y-1/2  text-white p-2 rounded-full shadow-lg hover:bg-[#ff4d2d] z-10 cursor-pointer'
              onClick={() => scrollHandler(cateScrollRef, "right")}>
              <FaCircleChevronRight size={25} />
            </button>}
        </div>
      </div>

      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>
          Best Shop in {currentCity}
        </h1>

        {/* {shops} */}
        <div className='w-full relative'>
          {/* LEFT BUTTON */}
          {showLeftShopButton && (
            <button
              className='absolute left-2 top-1/2 -translate-y-1/2 text-white p-2 rounded-full shadow-lg hover:bg-[#ff4d2d] z-10 cursor-pointer'
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaCircleChevronLeft size={25} />
            </button>
          )}

          {/* SCROLLABLE LIST */}
          <div
            className='w-full flex overflow-x-auto gap-4 pb-2 scroll-smooth cursor-pointer'
            ref={shopScrollRef}
          >
            {shopsInMyCity?.map((shop, index) => (
              <CategoryCard key={index} name={shop.name} image={shop.image} 
              onClick={()=>navigate(`/shop/${shop._id}`)}/>
            ))}
          </div>

          {/* RIGHT BUTTON */}
          {showRightShopButton && (
            <button
              className='absolute right-2 top-1/2 -translate-y-1/2  text-white p-2 rounded-full shadow-lg hover:bg-[#ff4d2d] z-10 cursor-pointer'
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaCircleChevronRight size={25} />
            </button>
          )}
        </div>
      </div>

      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>
          Suggested Food Items
        </h1>
        <div className='w-full h-auto flex flex-wrap gap-[20px] justify-center'>
          {updatedItemsList?.map((item,index)=>(
            console.log("item:",item),
            <FoodCard key={index} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard
