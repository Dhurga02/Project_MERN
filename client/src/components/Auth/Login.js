import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { HiCube, HiEye, HiEyeOff } from 'react-icons/hi';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full space-y-8">
         <div>
           <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
             <HiCube className="h-8 w-8 text-white" />
           </div>
           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
             Sign in to your account
           </h2>
           <p className="mt-2 text-center text-sm text-gray-600">
             Smart Inventory Management System
           </p>
         </div>

         <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
           <div className="space-y-4">
             <div>
               <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                 Username
               </label>
               <input
                 id="username"
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
               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                 Password
               </label>
               <div className="relative">
                 <input
                   id="password"
                   type={showPassword ? 'text' : 'password'}
                   {...register('password', { required: 'Password is required' })}
                   className="mt-1 input pr-10"
                   placeholder="Enter your password"
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
                 >
                   {showPassword ? (
                     <HiEyeOff className="h-5 w-5 text-gray-400" />
                   ) : (
                     <HiEye className="h-5 w-5 text-gray-400" />
                   )}
                 </button>
               </div>
               {errors.password && (
                 <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
               )}
             </div>
           </div>

           <div>
             <button
               type="submit"
               disabled={isLoading}
               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isLoading ? (
                 <div className="flex items-center">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                   Signing in...
                 </div>
               ) : (
                 'Sign in'
               )}
             </button>
           </div>

           <div className="text-center">
             <p className="text-sm text-gray-600">
               Don't have an account?{' '}
               <Link
                 to="/register"
                 className="font-medium text-primary-600 hover:text-primary-500"
               >
                 Sign up here
               </Link>
             </p>
           </div>
         </form>
       </div>
     </div>
  );
};

export default Login;
