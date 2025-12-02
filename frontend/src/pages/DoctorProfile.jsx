import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faCalendarAlt, 
  faClock, 
  faGraduationCap, 
  faAward, 
  faUserMd, 
  faArrowLeft,
  faStethoscope,
  faUsers,
  faThumbsUp
} from '@fortawesome/free-solid-svg-icons';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Sample doctor data - in real app, this would come from API
  const doctorData = {
    1: {
      id: 1,
      name: 'Dr. Emily Carter',
      specialty: 'Cardiology',
      subSpecialty: 'Interventional Cardiology',
      image: null,
      rating: 4.5,
      reviewCount: 127,
      experience: '8 years',
      location: 'Building A, Room 201',
      phone: '+1 (555) 123-4567',
      email: 'emily.carter@hospease.com',
      availability: 'Mon-Fri',
      availableToday: true,
      availableTomorrow: true,
      availableThisWeek: true,
      bio: 'Dr. Emily Carter is a board-certified cardiologist with extensive experience in interventional procedures. She specializes in treating complex cardiovascular conditions and has performed over 1,000 cardiac catheterizations.',
      education: [
        { degree: 'MD', institution: 'Harvard Medical School', year: '2016' },
        { degree: 'Residency', institution: 'Johns Hopkins Hospital', year: '2019' },
        { degree: 'Fellowship', institution: 'Mayo Clinic', year: '2021' }
      ],
      certifications: [
        'Board Certified in Cardiology',
        'Advanced Cardiac Life Support (ACLS)',
        'Interventional Cardiology Certification'
      ],
      languages: ['English', 'Spanish', 'French'],
      timeSlots: {
        '2025-11-19': ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
        '2025-11-20': ['09:00 AM', '10:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
        '2025-11-21': ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      },
      reviews: [
        {
          id: 1,
          patientName: 'Sarah M.',
          rating: 5,
          date: '2025-11-10',
          comment: 'Dr. Carter is exceptional! She explained my condition clearly and the procedure went smoothly.'
        },
        {
          id: 2,
          patientName: 'John D.',
          rating: 4,
          date: '2025-11-08',
          comment: 'Very professional and knowledgeable. The wait time was minimal.'
        },
        {
          id: 3,
          patientName: 'Maria L.',
          rating: 5,
          date: '2025-11-05',
          comment: 'Outstanding care and follow-up. Highly recommend!'
        }
      ],
      stats: {
        patientsHelped: 850,
        successRate: 98,
        averageWaitTime: 12
      }
    },
    2: {
      id: 2,
      name: 'Dr. Michael Zhang',
      specialty: 'Neurology',
      subSpecialty: 'Epilepsy & Seizure Disorders',
      image: null,
      rating: 5.0,
      reviewCount: 89,
      experience: '12 years',
      location: 'Building B, Room 305',
      phone: '+1 (555) 234-5678',
      email: 'michael.zhang@hospease.com',
      availability: 'Tue, Thu, Sat',
      availableToday: false,
      availableTomorrow: true,
      availableThisWeek: true,
      bio: 'Dr. Michael Zhang is a leading neurologist specializing in epilepsy and seizure disorders. He has pioneered several treatment protocols and is actively involved in clinical research.',
      education: [
        { degree: 'MD', institution: 'Stanford University', year: '2013' },
        { degree: 'Residency', institution: 'UCSF Medical Center', year: '2017' },
        { degree: 'Fellowship', institution: 'Cleveland Clinic', year: '2018' }
      ],
      certifications: [
        'Board Certified in Neurology',
        'Epilepsy Monitoring Certification',
        'EEG Interpretation Specialist'
      ],
      languages: ['English', 'Mandarin', 'Cantonese'],
      timeSlots: {
        '2025-11-20': ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
        '2025-11-22': ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'],
        '2025-11-23': ['09:00 AM', '02:00 PM', '03:00 PM'],
      },
      reviews: [
        {
          id: 1,
          patientName: 'David R.',
          rating: 5,
          date: '2025-11-12',
          comment: 'Dr. Zhang saved my life. His expertise in epilepsy treatment is unmatched.'
        }
      ],
      stats: {
        patientsHelped: 650,
        successRate: 96,
        averageWaitTime: 8
      }
    },
    // Add more doctor data as needed...
  };

  const doctor = doctorData[id];

  useEffect(() => {
    // Set default date to today if doctor is available
    const today = new Date().toISOString().split('T')[0];
    if (doctor?.timeSlots[today]) {
      setSelectedDate(today);
    } else {
      // Set to first available date
      const firstAvailableDate = Object.keys(doctor?.timeSlots || {})[0];
      setSelectedDate(firstAvailableDate || '');
    }
  }, [doctor]);

  if (!doctor) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h1>
          <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/doctors')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Doctors
          </button>
        </div>
      </Layout>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStar} className="text-yellow-400 opacity-50" />);
    }
    return stars;
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedTimeSlot) {
      // Navigate to appointment booking or handle booking logic
      navigate('/appointments', {
        state: {
          doctor: doctor,
          date: selectedDate,
          time: selectedTimeSlot
        }
      });
    } else {
      alert('Please select a date and time slot');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/doctors')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Doctors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-6">
                {/* Doctor Image */}
                <div className="flex-shrink-0">
                  {doctor.image ? (
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUserMd} className="text-white text-4xl" />
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                  <p className="text-xl text-blue-600 font-semibold mb-1">{doctor.specialty}</p>
                  <p className="text-gray-600 mb-4">{doctor.subSpecialty}</p>
                  
                  {/* Rating and Reviews */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      {renderStars(doctor.rating)}
                      <span className="ml-2 text-lg font-semibold text-gray-900">{doctor.rating}</span>
                    </div>
                    <span className="text-gray-600">({doctor.reviewCount} reviews)</span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-xl mb-1" />
                      <div className="text-2xl font-bold text-blue-600">{doctor.stats.patientsHelped}</div>
                      <div className="text-sm text-gray-600">Patients Helped</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <FontAwesomeIcon icon={faThumbsUp} className="text-green-600 text-xl mb-1" />
                      <div className="text-2xl font-bold text-green-600">{doctor.stats.successRate}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <FontAwesomeIcon icon={faClock} className="text-purple-600 text-xl mb-1" />
                      <div className="text-2xl font-bold text-purple-600">{doctor.stats.averageWaitTime}</div>
                      <div className="text-sm text-gray-600">Avg Wait (min)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Dr. {doctor.name.split(' ')[1]}</h2>
              <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Education & Credentials */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Education & Credentials</h2>
              
              {/* Education */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600 mr-2" />
                  Education
                </h3>
                <div className="space-y-3">
                  {doctor.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <div className="font-semibold text-gray-900">{edu.degree}</div>
                      <div className="text-gray-600">{edu.institution}</div>
                      <div className="text-sm text-gray-500">{edu.year}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faAward} className="text-yellow-600 mr-2" />
                  Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {doctor.certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Patient Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Reviews</h2>
              <div className="space-y-4">
                {doctor.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {review.patientName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{review.patientName}</div>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Contact & Appointment */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-5 mr-3" />
                  <span className="text-gray-700">{doctor.location}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400 w-5 mr-3" />
                  <span className="text-gray-700">{doctor.phone}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-5 mr-3" />
                  <span className="text-gray-700">{doctor.email}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faStethoscope} className="text-gray-400 w-5 mr-3" />
                  <span className="text-gray-700">{doctor.experience} experience</span>
                </div>
              </div>

              {/* Languages */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <span key={lang} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointment Booking */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book Appointment</h3>
              
              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTimeSlot(null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a date</option>
                  {Object.keys(doctor.timeSlots).map((date) => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slots */}
              {selectedDate && doctor.timeSlots[selectedDate] && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Times</label>
                  <div className="grid grid-cols-2 gap-2">
                    {doctor.timeSlots[selectedDate].map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTimeSlot(time)}
                        className={`p-2 text-sm border rounded-lg transition-colors ${
                          selectedTimeSlot === time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTimeSlot}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Book Appointment
              </button>

              {/* Availability Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="flex flex-wrap gap-1">
                    {doctor.availableToday && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Available Today
                      </span>
                    )}
                    {doctor.availableTomorrow && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        Available Tomorrow
                      </span>
                    )}
                    {doctor.availableThisWeek && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        This Week
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;