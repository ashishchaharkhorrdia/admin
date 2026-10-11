import React, { useEffect, useContext } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {

  const {
    aToken,
    appointments = [],
    cancelAppointment,
    getAllAppointments
  } = useContext(AdminContext)

  const { slotDateFormat, calculateAge, currency } =
    useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  // ================= PRINT FUNCTION =================
  const printAppointment = (item) => {

    const win = window.open('', '', 'width=900,height=700')

    const logo = new URL(assets.admin_logo, import.meta.url).href
    const bg = new URL(assets.hdcircle, import.meta.url).href

    win.document.write(`
      <html>
      <head>
        <title>Appointment Slip</title>
        <style>
          body {
            font-family: Arial;
            padding: 40px;
            position: relative;
          }

          body::before {
            content: "";
            position: fixed;
            top: 50%;
            left: 50%;
            width: 220px;
            height: 220px;
            background: url('${bg}') no-repeat center;
            background-size: contain;
            transform: translate(-50%, -50%);
            opacity: 0.07;
            z-index: -1;
          }

          .header {
            display: flex;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          .logo {
            width: 70px;
            margin-right: 15px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 8px;
          }

          .signature {
            margin-top: 60px;
            text-align: right;
          }

          .sign-line {
            border-top: 1px solid #000;
            width: 200px;
            margin-left: auto;
            padding-top: 5px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>

        <div class="header">
          <img src="${logo}" class="logo"/>
          <div>
            <h2>Sunrise Care Hospital</h2>
            <p>Date: ${slotDateFormat(item.slotDate)}</p>
          </div>
        </div>

        <h3>Patient Details</h3>
        <p><strong>Name:</strong> ${item?.userData?.name || ''}</p>
        <p><strong>Age:</strong> ${item?.userData?.dob ? calculateAge(item.userData.dob) : ''}</p>

        <h3>Appointment Details</h3>
        <table>
          <tr>
            <th>Doctor</th>
            <th>Time</th>
            <th>Fees</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>${item?.docData?.name || ''}</td>
            <td>${item?.slotTime || ''}</td>
            <td>${currency}${item?.amount || 0}</td>
            <td>
              ${item?.cancelled
                ? 'Cancelled'
                : item?.isCompleted
                ? 'Completed'
                : 'Pending'}
            </td>
          </tr>
        </table>

        <div class="signature">
          <div class="sign-line">${item?.docData?.name || ''}</div>
        </div>

      </body>
      </html>
    `)

    win.document.close()
    win.print()
  }

  return (
    <div className='w-full max-w-6xl m-5'>

      <div className="flex items-center gap-3 mb-4">
        <img src={assets.admin_logo} className="w-12" alt="logo" />
        <h2 className="text-xl font-semibold">All Appointments</h2>
      </div>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>

        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] py-3 px-6 border-b font-medium'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
          <p>Print</p>
        </div>

        {appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div
              key={item?._id || index}
              className='flex flex-wrap justify-between sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr_1fr] items-center py-3 px-6 border-b hover:bg-gray-50'
            >

              <p className='max-sm:hidden'>{index + 1}</p>

              <div className='flex items-center gap-2'>
                <img
                  src={item?.userData?.image || assets.admin_logo}
                  className='w-8 h-8 rounded-full object-cover'
                  alt=""
                />
                <p>{item?.userData?.name}</p>
              </div>

              <p className='max-sm:hidden'>
                {item?.userData?.dob
                  ? calculateAge(item.userData.dob)
                  : ''}
              </p>

              <p>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>

              <div className='flex items-center gap-2'>
                <img
                  src={item?.docData?.image || assets.admin_logo}
                  className='w-8 h-8 rounded-full object-cover'
                  alt=""
                />
                <p>{item?.docData?.name}</p>
              </div>

              <p>{currency}{item?.amount}</p>

              {item?.cancelled ? (
                <p className='text-red-500 text-xs'>Cancelled</p>
              ) : item?.isCompleted ? (
                <p className='text-green-500 text-xs'>Completed</p>
              ) : (
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className='w-6 cursor-pointer'
                  src={assets.cancel_icon}
                  alt=""
                />
              )}

              <button
                onClick={() => printAppointment(item)}
                className='bg-blue-600 text-white px-2 py-1 text-xs rounded'
              >
                Print
              </button>

            </div>
          ))
        ) : (
          <p className='p-6 text-center'>No Appointments Found</p>
        )}

      </div>
    </div>
  )
}

export default AllAppointments