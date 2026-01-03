import React, { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import { Routes, Route, Navigate } from "react-router-dom"
import HomePage from "../src/pages/HomePage.jsx"
import SignUpPage from "../src/pages/SignUpPage.jsx"
import LoginPage from "../src/pages/LoginPage.jsx"
import ProfilePage from "../src/pages/ProfilePage.jsx"
import SettingsPage from "../src/pages/SettingsPage.jsx"
import { useAuthStore } from "../src/store/useAuthStore.js"
import { useThemeStore } from "../src/store/useThemeStore.js"
import { Loader } from "lucide-react"
import { Toaster } from "react-hot-toast"

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore()
  const { theme } = useThemeStore()

  console.log({onlineUsers});

  useEffect(() => {
    checkAuth();
  }, [])

  console.log({ authUser });

  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin' />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Routes>

      <Toaster />

    </div>
  )
}

export default App
