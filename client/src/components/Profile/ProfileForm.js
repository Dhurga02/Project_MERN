import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { HiCheck } from 'react-icons/hi';

const ProfileForm = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      username: user?.username || ''  // Add username default value
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);

    try {
      // Pass username in updateProfile
      const success = await updateProfile(data);
      if (success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-medium text-gray-700">Username *</label>
          <input
            type="text"
            {...register('username', { required: 'Username is required' })}
            className="mt-1 input"
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-danger-600">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">First Name *</label>
          <input
            type="text"
            {...register('firstName', { required: 'First name is required' })}
            className="mt-1 input"
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name *</label>
          <input
            type="text"
            {...register('lastName', { required: 'Last name is required' })}
            className="mt-1 input"
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="mt-1 input"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
        )}
      </div>

      {/* Account info section */}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Username:</span>
            <p className="font-medium">{user?.username}</p>
          </div>
          <div>
            <span className="text-gray-500">Role:</span>
            <p className="font-medium capitalize">{user?.role}</p>
          </div>
          <div>
            <span className="text-gray-500">Member Since:</span>
             <p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Login:</span>
            <p className="font-medium">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Update button with success message */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {success && (
            <div className="flex items-center space-x-2 text-success-600">
              <HiCheck className="w-5 h-5" />
              <span className="text-sm font-medium">Profile updated successfully!</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
