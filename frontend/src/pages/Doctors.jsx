import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const Doctors = () => {
  const [filters, setFilters] = useState({
    specialty: [],
    availability: []
  });

  const doctors = [
    { 
      id: 1, 
      name: 'Dr. Emily Carter', 
      specialty: 'Cardiologist', 
      availability: 'Mon-Fri', 
      rating: 4.5,
      image: null
    },
    { 
      id: 2, 
      name: 'Dr. Michael Zhang', 
      specialty: 'Neurologist', 
      availability: 'Tue, Thu, Sat', 
      rating: 5.0,
      image: null
    },
    { 
      id: 3, 
      name: 'Dr. Sarah Lee', 
      specialty: 'Dermatologist', 
      availability: 'Wed, Fri', 
      rating: 4.0,
      image: null
    },
  ];

  const handleSpecialtyChange = (specialty) => {
    setFilters({
      ...filters,
      specialty: filters.specialty.includes(specialty)
        ? filters.specialty.filter(s => s !== specialty)
        : [...filters.specialty, specialty]
    });
  };

  const handleAvailabilityChange = (availability) => {
    setFilters({
      ...filters,
      availability: filters.availability.includes(availability)
        ? filters.availability.filter(a => a !== availability)
        : [...filters.availability, availability]
    });
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />);
    }
    if (halfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStar} className="text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-60">
            <h2 className="text-lg font-semibold text-black mb-4">Filters</h2>
            
            {/* Specialty Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-black mb-3">Specialty</h3>
              <div className="space-y-2">
                {['Cardiology', 'Dermatology', 'Neurology'].map((specialty) => (
                  <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.specialty.includes(specialty)}
                      onChange={() => handleSpecialtyChange(specialty)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <h3 className="text-sm font-semibold text-black mb-3">Availability</h3>
              <div className="space-y-2">
                {['Today', 'This Week'].map((availability) => (
                  <label key={availability} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="availability"
                      checked={filters.availability.includes(availability)}
                      onChange={() => handleAvailabilityChange(availability)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{availability}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white border border-blue-300 rounded-lg overflow-hidden">
                  {/* Doctor Image */}
                  <div className="bg-gray-200 h-40 flex items-center justify-center">
                    {doctor.image ? (
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Doctor Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-blue-600 mb-1">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{doctor.specialty}</p>
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="text-black">Available:</span> {doctor.availability}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(doctor.rating)}
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-sky-300 text-white py-2 px-4 rounded hover:bg-sky-400">
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Doctors;
