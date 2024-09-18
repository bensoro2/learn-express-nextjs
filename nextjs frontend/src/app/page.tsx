"use client";

import Head from 'next/head';
import React, { useState } from 'react';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleItemAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-white text-black">
            <Head>
                <title>My CRUD App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-8">Item Management</h1>
                <div className="space-y-8">
                    <div className="w-full max-w-2xl mx-auto">
                        <ItemForm onItemAdded={handleItemAdded} />
                    </div>
                    <div className="w-full">
                        <ItemList refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
