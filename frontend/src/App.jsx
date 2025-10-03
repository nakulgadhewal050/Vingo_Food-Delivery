import  {Navigate, Route, Routes} from 'react-router-dom'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrehtUser from './hooks/useGetCurrehtUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyShop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemByCity from './hooks/useGetItemByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { setSocket } from './redux/userSlice'
import OrderDelivered from './pages/OrderDelivered'
export const serverUrl = "https://vingo-food-delivery-backend-glvc.onrender.com"

axios.defaults.baseURL = "https://vingo-food-delivery-backend.onrender.com";
axios.defaults.withCredentials = true;


function App() {
  const {userData} = useSelector(state=>state.user)
  const dispatch = useDispatch()
    useGetCurrehtUser()
    useGetCity()
    useGetMyShop()
    useGetShopByCity()
    useGetItemByCity()
    useGetMyOrders()
    useUpdateLocation()

    useEffect(()=>{
     const socketInstance = io(serverUrl,{withCredentials:true})
     dispatch(setSocket(socketInstance))
     socketInstance.on("connect",()=>{
      if(userData){
        socketInstance.emit('identity',{userId:userData._id})
      }
     })
     return ()=>{
      socketInstance.disconnect()
     }
    },[userData?._id])

    useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("/me");
        dispatch(setUserData(data));
      } catch (err) {
        console.log("Not logged in:", err.response?.data?.message);
      }
    };
    fetchUser();
  }, [dispatch]);
  return (
    <>
     <Routes>
      <Route path='/signup' element={!userData?<Signup/>:<Navigate to={"/"}/>}/>
      <Route path='/signin' element={!userData?<Signin/>:<Navigate to={"/"}/>}/>
      <Route path='/forgotpassword' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
      <Route path='/' element={userData?<Home/>:<Navigate to={"/signin"}/>}/>
      <Route path='/addfood' element={userData?<AddItem/>:<Navigate to={"/signin"}/>}/>
      <Route path='/createditshop' element={userData?<CreateEditShop/>:<Navigate to={"/signin"}/>}/>
      <Route path='/edititem/:itemId' element={userData?<EditItem/>:<Navigate to={"/signin"}/>}/>
      <Route path='/cart' element={userData?<CartPage/>:<Navigate to={"/signin"}/>}/>
      <Route path='/checkout' element={userData?<CheckOut/>:<Navigate to={"/signin"}/>}/>
      <Route path='/orderplaced' element={userData?<OrderPlaced/>:<Navigate to={"/signin"}/>}/>
      <Route path='/myorders' element={userData?<MyOrders/>:<Navigate to={"/signin"}/>}/>
      <Route path='/trackorder/:orderId' element={userData?<TrackOrderPage/>:<Navigate to={"/signin"}/>}/>
      <Route path='/shop/:shopId' element={userData?<Shop/>:<Navigate to={"/signin"}/>}/>
      <Route path='/deliveredorder' element={userData?<OrderDelivered/>:<Navigate to={"/signin"}/>}/>



     </Routes>
    </>
  )
}

export default App
