import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setAddress, setCity, setState } from '../redux/userSlice';
import { setLocation,setMapAddress } from '../redux/mapSlice';


function useGetCity() {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user)
    const apikey = import.meta.env.VITE_GEO_APIKEY
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            dispatch(setLocation({ lat: latitude, lon: longitude }))
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`);
            dispatch(setCity(result?.data?.results[0].city || result?.data?.results[0].country))
            dispatch(setState(result?.data?.results[0].state))
            dispatch(setAddress(result?.data?.results[0].address_line1 || address_line2 || ""))
            dispatch(setMapAddress(result?.data?.results[0].formatted))
            
        })
    }, [userData])
}

export default useGetCity