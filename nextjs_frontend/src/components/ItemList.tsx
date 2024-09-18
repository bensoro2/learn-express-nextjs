import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface ItemListProps {
    refreshTrigger: any; 
}

interface Item {
    id: number;
    title: string;
    description: string;
    image: string;
    createdAt: string;
    updatedAt: string;
}

const ItemList: React.FC<ItemListProps> = ({ refreshTrigger }) => {
    const [items, setItems] = useState<Item[]>([]);
    const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        fetchItems();
    }, [refreshTrigger]);

    const fetchItems = async (search: string = '') => {
        const response = await fetch(`http://localhost:3001/api/items${search ? `/search?query=${encodeURIComponent(search)}` : ''}`);
        const data = await response.json();
        setItems(data.sort((a: Item, b: Item) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    const handleSearch = () => {
        fetchItems(searchTerm); // เรียกใช้ฟังก์ชัน fetchItems ด้วยคำค้นหา
    };

    const handleDelete = async (id: number) => {
        const userToken = localStorage.getItem('userToken');
        if (!userToken) {
            Swal.fire('Error!', 'You need to log in to delete items.', 'error');
            return;
        }

        const confirmed = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (confirmed.isConfirmed) {
            const response = await fetch(`http://localhost:3001/api/items/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            if (response.ok) {
                Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
                fetchItems();
            } else {
                Swal.fire('Failed!', 'Failed to delete item. Please try again.', 'error');
            }
        }
    };

    const handleEdit = async (item: Item) => {
        const userToken = localStorage.getItem('userToken');
        if (!userToken) {
            Swal.fire('Error!', 'You need to log in to edit items.', 'error');
            return;
        }
    
        const { value: formValues } = await Swal.fire({
            title: 'Edit Item',
            html:
                `<input id="swal-input1" class="swal2-input" placeholder="Title" value="${item.title}">` +
                `<textarea id="swal-input2" class="swal2-textarea" placeholder="Description" style="height: 200px;">${item.description}</textarea>` +
                (item.image ? `<img src="http://localhost:3001/images/${item.image}" alt="Current Image" style="width: 100px; height: 100px; object-fit: cover; margin-bottom: 10px;"/>` : '') +
                `<input id="swal-input3" type="file" class="swal2-file" accept="image/*">`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const title = (document.getElementById('swal-input1') as HTMLInputElement).value;
                const description = (document.getElementById('swal-input2') as HTMLTextAreaElement).value;
                const imageFile = (document.getElementById('swal-input3') as HTMLInputElement).files?.[0];
    
                return { title, description, imageFile };
            }
        });
    
        if (formValues) {
            const { title, description, imageFile } = formValues;
    
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            if (imageFile) {
                formData.append('image', imageFile);
            } else {
                // ส่งชื่อไฟล์เดิมเมื่อไม่มีการเลือกภาพใหม่
                formData.append('existingImage', item.image);
            }
    
            try {
                const response = await fetch(`http://localhost:3001/api/items/${item.id}`, {
                    method: 'PUT',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                });
    
                if (response.ok) {
                    await Swal.fire('Success!', 'Item updated successfully!', 'success');
                    fetchItems(); // Refresh the item list
                } else {
                    throw new Error('Error updating item');
                }
            } catch (error) {
                console.error('Error:', error);
                await Swal.fire('Error!', 'Failed to update item. Please try again.', 'error');
            }
        }
    };

    const toggleDescription = (id: number) => {
        setExpandedItemId(expandedItemId === id ? null : id);
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">Items</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded px-2 py-1 mr-2"
                />
                <button onClick={handleSearch} className="bg-blue-500 text-white rounded px-3 py-1">
                    Search
                </button>
            </div>
            {items.length === 0 ? (
                <p className="text-gray-500">No items found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition duration-300 flex flex-col">
                            {item.image && (
                                <img src={`http://localhost:3001/images/${item.image}`} alt={item.title} className="mb-2 w-full h-48 object-cover rounded-md" />
                            )}
                            <h3 className="text-xl font-semibold mb-2 text-black">{item.title}</h3>
                            <p className={`text-gray-600 mb-2 ${expandedItemId === item.id ? '' : 'line-clamp-2'}`}>{item.description}</p>
                            <p className="text-sm text-gray-500 mt-2">Created: {new Date(item.createdAt).toLocaleString()}</p>
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => toggleDescription(item.id)}
                                    className="px-3 py-1 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
                                >
                                    {expandedItemId === item.id ? 'Show Less' : 'Read More'}
                                </button>
                                {localStorage.getItem('userToken') && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="px-3 py-1 bg-black text-white rounded-md hover:bg-gray-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ItemList;
