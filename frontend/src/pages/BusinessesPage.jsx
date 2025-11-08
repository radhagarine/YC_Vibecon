import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import BusinessFormModal from '../components/BusinessFormModal';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BusinessesPage = ({ user }) => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadBusinesses();
  }, [user, navigate]);

  const loadBusinesses = async () => {
    try {
      const response = await axios.get(`${API}/businesses`, {
        withCredentials: true
      });
      setBusinesses(response.data.businesses.map((b, idx) => ({ ...b, index: idx })));
    } catch (error) {
      console.error('Error loading businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBusiness = () => {
    setEditingBusiness(null);
    setShowModal(true);
  };

  const handleEditBusiness = (business) => {
    setEditingBusiness(business);
    setShowModal(true);
  };

  const handleDeleteBusiness = async (business) => {
    if (!window.confirm(`Are you sure you want to delete "${business.business_name}"? This will delete all related documents.`)) {
      return;
    }

    try {
      await axios.delete(`${API}/business/${business.id}`, {
        withCredentials: true
      });
      toast.success('Business deleted successfully');
      loadBusinesses();
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to delete business');
    }
  };

  const handleCalendar = (business) => {
    navigate(`/dashboard/calendar/${business.id}`);
  };

  const handleModalClose = (success) => {
    setShowModal(false);
    setEditingBusiness(null);
    if (success) {
      loadBusinesses();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading businesses...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Businesses</h1>
          <p className="text-gray-600 mt-1">Manage your business profiles for AIRA</p>
        </div>
        <Button
          onClick={handleAddBusiness}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Business
        </Button>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first business</p>
          <Button
            onClick={handleAddBusiness}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Business
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onEdit={handleEditBusiness}
              onDelete={handleDeleteBusiness}
              onCalendar={handleCalendar}
            />
          ))}
        </div>
      )}

      {showModal && (
        <BusinessFormModal
          business={editingBusiness}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default BusinessesPage;
