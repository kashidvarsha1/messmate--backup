import { getProviderByPublicId, providerIdMap } from '../utils/providerApi';
import { useState } from 'react';
import { motion } from 'framer-motion';

const ProviderFilters = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    status: '',
    maxPrice: '',
    isVegetarian: '',
    cuisine: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      status: '',
      maxPrice: '',
      isVegetarian: '',
      cuisine: ''
    });
    onFilter({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>🔍</span> Filter Providers
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select name="status" value={filters.status} onChange={handleChange} className="input-field">
          <option value="">All Status</option>
          <option value="open">🟢 Open</option>
          <option value="closed">🔴 Closed</option>
          <option value="limited">🟡 Limited</option>
        </select>
        
        <input type="number" name="maxPrice" placeholder="Max Price (₹)" value={filters.maxPrice} onChange={handleChange} className="input-field" />
        
        <select name="isVegetarian" value={filters.isVegetarian} onChange={handleChange} className="input-field">
          <option value="">All Food</option>
          <option value="true">🥬 Vegetarian Only</option>
          <option value="false">🍗 Non-Vegetarian</option>
        </select>
        
        <select name="cuisine" value={filters.cuisine} onChange={handleChange} className="input-field">
          <option value="">All Cuisine</option>
          <option value="north-indian">North Indian</option>
          <option value="south-indian">South Indian</option>
          <option value="punjabi">Punjabi</option>
        </select>
      </div>
      
      <div className="flex gap-3 mt-4">
        <button type="submit" className="btn-primary px-6">Apply Filters</button>
        <button type="button" onClick={handleReset} className="btn-secondary">Reset</button>
      </div>
    </form>
  );
};

export default ProviderFilters;
