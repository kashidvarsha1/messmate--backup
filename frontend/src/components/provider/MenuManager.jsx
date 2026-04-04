import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const MenuManager = ({ provider, onUpdate }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    itemName: '',
    price: '',
    category: 'lunch',
    description: '',
    isAvailable: true,
    isVeg: true
  });

  useEffect(() => {
    fetchMenu();
  }, [provider]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/providers/${provider._id}/menu`);
      setMenuItems(response.data.data || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Menu load nahi hua');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.price) {
      toast.error('Item naam aur price zaroori hai');
      return;
    }

    try {
      if (editingItem) {
        await axios.put(`/providers/${provider._id}/menu/${editingItem._id}`, {
          itemName: form.itemName,
          price: parseInt(form.price),
          category: form.category,
          isAvailable: form.isAvailable,
          isVeg: form.isVeg
        });
        toast.success('Item update ho gaya!');
      } else {
        await axios.post(`/providers/${provider._id}/menu`, {
          itemName: form.itemName,
          price: parseInt(form.price),
          category: form.category,
          isAvailable: form.isAvailable,
          isVeg: form.isVeg
        });
        toast.success('Item add ho gaya!');
      }
      setShowForm(false);
      setEditingItem(null);
      setForm({ itemName: '', price: '', category: 'lunch', isAvailable: true, isVeg: true });
      fetchMenu();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error(error.response?.data?.message || 'Error aaya');
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Pakka delete karna hai?')) return;
    try {
      await axios.delete(`/providers/${provider._id}/menu/${itemId}`);
      toast.success('Item delete ho gaya!');
      fetchMenu();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error('Delete fail hua');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      itemName: item.itemName,
      price: item.price,
      category: item.category || 'lunch',
      isAvailable: item.isAvailable !== false,
      isVeg: item.isVeg !== false
    });
    setShowForm(true);
  };

  const categories = [
    { value: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { value: 'lunch', label: 'Lunch', icon: '🍱' },
    { value: 'dinner', label: 'Dinner', icon: '🍛' },
    { value: 'tiffin', label: 'Tiffin', icon: '📦' },
    { value: 'snacks', label: 'Snacks', icon: '🍿' },
    { value: 'drinks', label: 'Drinks', icon: '🥤' },
    { value: 'other', label: 'Other', icon: '🍽️' }
  ];

  if (loading) {
    return <div className="text-center py-4">Loading menu...</div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display font-bold text-lg text-gray-800">Menu</h3>
        <button
          onClick={() => { setShowForm(!showForm); setEditingItem(null); setForm({ itemName: '', price: '', category: 'lunch', isAvailable: true, isVeg: true }); }}
          className="btn-primary py-1.5 px-4 text-sm"
        >
          ➕ Add Item
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-amber-50 rounded-xl">
          <h4 className="font-semibold mb-3">{editingItem ? 'Edit Item' : 'Naya Item'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Item Name *</label>
              <input
                type="text"
                value={form.itemName}
                onChange={(e) => setForm({...form, itemName: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({...form, price: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isVeg}
                  onChange={(e) => setForm({...form, isVeg: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({...form, isAvailable: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Available</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn-primary py-2 px-4">
              {editingItem ? 'Update' : 'Add'} Item
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); }} className="btn-secondary py-2 px-4">
              Cancel
            </button>
          </div>
        </form>
      )}

      {menuItems.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Koi menu item nahi hai. Add karo!</p>
      ) : (
        <div className="space-y-2">
          {categories.map(category => {
            const items = menuItems.filter(item => item.category === category.value);
            if (items.length === 0) return null;
            return (
              <div key={category.value}>
                <h4 className="font-semibold text-gray-700 mt-3 mb-2">{category.icon} {category.label}</h4>
                {items.map(item => (
                  <div key={item._id} className="flex justify-between items-center p-3 border rounded-lg mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.itemName}</span>
                        {item.isVeg ? (
                          <span className="text-xs text-green-600">🟢 Veg</span>
                        ) : (
                          <span className="text-xs text-red-600">🔴 Non-Veg</span>
                        )}
                        {!item.isAvailable && (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded">Not Available</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-500">₹{item.price}</div>
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleEdit(item)} className="text-blue-500 text-sm">Edit</button>
                        <button onClick={() => handleDelete(item._id)} className="text-red-500 text-sm">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuManager;