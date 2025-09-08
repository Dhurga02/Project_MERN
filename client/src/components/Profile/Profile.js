import React, { useState } from 'react';
import ProfileForm from './ProfileForm';
import ChangePasswordForm from './ChangePasswordForm';

const Profile = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="space-y-6 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Profile Information Form */}
      <section>
        <ProfileForm />
      </section>

      {/* Change Password Section */}
      <section className="mt-6">
        {!showChangePassword ? (
          <button
            onClick={() => setShowChangePassword(true)}
            className="btn btn-secondary"
          >
            Change Password
          </button>
        ) : (
          <div>
            <ChangePasswordForm />
            <button
              onClick={() => setShowChangePassword(false)}
              className="btn btn-outline mt-4"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
