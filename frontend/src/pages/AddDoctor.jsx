import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faSave, 
  faUser, 
  faStethoscope, 
  faMapMarkerAlt,
  faGraduationCap,
  faAward,
  faClock,
  faLanguage,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const AddDoctor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    subSpecialty: '',
    experience: '',
    location: '',
    phone: '',
    email: '',
    availability: '',
    bio: '',
    education: [{ degree: '', institution: '', year: '' }],
    certifications: [''],
    languages: [''],
    availableToday: false,
    availableTomorrow: false,
    availableThisWeek: false
  });

  const specialties = [
    'Cardiology',
    'Neurology', 
    'Dermatology',
    'Orthopedics',
    'Pediatrics',
    'Oncology',
    'Gastroenterology',
    'Endocrinology',
    'Psychiatry',
    'Radiology',
    'Anesthesiology',
    'Emergency Medicine',
    'Internal Medicine',
    'Family Medicine',
    'Obstetrics & Gynecology'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, education: newEducation }));
    }
  };

  const handleCertificationChange = (index, value) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = value;
    setFormData(prev => ({ ...prev, certifications: newCertifications }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const removeCertification = (index) => {
    if (formData.certifications.length > 1) {
      const newCertifications = formData.certifications.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, certifications: newCertifications }));
    }
  };

  const handleLanguageChange = (index, value) => {
    const newLanguages = [...formData.languages];
    newLanguages[index] = value;
    setFormData(prev => ({ ...prev, languages: newLanguages }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, '']
    }));
  };

  const removeLanguage = (index) => {
    if (formData.languages.length > 1) {
      const newLanguages = formData.languages.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, languages: newLanguages }));
    }
  };

  const validateForm = () => {
    const required = ['name', 'specialty', 'experience', 'location', 'phone', 'email'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      alert(`Please fill in the following required fields: ${missing.join(', ')}`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      alert('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        education: formData.education.filter(edu => edu.degree && edu.institution),
        certifications: formData.certifications.filter(cert => cert.trim()),
        languages: formData.languages.filter(lang => lang.trim())
      };

      const response = await fetch('http://localhost:5002/api/doctors/test-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await response.json();
        alert('Doctor added successfully!');
        navigate('/doctors');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add doctor');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert(`Error adding doctor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/doctors')}
              className="mr-4 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faUser} className="text-blue-600 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty *
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Specialty</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Specialty
                </label>
                <input
                  type="text"
                  name="subSpecialty"
                  value={formData.subSpecialty}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Interventional Cardiology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="8"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 mr-2" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Building A, Room 201"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john.smith@hospease.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Schedule
                </label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mon-Fri, 9AM-5PM"
                />
              </div>
            </div>

            {/* Availability Checkboxes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                Immediate Availability
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="availableToday"
                    checked={formData.availableToday}
                    onChange={handleInputChange}
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                  />
                  Available Today
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="availableTomorrow"
                    checked={formData.availableTomorrow}
                    onChange={handleInputChange}
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                  />
                  Available Tomorrow
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="availableThisWeek"
                    checked={formData.availableThisWeek}
                    onChange={handleInputChange}
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                  />
                  Available This Week
                </label>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faStethoscope} className="text-blue-600 mr-2" />
              Professional Biography
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About the Doctor
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the doctor's expertise, specializations, and professional background..."
              />
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600 mr-2" />
              Education
            </h2>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-800">Education {index + 1}</h3>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="MD"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Harvard Medical School"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2020"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addEducation}
              className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Education
            </button>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faAward} className="text-blue-600 mr-2" />
              Certifications
            </h2>
            
            {formData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center mb-3 last:mb-0">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => handleCertificationChange(index, e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Board Certified in Cardiology"
                />
                {formData.certifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="ml-3 text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addCertification}
              className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Certification
            </button>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FontAwesomeIcon icon={faLanguage} className="text-blue-600 mr-2" />
              Languages
            </h2>
            
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex items-center mb-3 last:mb-0">
                <input
                  type="text"
                  value={lang}
                  onChange={(e) => handleLanguageChange(index, e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="English"
                />
                {formData.languages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="ml-3 text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addLanguage}
              className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Language
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/doctors')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save Doctor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddDoctor;