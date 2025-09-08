import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { HiCheck, HiEye, HiEyeOff } from 'react-icons/hi';

const ChangePasswordForm = () => {
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);

    try {
      const success = await changePassword(data);
      if (success) {
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <HiCheck className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-yellow-800 font-medium">Password Security</h3>
            <div className="mt-2 text-yellow-700 text-sm">
              <p>
                Choose a strong password that you haven't used elsewhere.
                Your password should be at least 6 characters long.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="currentPassword" className="text-gray-700 block mb-1">Current Password</label>
        <div className="relative">
          <input
            id="currentPassword"
            type={showCurrentPassword ? 'text' : 'password'}
            {...register('currentPassword', { required: 'Current password is required' })}
            className="input pr-10"
            placeholder="Enter current password"
          />
          <button
            type="button"
            className="absolute right-2 top-2"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            {showCurrentPassword ? <HiEyeOff /> : <HiEye />}
          </button>
        </div>
        {errors.currentPassword && <p className="text-red-600 text-sm">{errors.currentPassword.message}</p>}
      </div>

      <div>
        <label htmlFor="newPassword" className="text-gray-700 block mb-1">New Password</label>
        <div className="relative">
          <input
            id="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            className="input pr-10"
            placeholder="Enter new password"
          />
          <button
            type="button"
            className="absolute right-2 top-2"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <HiEyeOff /> : <HiEye />}
          </button>
        </div>
        {errors.newPassword && <p className="text-red-600 text-sm">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-gray-700 block mb-1">Confirm New Password</label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword', {
              required: 'Please confirm your new password',
              validate: value => value === newPassword || 'Passwords do not match'
            })}
            className="input pr-10"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            className="absolute right-2 top-2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <HiEyeOff /> : <HiEye />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 text-sm mb-2">Password Requirements</h4>
        <ul className="text-blue-700 text-sm list-disc ml-5 space-y-1">
          <li>At least 6 characters long</li>
          <li>Should be different from current password</li>
          <li>Consider using a mix of letters, numbers, and symbols</li>
          <li>Avoid using easily guessable information</li>
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {success && (
            <div className="text-green-600 flex items-center space-x-1">
              <HiCheck />
              <span>Password changed successfully!</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
