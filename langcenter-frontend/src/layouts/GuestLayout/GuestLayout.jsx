import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UseStateContext } from '../../context/ContextProvider'

export default function GuestLayout() {
  const {token,user,errors} = UseStateContext();
  if(token && user.role === "admin")
  {
    return(
      <Navigate to="/dashboard" />
      );
  }
  if(token && user.role === "secretary")
  {
    return(
      <Navigate to="/secretary/dashboard" />
      );
  }
  if(token && user.role === "director")
  {
    return(
      <Navigate to="/director/dashboard" />
      );
  }
  return (
    <div>
      <Outlet/>
    </div>
  )
}
