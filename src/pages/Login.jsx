import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { LabContext } from '../context/LabContext'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Login = () => {

  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)
  const { setLToken } = useContext(LabContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true)

    try {
      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          setAToken(data.token)
          localStorage.setItem('aToken', data.token)
        } else {
          toast.error(data.message)
        }
      } else if (state === 'Doctor') {
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          setDToken(data.token)
          localStorage.setItem('dToken', data.token)
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/lab/login', { email, password })
        if (data.success) {
          setLToken(data.token)
          localStorage.setItem('lToken', data.token)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }

    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${assets.hdcircle})` }}
    >

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Login Card */}
      <form
        onSubmit={onSubmitHandler}
        className="relative z-10 w-[90%] max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10 text-white"
      >

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src={assets.ad} alt="logo" className="w-30 mb-3 drop-shadow-xl" />
          <h2 className="text-3xl font-semibold tracking-wide">
            {state} Login
          </h2>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            required
            className="w-full mt-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-white/70"
            placeholder="Enter your email"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-sm">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            required
            className="w-full mt-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-white/70"
            placeholder="Enter your password"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-all duration-300 font-medium shadow-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-white/80">
          {state === 'Admin' ? (
            <>Doctor Login? <span onClick={() => setState('Doctor')} className="text-blue-400 cursor-pointer underline">Click here</span> | Lab Login? <span onClick={() => setState('Lab')} className="text-blue-400 cursor-pointer underline">Click here</span></>
          ) : state === 'Doctor' ? (
            <>Admin Login? <span onClick={() => setState('Admin')} className="text-blue-400 cursor-pointer underline">Click here</span> | Lab Login? <span onClick={() => setState('Lab')} className="text-blue-400 cursor-pointer underline">Click here</span></>
          ) : (
            <>Admin Login? <span onClick={() => setState('Admin')} className="text-blue-400 cursor-pointer underline">Click here</span> | Doctor Login? <span onClick={() => setState('Doctor')} className="text-blue-400 cursor-pointer underline">Click here</span></>
          )}
        </p>

      </form>
    </div>
  )
}

export default Login