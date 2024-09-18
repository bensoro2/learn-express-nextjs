import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'; // เพิ่มการนำเข้า SweetAlert

const Navbar: React.FC = () => {
    const router = useRouter();
    const [userName, setUserName] = useState<string | null>('Guest');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('userName');
            setUserName(storedName || 'Guest');
        }
    }, []);

    const handleLoginClick = () => {
        router.push('/login');
    };

    const handleRegisterClick = () => {
        router.push('/register');
    };

    const handleLogout = async () => {
        const confirmed = await Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, log me out!',
        });

        if (confirmed.isConfirmed) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('userToken');
                localStorage.removeItem('userName'); 
            }
            setUserName('Guest'); // Reset username in state
            router.push('/');
            window.location.reload()
        }
    };

    return (
        <nav className="bg-black p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-2xl font-bold">My CRUD App</h1>
                <div className="space-x-4">
                    {userName !== 'Guest' ? (
                        <>
                            <span className="text-white">{userName}</span>
                            <button 
                                onClick={handleLogout} 
                                className="text-white hover:bg-gray-700 px-3 py-2 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={handleLoginClick}
                                className="text-black bg-white hover:bg-gray-300 px-3 py-2 rounded"
                            >
                                Login
                            </button>
                            <button 
                                onClick={handleRegisterClick}
                                className="text-black bg-white hover:bg-gray-300 px-3 py-2 rounded"
                            >
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
