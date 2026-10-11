import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const {
    dToken,
    appointments = [],
    getAppointments,
    cancelAppointment,
    completeAppointment
  } = useContext(DoctorContext)

  const { slotDateFormat, calculateAge, currency, backendUrl } =
    useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  // UI state for filtering and search
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const normalizeDateFilter = (value) => {
    if (!value) return ''
    const [year, month, day] = value.split('-')
    return `${day}_${Number(month)}_${year}`
  }

  const filteredAppointments = useMemo(() => {
    const normalizedDateFilter = normalizeDateFilter(dateFilter)

    return appointments.filter((a) => {
      const name = a?.userData?.name || ''
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || (a?.slotTime || '').toLowerCase().includes(search.toLowerCase())
      const matchesDate = !normalizedDateFilter || (a?.slotDate || '').toString() === normalizedDateFilter

      const getStatusMatch = (appointment) => {
        switch (statusFilter) {
          case 'pending':
            return !appointment.cancelled && !appointment.isCompleted;
          case 'completed':
            return appointment.isCompleted;
          case 'cancelled':
            return appointment.cancelled;
          default:
            return true;
        }
      };
      return matchesSearch && matchesDate && getStatusMatch(a)
    })
  }, [appointments, search, statusFilter, dateFilter])

  const [activeAppointment, setActiveAppointment] = useState(null)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [prescriptionRows, setPrescriptionRows] = useState([
    { name: '', days: '', time: 'Morning', food: 'After Food' }
  ])
  const [nextAppointmentDate, setNextAppointmentDate] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportFile, setReportFile] = useState(null)
  const [reportNotes, setReportNotes] = useState('')
  const [reportAppointment, setReportAppointment] = useState(null)

  const resetPrescriptionForm = () => {
    setActiveAppointment(null)
    setShowPrescriptionForm(false)
    setPrescriptionRows([{ name: '', days: '', time: 'Morning', food: 'After Food' }])
    setNextAppointmentDate('')
  }

  const openPrescriptionForm = (item) => {
    setActiveAppointment(item)

    if (item?.prescriptionItems?.length) {
      setPrescriptionRows(item.prescriptionItems.map((row) => ({
        name: row.name || '',
        days: row.days || '',
        time: row.time || 'Morning',
        food: row.food || 'After Food'
      })))
    } else {
      setPrescriptionRows([{ name: '', days: '', time: 'Morning', food: 'After Food' }])
    }

    setNextAppointmentDate(item?.nextAppointmentDate || '')
    setShowPrescriptionForm(true)
  }

  const updatePrescriptionRow = (index, field, value) => {
    setPrescriptionRows((prevRows) => prevRows.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [field]: value } : row
    )))
  }

  const addPrescriptionRow = () => {
    setPrescriptionRows((prevRows) => [...prevRows, { name: '', days: '', time: 'Morning', food: 'After Food' }])
  }

  const openReportModal = (item) => {
    setReportAppointment(item)
    setReportNotes('')
    setReportFile(null)
    setShowReportModal(true)
  }

  const closeReportModal = () => {
    setShowReportModal(false)
    setReportAppointment(null)
    setReportNotes('')
    setReportFile(null)
  }

  const uploadReport = async () => {
    if (!reportAppointment) return
    if (!reportFile) {
      toast.error('Please select a report file')
      return
    }

    try {
      const formData = new FormData()
      formData.append('appointmentId', reportAppointment._id)
      formData.append('notes', reportNotes)
      formData.append('report', reportFile)

      const { data } = await axios.post(
        backendUrl + '/api/doctor/upload-report',
        formData,
        { headers: { dToken, 'Content-Type': 'multipart/form-data' } }
      )

      if (data.success) {
        toast.success(data.message)
        closeReportModal()
        getAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  const removePrescriptionRow = (index) => {
    setPrescriptionRows((prevRows) => prevRows.filter((_, rowIndex) => rowIndex !== index))
  }

  const savePrescription = async () => {
    if (!activeAppointment) return

    const preparedRows = prescriptionRows.filter((row) => row.name.trim())
    if (!preparedRows.length) {
      toast.error('Add at least one medicine before saving')
      return
    }

    try {
      const { data } = await axios.post(
        backendUrl + '/api/doctor/save-prescription',
        {
          appointmentId: activeAppointment._id,
          prescriptionItems: preparedRows,
          nextAppointmentDate
        },
        { headers: { dToken } }
      )

      if (data.success) {
        toast.success(data.message)
        resetPrescriptionForm()
        getAppointments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  // ================= PRINT FUNCTION =================
  const printAppointment = (item) => {

    const win = window.open('', '', 'width=900,height=700')

    const logo = new URL(assets.admin_logo, import.meta.url).href
    const bg = new URL(assets.hdcircle, import.meta.url).href

    // prepare medicines/prescription rows for print
    const meds = item?.medicines || item?.prescription || item?.prescriptionItems || []
    const medRows = meds.length > 0
      ? meds.map((m, i) => {
        const name = (typeof m === 'string') ? m : (m.name || m.medicine || m.title || '')
        const days = (typeof m === 'object') ? m.days || '' : ''
        const time = (typeof m === 'object') ? m.time || '' : ''
        const food = (typeof m === 'object') ? m.food || '' : ''
        return `<tr>
            <td style="padding:6px;border:1px solid #ccc;text-align:center">${i + 1}</td>
            <td style="padding:6px;border:1px solid #ccc">${name}</td>
            <td style="padding:6px;border:1px solid #ccc">${days}</td>
            <td style="padding:6px;border:1px solid #ccc">${time}</td>
            <td style="padding:6px;border:1px solid #ccc">${food}</td>
          </tr>`
      }).join('')
      : `<tr><td colspan="5" style="padding:6px;border:1px solid #ccc;height:320px;text-align:center;vertical-align:top;"></td></tr>`

    win.document.write(`
      <html>
      <head>
        <title>Appointment Slip</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            position: relative;
          }

          /* Center Small Watermark */
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
           
            z-index: -1;
          }

          .header {
            display: flex;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }

          .logo {
            width: 70px;
            margin-right: 15px;
          }

          h2 {
            margin: 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }

          .signature {
            margin-top: 70px;
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
            <h2>Zo~Doc HealthCare </h2>
            <p>Date: ${item?.slotDate ? slotDateFormat(item.slotDate) : ''}</p>
          </div>
        </div>

        <h3>Patient Details</h3>
        <p><strong>Name:</strong> ${item?.userData?.name || ''}</p>
        <p><strong>Age:</strong> ${item?.userData?.dob ? calculateAge(item.userData.dob) : ''}</p>
        <p><strong>Payment:</strong> ${item?.payment ? 'Online' : 'Cash'}</p>

        <h3>Appointment Details</h3>
        <table>
          <tr>
            <th>Doctor</th>
            <th>Time</th>
            <th>Fees</th>
            <th>Status</th>
          </tr>
          <tr>
            <td> ${item?.docData?.name || ''}</td>
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

        

        <h4 style="margin-top:20px;">Prescription</h4>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ccc;width:40px;background:#f7f7f7;text-align:left;">S. No.</th>
              <th style="padding:8px;border:1px solid #ccc;background:#f7f7f7;text-align:left;">Medicine</th>
              <th style="padding:8px;border:1px solid #ccc;background:#f7f7f7;text-align:left;">Days</th>
              <th style="padding:8px;border:1px solid #ccc;background:#f7f7f7;text-align:left;">Time</th>
              <th style="padding:8px;border:1px solid #ccc;background:#f7f7f7;text-align:left;">Food</th>
            </tr>
          </thead>
          <tbody>
            ${medRows}
          </tbody>
        </table>
        ${item?.nextAppointmentDate ? `<p style="margin-top:16px;"><strong>Next Appointment:</strong> ${item.nextAppointmentDate}</p>` : ''}
        <div class="signature">
          <div class="sign-line"> ${item?.docData?.name || ''}</div>
        </div>

      </body>
      </html>
    `)

    win.document.close()
    win.print()
  }

  return (
    <div className='w-full max-w-6xl m-5'>

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className='flex items-center gap-3'>
          <img src={assets.admin_logo} className="w-12" alt="logo" />
          <div>
            <h2 className="text-xl font-semibold">Doctor Appointments</h2>
            <p className='text-sm text-gray-500'>{appointments.length} total appointments</p>
          </div>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search patient or time...'
            className='border px-3 py-2 rounded-md text-sm w-full sm:w-56'
          />

          <input
            type='date'
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className='border px-3 py-2 rounded-md text-sm w-full sm:w-44'
          />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='border px-3 py-2 rounded-md text-sm w-full sm:w-auto'>
            <option value='all'>All</option>
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='cancelled'>Cancelled</option>
          </select>
        </div>
      </div>

      {showPrescriptionForm && (
        <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4'>
          <div className='w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='flex items-center justify-between gap-4 border-b pb-4'>
              <div>
                <h3 className='text-xl font-semibold'>Prescription for {activeAppointment?.userData?.name || 'Patient'}</h3>
                <p className='text-sm text-gray-500'>{activeAppointment?.slotDate ? slotDateFormat(activeAppointment.slotDate) : ''} | {activeAppointment?.slotTime}</p>
              </div>
              <button onClick={resetPrescriptionForm} className='text-gray-500 hover:text-gray-900'>Close</button>
            </div>

            <div className='mt-4 space-y-4'>
              {prescriptionRows.map((row, rowIndex) => (
                <div key={rowIndex} className='grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr] items-end'>
                  <div>
                    <label className='text-xs font-medium text-gray-600'>Medicine name</label>
                    <input
                      value={row.name}
                      onChange={(e) => updatePrescriptionRow(rowIndex, 'name', e.target.value)}
                      className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
                      placeholder='Medication name'
                    />
                  </div>

                  <div>
                    <label className='text-xs font-medium text-gray-600'>Days</label>
                    <input
                      value={row.days}
                      onChange={(e) => updatePrescriptionRow(rowIndex, 'days', e.target.value)}
                      className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
                      placeholder='e.g. 5 days'
                    />
                  </div>

                  <div>
                    <label className='text-xs font-medium text-gray-600'>Time</label>
                    <select
                      value={row.time}
                      onChange={(e) => updatePrescriptionRow(rowIndex, 'time', e.target.value)}
                      className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
                    >
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                    </select>
                  </div>

                  <div>
                    <label className='text-xs font-medium text-gray-600'>Food</label>
                    <select
                      value={row.food}
                      onChange={(e) => updatePrescriptionRow(rowIndex, 'food', e.target.value)}
                      className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
                    >
                      <option>Before Food</option>
                      <option>After Food</option>
                    </select>
                  </div>

                  {prescriptionRows.length > 1 && (
                    <button
                      onClick={() => removePrescriptionRow(rowIndex)}
                      className='text-sm text-red-600 hover:underline'
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <div className='flex flex-wrap gap-3'>
                <button
                  type='button'
                  onClick={addPrescriptionRow}
                  className='rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200'
                >
                  Add medicine
                </button>

                <div className='min-w-[200px]'>
                  <label className='text-xs font-medium text-gray-600'>Next appointment</label>
                  <input
                    type='date'
                    value={nextAppointmentDate}
                    onChange={(e) => setNextAppointmentDate(e.target.value)}
                    className='mt-1 w-full rounded-md border px-3 py-2 text-sm'
                  />
                </div>
              </div>

              <div className='mt-4 flex flex-wrap gap-3 justify-end'>
                <button
                  type='button'
                  onClick={resetPrescriptionForm}
                  className='rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={savePrescription}
                  className='rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700'
                >
                  Save Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className='fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4'>
          <div className='w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='flex items-center justify-between gap-4 border-b pb-4'>
              <div>
                <h3 className='text-xl font-semibold'>Upload Report for {reportAppointment?.userData?.name || 'Patient'}</h3>
                <p className='text-sm text-gray-500'>{reportAppointment?.slotDate ? slotDateFormat(reportAppointment.slotDate) : ''} | {reportAppointment?.slotTime}</p>
              </div>
              <button onClick={closeReportModal} className='text-gray-500 hover:text-gray-900'>Close</button>
            </div>

            <div className='mt-4 space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>Report File</label>
                <input
                  type='file'
                  accept='application/pdf,image/*'
                  onChange={(e) => setReportFile(e.target.files[0])}
                  className='mt-2 w-full rounded-md border px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='text-sm font-medium text-gray-700'>Notes</label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={4}
                  className='mt-2 w-full rounded-md border px-3 py-2 text-sm'
                  placeholder='Optional notes for the report'
                />
              </div>

              <div className='flex flex-wrap gap-3 justify-end'>
                <button
                  type='button'
                  onClick={closeReportModal}
                  className='rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={uploadReport}
                  className='rounded-md bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600'
                >
                  Upload Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className='text-sm text-gray-500 mb-3'>
        {dateFilter ? `Showing appointments for ${slotDateFormat(normalizeDateFilter(dateFilter))}` : 'Showing appointments for all dates'}
      </p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-auto'>

        {/* Desktop table header */}
        <div className='hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] py-3 px-6 border-b font-medium bg-gray-50'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
          <p>Print</p>
        </div>

        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((item, index) => (
            <div
              key={item?._id || index}
              className='flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] items-center py-3 px-4 sm:px-6 border-b hover:bg-gray-50 gap-3 sm:gap-0'
            >

              <p className='sm:block text-sm text-gray-700'>{index + 1}</p>

              <div className='flex items-center gap-3'>
                <img
                  src={item?.userData?.image || assets.admin_logo}
                  className='w-10 h-10 rounded-full object-cover'
                  alt=""
                />
                <div>
                  <p className='font-medium'>{item?.userData?.name}</p>
                  <p className='text-xs text-gray-500'>{item?.userData?.phone || ''}</p>
                </div>
              </div>

              <p className='text-sm'>{item?.payment ? 'Online' : 'Cash'}</p>

              <p className='text-sm'>
                {item?.userData?.dob ? calculateAge(item.userData.dob) : ''}
              </p>

              <p className='text-sm'>
                {item?.slotDate ? slotDateFormat(item.slotDate) : ''}, {item?.slotTime}
              </p>

              <p className='text-sm'>{currency}{item?.amount}</p>

              <div className='flex flex-col gap-2'>
                {item?.cancelled ? (
                  <span className='text-red-600 text-xs px-2 py-1 rounded-full border border-red-100 bg-red-50'>Cancelled</span>
                ) : item?.isCompleted ? (
                  <span className='text-green-600 text-xs px-2 py-1 rounded-full border border-green-100 bg-green-50'>Completed</span>
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    <button onClick={() => cancelAppointment(item._id)} className='px-2 py-1 bg-red-50 text-red-600 rounded'>Cancel</button>
                    <button onClick={() => completeAppointment(item._id)} className='px-2 py-1 bg-green-50 text-green-600 rounded'>Complete</button>
                  </div>
                )}
                <button
                  onClick={() => openPrescriptionForm(item)}
                  className='px-2 py-1 bg-indigo-600 text-white rounded text-xs'
                >
                  {item?.prescriptionItems?.length ? 'Edit Prescription' : 'Add Prescription'}
                </button>
                <button
                  onClick={() => openReportModal(item)}
                  className='px-2 py-1 bg-amber-500 text-white rounded text-xs'
                >
                  Upload Report
                </button>
                {item?.reports?.length > 0 && (
                  <span className='inline-block text-xs text-white bg-slate-700 px-2 py-1 rounded'>
                    {item.reports.length} report(s)
                  </span>
                )}
              </div>

              <div>
                <button
                  onClick={() => printAppointment(item)}
                  className='bg-blue-600 text-white px-3 py-1 text-xs rounded'
                >
                  Print
                </button>
              </div>

            </div>
          ))
        ) : (
          <p className='p-6 text-center'>No Appointments Found</p>
        )}

      </div>
    </div>
  )
}

export default DoctorAppointments