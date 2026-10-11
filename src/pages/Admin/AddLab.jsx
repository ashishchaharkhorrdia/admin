import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddLab = () => {
    const [labImg, setLabImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('Lab')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')
    const [phone, setPhone] = useState('')
    const [clinicName, setClinicName] = useState('')
    const [tests, setTests] = useState([{ name: '', price: '', description: '' }])

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if (!labImg) {
                return toast.error('Please Upload Lab Image')
            }

            const formData = new FormData();
            formData.append('image', labImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('type', 'lab')
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))
            formData.append('phone', phone)
            formData.append('clinicName', clinicName)
            formData.append('tests', JSON.stringify(tests.map(test => ({
                name: test.name,
                price: Number(test.price),
                description: test.description
            }))));

            const { data } = await axios.post(
                backendUrl + '/api/admin/add-lab',
                formData,
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setLabImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees('')
                setPhone('')
                setClinicName('')
                setSpeciality('Lab')
                setTests([{ name: '', price: '', description: '' }])
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Add New Lab</h1>
                <form onSubmit={onSubmitHandler} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                        <label htmlFor="lab-img" className="cursor-pointer group">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 group-hover:scale-105 transition-all">
                                <img src={labImg ? URL.createObjectURL(labImg) : assets.upload_area} alt="" className="w-full h-full object-cover" />
                            </div>
                        </label>
                        <input onChange={(e) => setLabImg(e.target.files[0])} type="file" id="lab-img" hidden />
                        <div className="text-white">
                            <p className="text-lg font-semibold">Upload Lab Profile Image</p>
                            <p className="text-sm text-gray-300">High quality square image recommended</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2  gap-8">
                        <div className="space-y-5">
                            <InputField label="Lab Name" value={name} setValue={setName} type="text" />
                            <InputField label="Email" value={email} setValue={setEmail} type="email" />
                            <InputField label="Password" value={password} setValue={setPassword} type="password" />
                            <SelectField label="Experience" value={experience} setValue={setExperience} options={['1 Year', '2 Years', '3 Years', '4 Years', '5 Years', '6 Years', '8 Years', '9 Years', '10 Years']} />
                            <InputField label="Base Fee / Sample Collection Fees (₹)" value={fees} setValue={setFees} type="number" />
                        </div>
                        <div className="space-y-5">
                            <SelectField label="Speciality" value={speciality} setValue={setSpeciality} options={['Lab']} />
                            <InputField label="Qualification" value={degree} setValue={setDegree} type="text" />
                            <InputField label="Lab Address Line 1" value={address1} setValue={setAddress1} type="text" />
                            <InputField label="Lab Address Line 2" value={address2} setValue={setAddress2} type="text" />
                            <InputField label="Phone Number" value={phone} setValue={setPhone} type="tel" />
                            <InputField label="Lab Name" value={clinicName} setValue={setClinicName} type="text" />
                        </div>
                    </div>
                    <div className="mt-6 bg-slate-50 rounded-3xl bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] p-6 border border-slate-200">
                        <h3 className="text-lg font-semibold mb-4">Lab Tests</h3>
                        {tests.map((test, index) => (
                            <div key={index} className="grid gap-4 md:grid-cols-3 mb-4 items-end">
                                <div>
                                    <label className="text-white font-medium mb-2 block">Test Name</label>
                                    <input type="text" value={test.name} onChange={e => setTests(prev => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} className="w-full rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Blood Test" />
                                </div>
                                <div>
                                    <label className="text-white font-medium mb-2 block">Price (₹)</label>
                                    <input type="number" value={test.price} onChange={e => setTests(prev => prev.map((item, i) => i === index ? { ...item, price: e.target.value } : item))} className="w-full rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="1200" />
                                </div>
                                <div>
                                    <label className="text-white font-medium mb-2 block">Description</label>
                                    <input type="text" value={test.description} onChange={e => setTests(prev => prev.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} className="w-full rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Sample collection included" />
                                </div>
                                <div className="flex items-center gap-3">
                                    {tests.length > 1 && (
                                        <button type="button" onClick={() => setTests(prev => prev.filter((_, i) => i !== index))} className="rounded-full bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600">Remove</button>
                                    )}
                                    {index === tests.length - 1 && (
                                        <button type="button" onClick={() => setTests(prev => [...prev, { name: '', price: '', description: '' }])} className="rounded-full bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600">Add Test</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8">
                        <label className="text-white font-medium mb-2 block">About Lab</label>
                        <textarea value={about} onChange={e => setAbout(e.target.value)} rows={5} className="w-full rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Write about lab services, collection process and specialties..." />
                    </div>
                    <div className="mt-10 text-center">
                        <button type="submit" className="px-12 py-4 rounded-full text-white font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all duration-300 shadow-lg">Add Lab</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const InputField = ({ label, value, setValue, type }) => (
    <div>
        <label className="text-white font-medium mb-2 block">{label}</label>
        <input type={type} value={value} onChange={e => setValue(e.target.value)} required className="w-full rounded-xl bg-white/20 text-white placeholder-gray-300 border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
    </div>
)

const SelectField = ({ label, value, setValue, options }) => (
    <div>
        <label className="text-white font-medium mb-2 block">{label}</label>
        <select value={value} onChange={e => setValue(e.target.value)} className="w-full rounded-xl bg-white/20 text-white border border-white/30 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400">
            {options.map((opt, i) => (
                <option key={i} value={opt} className="text-black">{opt}</option>
            ))}
        </select>
    </div>
)

export default AddLab
