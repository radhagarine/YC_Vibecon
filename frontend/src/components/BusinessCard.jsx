import React from 'react';
import { Button } from './ui/button';
import { Edit, Trash2, Calendar, Building2 } from 'lucide-react';
import { Card } from './ui/card';

const BusinessCard = ({ business, onEdit, onDelete, onCalendar }) => {
  const getCardColor = (index) => {
    const colors = [
      'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
      'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
      'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
      'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className={`p-6 ${getCardColor(business.index || 0)} border hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {business.logo_url ? (
            <img 
              src={business.logo_url} 
              alt={business.business_name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{business.business_name}</h3>
            <p className="text-sm text-gray-600">{business.business_type}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Phone:</span> {business.business_phone}
        </p>
        {business.custom_services && business.custom_services.length > 0 && (
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Services:</span> {business.custom_services.join(', ')}
          </p>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => onEdit(business)}
          variant="outline"
          size="sm"
          className="flex-1 border-gray-300 hover:bg-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={() => onCalendar(business)}
          variant="outline"
          size="sm"
          className="flex-1 border-gray-300 hover:bg-white"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Calendar
        </Button>
        <Button
          onClick={() => onDelete(business)}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default BusinessCard;