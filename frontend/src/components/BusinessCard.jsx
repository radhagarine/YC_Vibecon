import React from 'react';
import { Button } from './ui/button';
import { Edit, Trash2, Calendar, Building2, Phone } from 'lucide-react';
import { Card } from './ui/card';

const BusinessCard = ({ business, onEdit, onDelete, onCalendar }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Red Top Border */}
      <div className="h-1 bg-gradient-to-r from-red-600 to-red-700"></div>
      
      <div className="p-6">
        {/* Business Info */}
        <div className="flex items-start space-x-4 mb-6">
          {business.logo_url ? (
            <img 
              src={`${BACKEND_URL}${business.logo_url}`}
              alt={business.business_name}
              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{business.business_name}</h3>
            <p className="text-sm text-gray-500">{business.business_type}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <Button
            onClick={() => onCalendar(business)}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            onClick={() => onEdit(business)}
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(business)}
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-red-50 text-gray-700 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Contact Details */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          {business.business_phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              {business.business_phone}
            </div>
          )}
          {business.custom_services && business.custom_services.length > 0 && (
            <div className="flex items-start text-sm text-gray-600">
              <span className="font-medium text-gray-700">Services:</span>
              <span className="ml-2">{business.custom_services.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BusinessCard;