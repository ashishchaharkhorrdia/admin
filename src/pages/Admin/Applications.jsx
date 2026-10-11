import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'

const Applications = () => {
    const { aToken } = useContext(AdminContext)
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [apps, setApps] = useState([])
    const [loading, setLoading] = useState(true)

    const fetch = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/job/list', { headers: { aToken } })
            if (data.success) setApps(data.applications)
            else toast.error(data.message)
        } catch (error) { toast.error(error.message) }
        finally { setLoading(false) }
    }

    useEffect(() => { if (aToken) fetch() }, [aToken])

    return (
        <div className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Applications</h2>
            {loading ? <div>Loading...</div> : (
                <div className='overflow-x-auto bg-white p-4 rounded shadow'>
                    {apps.length === 0 ? <div className='text-gray-500'>No applications yet.</div> : (
                        <table className='w-full text-sm'>
                            <thead className='text-left text-xs text-gray-500'>
                                <tr>
                                    <th className='py-2'>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Speciality</th>
                                    <th>Qualifications</th>
                                    <th>Message</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apps.map(app => (
                                    <tr key={app._id} className='border-t'>
                                        <td className='py-2'>{app.name}</td>
                                        <td>{app.email}</td>
                                        <td>{app.phone}</td>
                                        <td>{app.role}</td>
                                        <td>{app.speciality}</td>
                                        <td>{app.qualifications}</td>
                                        <td className='max-w-xs truncate'>{app.message}</td>
                                        <td>{new Date(app.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    )
}

export default Applications
