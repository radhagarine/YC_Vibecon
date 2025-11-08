import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, X, Save, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BusinessFormModal = ({ business, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    business_phone: '',
    custom_services: [],
    logo_url: null,
    documents: []
  });
  
  const [newService, setNewService] = useState('');

  useEffect(() => {
    loadBusinessTypes();
    if (business) {
      setFormData({
        business_name: business.business_name || '',
        business_type: business.business_type || '',
        business_phone: business.business_phone || '',
        custom_services: business.custom_services || [],
        logo_url: business.logo_url || null,
        documents: business.documents || []
      });
    }
  }, [business]);

  const loadBusinessTypes = async () => {
    try {
      const response = await axios.get(`${API}/profile/business-types`, {
        withCredentials: true
      });
      setBusinessTypes(response.data.business_types);
    } catch (error) {
      console.error('Error loading business types:', error);
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

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size must be less than 2MB');
      return;
    }

    if (!business?.id) {
      toast.error('Please save the business first before uploading logo');
      return;
    }

    setUploadingLogo(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append('file', file);

      const response = await axios.post(
        `${API}/business/${business.id}/upload-logo`,
        formDataFile,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setFormData(prev => ({ ...prev, logo_url: response.data.logo_url }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!business?.id) {
      toast.error('Please save the business first before uploading documents');
      return;
    }

    setUploadingDoc(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append('file', file);

      const response = await axios.post(
        `${API}/business/${business.id}/upload-document`,
        formDataFile,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

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
    if (!business?.id) return;

    try {
      await axios.delete(`${API}/business/${business.id}/document/${doc.id}`, {
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
    setLoading(true);

    try {
      const payload = {
        business_name: formData.business_name,
        business_type: formData.business_type,
        business_phone: formData.business_phone,
        custom_services: formData.custom_services
      };

      if (business) {
        // Update existing business
        await axios.put(`${API}/business/${business.id}`, payload, {
          withCredentials: true
        });
        toast.success('Business updated successfully');
      } else {
        // Create new business
        await axios.post(`${API}/business`, payload, {
          withCredentials: true
        });
        toast.success('Business created successfully');
      }

      onClose(true);
    } catch (error) {
      console.error('Error saving business:', error);
      toast.error(error.response?.data?.detail || 'Failed to save business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {business ? 'Edit Business' : 'Add New Business'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Logo Upload */}
          {business && (
            <div>
              <Label className="text-gray-900 mb-2 block">Business Logo</Label>
              <div className="flex items-center space-x-4">
                {formData.logo_url ? (
                  <img 
                    src={`${BACKEND_URL}${formData.logo_url}`}
                    alt="Logo" 
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200"></div>
                )}
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('logo-upload').click()}
                    disabled={uploadingLogo}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG (max 2MB)</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Name */}
          <div>
            <Label htmlFor="business_name" className="text-gray-900 mb-2 block">
              Business Name *
            </Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => handleInputChange('business_name', e.target.value)}
              placeholder="e.g., ABC Restaurant"
              required
              className="border-gray-300"
            />
          </div>

          {/* Business Type */}
          <div>
            <Label htmlFor="business_type" className="text-gray-900 mb-2 block">
              Type of Business *
            </Label>
            <Select
              value={formData.business_type}
              onValueChange={(value) => handleInputChange('business_type', value)}
              required
            >
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type} className="hover:bg-gray-100">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Phone */}
          <div>
            <Label htmlFor="business_phone" className="text-gray-900 mb-2 block">
              Business Phone Number *
            </Label>
            <Input
              id="business_phone"
              type="tel"
              value={formData.business_phone}
              onChange={(e) => handleInputChange('business_phone', e.target.value)}
              placeholder="e.g., (555) 123-4567"
              required
              className="border-gray-300"
            />
          </div>

          {/* Custom Services */}
          <div>
            <Label className="text-gray-900 mb-2 block">Custom Services</Label>
            <p className="text-gray-600 text-sm mb-3">
              Add services specific to your business (optional)
            </p>
            
            {formData.custom_services && formData.custom_services.length > 0 && (
              <div className="mb-3 space-y-2">
                {formData.custom_services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200"
                  >
                    <span className="text-gray-900">{service}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addService(e);
                  }
                }}
                placeholder="e.g., Hair Coloring, Tax Consulting"
                className="flex-1 border-gray-300"
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

          {/* Documents */}
          {business && (
            <div>
              <Label className="text-gray-900 mb-2 block">Business Documents</Label>
              <p className="text-gray-600 text-sm mb-3">
                Upload documents like menus, service lists, etc. (PDF, DOC, DOCX, max 5MB)
              </p>
              
              {formData.documents && formData.documents.length > 0 && (
                <div className="mb-3 space-y-2">
                  {formData.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-red-600 p-2 rounded">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{doc.filename}</p>
                          <p className="text-gray-500 text-xs">{(doc.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <input
                  type="file"
                  id="document-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('document-upload').click()}
                  disabled={uploadingDoc}
                  variant="outline"
                  className="w-full border-gray-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => onClose(false)}
              variant="outline"
              className="flex-1 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : business ? 'Update Business' : 'Create Business'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessFormModal;
