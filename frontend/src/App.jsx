import  {Navigate, Route, Routes} from 'react-router-dom'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrehtUser from './hooks/useGetCurrehtUser'
import { useDispatch, useSelector } from 'react-redux'
import Landing from './pages/Landing'
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
export const serverUrl = "http://localhost:3000"


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
     if(!userData) return;

     console.log("🔌 Initializing socket for user:", userData.fullname);
     
     const socketInstance = io(serverUrl, {
       withCredentials: true,
       transports: ['websocket', 'polling'],
       reconnection: true,
       reconnectionAttempts: 5,
       reconnectionDelay: 1000,
     });
     
     dispatch(setSocket(socketInstance));
     
     socketInstance.on("connect", () => {
       console.log("✅ Socket connected, ID:", socketInstance.id);
       console.log("👤 Sending identity for user:", userData.fullname, "Role:", userData.role);
       socketInstance.emit('identity', { userId: userData._id });
     });
     
     socketInstance.on("disconnect", (reason) => {
       console.log("🔌 Socket disconnected. Reason:", reason);
     });
     
     socketInstance.on("reconnect", (attemptNumber) => {
       console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
       socketInstance.emit('identity', { userId: userData._id });
     });
     
     socketInstance.on("connect_error", (error) => {
       console.log("❌ Socket connection error:", error.message);
     });
     
     return () => {
       console.log("🛑 Cleaning up socket connection");
       socketInstance.disconnect();
       dispatch(setSocket(null));
     };
    }, [userData?._id, dispatch])
  return (
    <>
     <Routes>
      <Route path='/signup' element={!userData?<Signup/>:<Navigate to={"/"}/>}/>
      <Route path='/signin' element={!userData?<Signin/>:<Navigate to={"/"}/>}/>
      <Route path='/forgotpassword' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
      <Route path='/' element={userData?<Landing/>:<Navigate to={"/home"}/>}/>
       <Route path='/home' element={!userData?<Home/>:<Navigate to={"/"}/>}/>
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
