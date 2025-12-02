import React from 'react';

const ProfileCard = ({ user, onEditProfile }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
      <p className="text-gray-600">{user?.email}</p>
      <button
        onClick={onEditProfile}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileCard;