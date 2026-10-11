import React, { useContext } from 'react'
import { DoctorContext } from './context/DoctorContext';
import { AdminContext } from './context/AdminContext';
import { LabContext } from './context/LabContext';
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Admin/Dashboard';
import Applications from './pages/Admin/Applications';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import AddLab from './pages/Admin/AddLab';
import DoctorsList from './pages/Admin/DoctorsList';
import LabsList from './pages/Admin/LabsList';
import UsersList from './pages/Admin/UsersList';
import Login from './pages/Login';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import LabAppointments from './pages/Lab/LabAppointments';
import LabDashboard from './pages/Lab/LabDashboard';
import LabProfile from './pages/Lab/LabProfile';

const App = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)
  const { lToken } = useContext(LabContext)

  return dToken || aToken || lToken ? (
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard />} />
          <Route path='/all-appointments' element={<AllAppointments />} />
          <Route path='/applications' element={<Applications />} />
          <Route path='/add-doctor' element={<AddDoctor />} />
          <Route path='/doctor-list' element={<DoctorsList />} />
          <Route path='/add-lab' element={<AddLab />} />
          <Route path='/lab-list' element={<LabsList />} />
          <Route path='/user-list' element={<UsersList />} />
          <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
          <Route path='/doctor-appointments' element={<DoctorAppointments />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/lab-dashboard' element={<LabDashboard />} />
          <Route path='/lab-appointments' element={<LabAppointments />} />
          <Route path='/lab-profile' element={<LabProfile />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <ToastContainer />
      <Login />
    </>
  )
}

export default App