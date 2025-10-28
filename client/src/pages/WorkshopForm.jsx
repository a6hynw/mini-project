import React, { useState } from 'react';
import axios from 'axios';

export default function WorkshopForm({ onWorkshopCreated }) {
  const [form, setForm] = useState({ title: '', description: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/workshops', form, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Workshop created successfully!');
      setForm({ title: '', description: '', date: '' });
      if (onWorkshopCreated) onWorkshopCreated(res.data.workshop);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating workshop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8 p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Workshop</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        {message && <div className="text-green-700">{message}</div>}
        {error && <div className="text-red-700">{error}</div>}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">{loading ? 'Adding...' : 'Add Workshop'}</button>
      </form>
    </div>
  );
}
