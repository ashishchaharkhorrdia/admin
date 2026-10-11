import React, { useContext, useEffect, useState, useRef } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { FaCamera } from 'react-icons/fa'

const DoctorProfile = () => {

    const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext)
    const { currency, backendUrl } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const fileInputRef = useRef()

    const updateProfile = async () => {
        try {
            const formData = new FormData()
            formData.append('docId', profileData._id)
            formData.append('fees', profileData.fees)
            formData.append('address', JSON.stringify(profileData.address))
            formData.append('available', profileData.available)
            formData.append('phone', profileData.phone)
            formData.append('clinicName', profileData.clinicName)
            formData.append('about', profileData.about)
            formData.append('availableFrom', profileData.availableFrom || '')
            formData.append('availableTo', profileData.availableTo || '')
            formData.append('slotDuration', profileData.slotDuration || 60)
            if (selectedImage) {
                formData.append('image', selectedImage)
            }

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', formData, {
                headers: { dToken, 'Content-Type': 'multipart/form-data' }
            })

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                setSelectedImage(null)
                getProfileData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    return profileData && (
        <div className='p-6 bg-gray-50 min-h-screen'>
            <div className='max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* image section */}
                <div className='relative bg-gray-100 flex items-center justify-center p-4'>
                    <img
                        className='w-48 h-48 rounded-full object-cover'
                        src={selectedImage ? URL.createObjectURL(selectedImage) : profileData.image}
                        alt="Doctor"
                    />
                    {isEdit && (
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className='absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition'
                        >
                            <FaCamera />
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setSelectedImage(e.target.files[0])
                            }
                        }}
                    />
                </div>

                <div className='md:col-span-2 p-6 flex flex-col gap-4'>
                    <div>
                        <p className='text-3xl font-semibold text-gray-800'>{profileData.name}</p>
                        <p className='text-gray-600 mt-1'>{profileData.degree} • {profileData.speciality}</p>
                        <span className='inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full'>{profileData.experience}</span>
                    </div>

                    <div>
                        <p className='text-gray-700 font-medium'>About</p>
                        {isEdit ? (
                            <textarea
                                onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                                className='w-full mt-1 p-2 border rounded resize-none'
                                rows={5}
                                value={profileData.about}
                            />
                        ) : (
                            <p className='text-gray-600 mt-1'>{profileData.about}</p>
                        )}
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                            <p className='text-gray-700 font-medium'>Fee</p>
                            {isEdit ? (
                                <input
                                    type='number'
                                    onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                                    value={profileData.fees}
                                    className='mt-1 p-2 border rounded w-full'
                                />
                            ) : (
                                <p className='text-gray-600 mt-1'>{currency} {profileData.fees}</p>
                            )}
                        </div>
                        <div>
                            <p className='text-gray-700 font-medium'>Available</p>
                            <div className='mt-1'>
                                <label className='inline-flex items-center'>
                                    <input
                                        type='checkbox'
                                        onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                                        checked={profileData.available}
                                        className='form-checkbox'
                                    />
                                    <span className='ml-2 text-gray-600'>Yes</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4'>
                        <div>
                            <p className='text-gray-700 font-medium'>Available From</p>
                            {isEdit ? (
                                <input
                                    type='time'
                                    onChange={(e) => setProfileData(prev => ({ ...prev, availableFrom: e.target.value }))}
                                    value={profileData.availableFrom || ''}
                                    className='mt-1 p-2 border rounded w-full'
                                />
                            ) : (
                                <p className='text-gray-600 mt-1'>{profileData.availableFrom || '10:00'}</p>
                            )}
                        </div>

                        <div>
                            <p className='text-gray-700 font-medium'>Available To</p>
                            {isEdit ? (
                                <input
                                    type='time'
                                    onChange={(e) => setProfileData(prev => ({ ...prev, availableTo: e.target.value }))}
                                    value={profileData.availableTo || ''}
                                    className='mt-1 p-2 border rounded w-full'
                                />
                            ) : (
                                <p className='text-gray-600 mt-1'>{profileData.availableTo || '21:00'}</p>
                            )}
                        </div>

                        <div>
                            <p className='text-gray-700 font-medium'>Slot Duration (mins)</p>
                            {isEdit ? (
                                <input
                                    type='number'
                                    min={15}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, slotDuration: e.target.value }))}
                                    value={profileData.slotDuration || 60}
                                    className='mt-1 p-2 border rounded w-full'
                                />
                            ) : (
                                <p className='text-gray-600 mt-1'>{profileData.slotDuration || 60} mins</p>
                            )}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div>
                            <p className='text-gray-700 font-medium'>Clinic Name</p>
                            {isEdit ? (
                                <input
                                    type='text'
                                    onChange={(e) => setProfileData(prev => ({ ...prev, clinicName: e.target.value }))}
                                    value={profileData.clinicName || ''}
                                    className='mt-1 p-2 border rounded w-full'
                                />
                            ) : (
                                <p className='text-gray-600 mt-1'>{profileData.clinicName || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <p className='text-gray-700 font-medium'>Phone</p>
                            {isEdit ? (
                                <input
                                    type='tel'
                                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                    value={profileData.phone || ''}
                                    className='mt-1 p-2 border rounded w-full'
                                />
                            ) : (
                                <p className='text-gray-600 mt-1'>{profileData.phone || 'N/A'}</p>
                            )}
                        </div>
                    </div>

                    <div className='mt-4'>
                        {isEdit ? (
                            <button
                                onClick={updateProfile}
                                className='px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition'
                            >
                                Save Changes
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEdit(true)}
                                className='px-6 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition'
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorProfile