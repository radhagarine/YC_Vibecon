import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    business_phone: '',
    custom_services: [],
    documents: []
  });
  
  const [newService, setNewService] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      // Load business types
      const typesResponse = await axios.get(`${API}/profile/business-types`, {
        withCredentials: true
      });
      setBusinessTypes(typesResponse.data.business_types);

      // Try to load existing profile
      try {
        const profileResponse = await axios.get(`${API}/profile`, {
          withCredentials: true
        });
        setFormData(profileResponse.data);
        setProfileExists(true);
      } catch (error) {
        if (error.response?.status === 404) {
          // Profile doesn't exist yet
          setProfileExists(false);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addService = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        custom_services: [...(prev.custom_services || []), newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      custom_services: prev.custom_services.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingDoc(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append('file', file);

      const response = await axios.post(`${API}/profile/upload-document`, formDataFile, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), response.data]
      }));

      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeDocument = async (index) => {
    const doc = formData.documents[index];
    try {
      await axios.delete(`${API}/profile/document/${doc.id}`, {
        withCredentials: true
      });
      
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index)
      }));
      
      toast.success('Document removed');
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = profileExists ? 'put' : 'post';
      await axios[method](`${API}/profile`, formData, {
        withCredentials: true
      });
      
      toast.success(profileExists ? 'Profile updated successfully!' : 'Profile created successfully!');
      setProfileExists(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="bg-black border-b border-zinc-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white text-sm">{user.name}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
            {user.picture && (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
            )}
          </div>
        </div>
      </header>

      {/* Profile Form */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Business Profile</h2>
          <p className="text-gray-400">
            Configure your business details for AIRA voice assistant
          </p>
        </div>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Business Information</CardTitle>
            <CardDescription className="text-gray-400">
              Help AIRA understand your business better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <Label htmlFor="business_name" className="text-white mb-2 block">
                  Business Name *
                </Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="e.g., ABC Restaurant"
                  required
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Business Type */}
              <div>
                <Label htmlFor="business_type" className="text-white mb-2 block">
                  Type of Business *
                </Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) => handleInputChange('business_type', value)}
                  required
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-zinc-800">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Business Phone */}
              <div>
                <Label htmlFor="business_phone" className="text-white mb-2 block">
                  Business Phone Number *
                </Label>
                <Input
                  id="business_phone"
                  type="tel"
                  value={formData.business_phone}
                  onChange={(e) => handleInputChange('business_phone', e.target.value)}
                  placeholder="e.g., (555) 123-4567"
                  required
                  className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Custom Services */}
              <div>
                <Label className="text-white mb-2 block">
                  Custom Services
                </Label>
                <p className="text-gray-400 text-sm mb-3">
                  Add services specific to your business (optional)
                </p>
                
                {/* Service List */}
                {formData.custom_services.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {formData.custom_services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-zinc-900 p-3 rounded border border-zinc-700"
                      >
                        <span className="text-white">{service}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-red-500 hover:text-red-400 hover:bg-zinc-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Service Input */}
                <div className="flex space-x-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addService();
                      }
                    }}
                    placeholder="e.g., Hair Coloring, Tax Consulting"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500 flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addService}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Saving...' : profileExists ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;