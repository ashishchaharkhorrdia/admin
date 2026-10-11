import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const UsersList = () => {
    const { users, getAllUsers, aToken } = useContext(AdminContext)

    useEffect(() => {
        if (aToken) {
            getAllUsers()
        }
    }, [aToken])

    return (
        <div className='m-5'>
            <h1 className='text-lg font-medium'>All Users</h1>
            <div className='w-full flex flex-wrap gap-4 pt-5'>
                {users.length === 0 ? (
                    <div className='text-gray-500'>No users found.</div>
                ) : (
                    users.map((item, index) => (
                        <div key={index} className='border border-[#C9D8FF] rounded-xl max-w-sm overflow-hidden bg-white shadow-sm'>
                            <div className='flex items-center gap-3 p-4'>
                                <img
                                    className='w-16 h-16 rounded-full object-cover bg-gray-100'
                                    src={item.image || 'https://via.placeholder.com/150'}
                                    alt={item.name}
                                />
                                <div>
                                    <p className='text-[#262626] text-lg font-semibold'>{item.name}</p>
                                    <p className='text-[#5C5C5C] text-sm'>{item.email}</p>
                                </div>
                            </div>
                            <div className='border-t border-[#E5E7EB] px-4 py-3 bg-[#F9FAFB]'>
                                <p className='text-sm text-[#4B5563]'>Phone</p>
                                <p className='text-base font-medium text-[#111827]'>{item.phone || 'N/A'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default UsersList
