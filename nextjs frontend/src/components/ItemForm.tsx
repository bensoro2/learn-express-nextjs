import React, { useState } from 'react';
import Swal from 'sweetalert2';

interface ItemFormProps {
    onItemAdded: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ onItemAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userToken = localStorage.getItem('userToken');
        if (!userToken) {
            Swal.fire('Error!', 'You need to log in to add items.', 'error');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (image) {
            formData.append('image', image);
        }

        try {
            const response = await fetch('http://localhost:3001/api/items', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                console.log('Item created successfully');
                setTitle('');
                setDescription('');
                setImage(null);
                await Swal.fire('Success!', 'Item created successfully!', 'success');
                onItemAdded(); // Call the callback to refresh items
            } else {
                throw new Error('Error creating item');
            }
        } catch (error) {
            console.error('Error:', error);
            await Swal.fire('Error!', 'Failed to create item. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-center text-black">Add New Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-black mb-1">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out"
                        required
                        placeholder="Enter item title"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-black mb-1">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition duration-150 ease-in-out"
                        rows={4}
                        required
                        placeholder="Describe your item"
                    />
                </div>
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-black mb-1">Image</label>
                    <div className="mt-1 flex items-center">
                        <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                            {image ? (
                                <img src={URL.createObjectURL(image)} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </span>
                        <label
                            htmlFor="image-upload"
                            className="ml-4 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black cursor-pointer"
                        >
                            Choose file
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) => {
                                if (e.target.files) {
                                    setImage(e.target.files[0]);
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className={`px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-black text-white'} rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-75 transition duration-300 ease-in-out`}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Item'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ItemForm;
