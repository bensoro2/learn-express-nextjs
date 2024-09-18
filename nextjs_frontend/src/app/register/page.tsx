// components/RegisterForm.tsx
"use client"

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

const RegisterForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true); // State สำหรับเช็คว่าเรากำลังโหลดอยู่หรือไม่

    useEffect(() => {
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            router.push('/'); // เปลี่ยนเส้นทางไปหน้าโฮม
        } else {
            setIsLoading(false); // ตั้งค่า isLoading เป็น false เพื่อแสดงฟอร์ม
        }
    }, [router]);

    if (isLoading) {
        return null; // ไม่แสดงอะไรจนกว่าการตรวจสอบจะเสร็จ
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name, password }),
            });

            if (response.ok) {
                await Swal.fire('Success!', 'Registered successfully!', 'success');
                router.push('/login'); // Redirect to login page
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            await Swal.fire('Error!', 'Failed to register. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-black mb-4 text-center">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-black">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                            required
                            placeholder="Enter your name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-black">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-black">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black"
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            className={`w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
