'use client';

import Link from "next/link";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
 

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    rememberMe: false
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
 
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
 
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.login.trim()) {
      errors.login = 'Email або логін обов\'язковий';
    }

    if (!formData.password) {
      errors.password = 'Пароль обов\'язковий';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const loginValue = formData.login.includes('@')
        ? formData.login.split('@')[0]
        : formData.login
      await login({
        login: loginValue,
        password: formData.password
      });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClass = " mt-0 bg-white appearance-none relative block w-full px-4 py-2.5 border-2 border-white placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4563d1]/30 focus:border-[#4563d1] focus:z-10 sm:text-sm transition-[border-color,box-shadow] duration-200 ease-out shadow-md";
    const errorClass = validationErrors[fieldName] ? "border-red-300" : "border-gray-300";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: 'url(/background.png)' }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
        <Link href="/" className="flex justify-center group" aria-label="Sell Point">
  <svg
    width="234"
    height="51"
    viewBox="0 0 234 51"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[300px] h-auto"
    overflow="visible"
    aria-hidden
  >
    <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#22428c" stopOpacity="0.60"/>
      <stop offset="20%" stopColor="#3679f4" stopOpacity="0.60"/>
      <stop offset="60%" stopColor="#ffed75" stopOpacity="0.60"/>
      <stop offset="99%" stopColor="#e8be00" stopOpacity="0.60"/>
    </linearGradient>


         <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.3" />
        </filter> 
    </defs>

    <style>
      {`.shadow-copy * { fill: url(#grad) !important; }`}
    </style>

    <g className=" shadow-copy opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100"
       transform="translate(4,5)"
       filter="url(#blur1)">
      <g>
        <path d="M9.07967 8.82792H22.7331V15.7976H10.13C7.72452 15.7976 6.53873 16.3177 6.60649 17.254C6.60649 18.6756 9.11355 19.9933 14.1616 21.2763C17.8544 22.2125 20.4293 23.3914 21.8861 24.8131C23.3429 26.2348 24.0882 28.2459 24.0882 30.8813C24.0882 34.3488 23.1058 36.9494 21.1407 38.7525C19.1757 40.5209 16.296 41.4225 12.5015 41.4225H0V34.4528H12.3321C15.3135 34.3141 16.8719 33.5166 16.9736 32.0602C16.9736 30.8119 15.9911 29.9103 14.0599 29.3902C7.48735 27.7258 3.52346 26.0614 2.10053 24.397C0.677597 22.7326 0 20.7215 0 18.3636C0 11.9487 3.04915 8.79324 9.11356 8.82792H9.07967Z" fill="#231F20" />
      </g>
      <g>
        <path d="M34.6436 31.703C36.3606 33.5081 38.4737 34.4453 40.917 34.4453C43.3603 34.4453 45.4404 33.5428 47.1903 31.703H47.2234L51.9449 36.6322H51.9119C48.8743 39.8604 45.2423 41.4225 40.95 41.4225C36.6577 41.4225 32.9927 39.8257 29.9881 36.6669C26.9835 33.5081 25.4647 29.655 25.4647 25.1424C25.4647 20.6298 26.9835 16.7767 29.9881 13.5832C32.9927 10.3897 36.6577 8.82764 40.95 8.82764C45.2423 8.82764 48.9073 10.4244 51.9119 13.5832C54.9165 16.742 56.4353 20.5951 56.4353 25.1424C56.4353 25.9061 56.3693 26.7045 56.2372 27.4681H32.3324C32.6956 29.0649 33.488 30.4881 34.6436 31.7377V31.703ZM47.1903 18.5471C45.4734 16.742 43.3603 15.8048 40.917 15.8048C38.4737 15.8048 36.3936 16.7073 34.6436 18.5471C34.0823 19.1372 33.5871 19.7967 33.2239 20.491H48.6101C48.2469 19.7967 47.7516 19.1719 47.1903 18.5471Z" fill="#231F20" />
      </g>
      <g> <path d="M75.6487 0V41.4226H68.7664V0H75.6487Z" fill="#231F20"/> </g>
      <g>
        <path d="M66.0135 0V41.4226H59.1311V0H66.0135Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M75.6487 0В41.4226H68.7664V0H75.6487Z" fill="#231F20"/>
      </g>
      
      <g>
        <path d="M89.5042 25.2218C89.5042 20.6873 91.0551 16.8154 94.1232 13.6064C97.1913 10.3973 100.934 8.82764 105.317 8.82764C109.7 8.82764 113.442 10.4322 116.51 13.6064C119.578 16.7806 121.129 20.6524 121.129 25.2218C121.129 29.7913 119.578 33.6282 116.51 36.8024C113.442 39.9766 109.7 41.5811 105.317 41.5811C101.911 41.5811 98.8771 40.6044 96.2473 38.686V50.9293H89.4705V25.1869L89.5042 25.2218ZM111.756 31.8493C113.51 30.0354 114.42 27.803 114.42 25.2218C114.42 22.6406 113.543 20.4431 111.756 18.5944C109.969 16.7457 107.845 15.8388 105.35 15.8388C102.855 15.8388 100.731 16.7457 98.9445 18.5944C97.1576 20.4431 96.281 22.6406 96.281 25.2218C96.281 27.803 97.1576 30.0005 98.9445 31.8493C100.698 33.6631 102.855 34.6049 105.35 34.6049C107.845 34.6049 109.969 33.698 111.756 31.8493Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M139.712 41.4225C135.324 41.4225 131.578 39.8257 128.506 36.6669C125.435 33.5081 123.882 29.655 123.882 25.1424C123.882 20.6298 125.435 16.7767 128.506 13.5832C131.578 10.3897 135.324 8.82764 139.712 8.82764C144.1 8.82764 147.846 10.4244 150.917 13.5832C153.989 16.742 155.541 20.5951 155.541 25.1424C155.541 29.6897 153.989 33.5081 150.917 36.6669C147.846 39.8257 144.1 41.4225 139.712 41.4225ZM146.125 31.703C147.88 29.898 148.791 27.6764 148.791 25.1077C148.791 22.539 147.913 20.3521 146.125 18.5124C144.336 16.6726 142.209 15.7701 139.712 15.7701C137.214 15.7701 135.088 16.6726 133.299 18.5124C131.51 20.3521 130.633 22.539 130.633 25.1077C130.633 27.6764 131.51 29.8633 133.299 31.703C135.054 33.5081 137.214 34.4453 139.712 34.4453C142.209 34.4453 144.336 33.5428 146.125 31.703Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M161.718 6.86373C160.76 6.86373 159.938 6.52054 159.287 5.86849C158.602 5.18211 158.294 4.39279 158.294 3.43186C158.294 2.47094 158.637 1.64729 159.287 0.995241C159.972 0.308868 160.76 0 161.718 0C162.677 0 163.499 0.343186 164.149 0.995241C164.834 1.68161 165.142 2.47094 165.142 3.43186C165.142 4.39279 164.8 5.21643 164.149 5.86849C163.464 6.55486 162.677 6.86373 161.718 6.86373ZM165.177 9.16308V41.4226H158.294V9.16308H165.177Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M174.025 41.4225H167.241V25.1251C167.241 20.6173 168.794 16.7683 171.865 13.5782C174.937 10.388 178.683 8.82764 183.071 8.82764C187.458 8.82764 191.205 10.4227 194.276 13.5782C197.347 16.7336 198.9 20.5826 198.9 25.1251V41.4225H192.116V25.1251C192.116 22.5591 191.238 20.3745 189.45 18.5367C187.661 16.6989 185.534 15.7974 183.037 15.7974C180.539 15.7974 178.413 16.6989 176.624 18.5367C174.835 20.3745 173.958 22.5591 173.958 25.1251V41.4225H174.025Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M208.389 16.1031V25.3195C208.389 27.8549 209.265 30.0134 211.05 31.8293C212.801 33.6109 214.956 34.536 217.449 34.536V41.4226C213.07 41.4226 209.332 39.8465 206.267 36.7287C203.202 33.6109 201.653 29.8078 201.653 25.3538V0H208.423V9.18218H217.482V16.0688H208.423L208.389 16.1031Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M227.118 41.2942C230.919 41.2942 234 38.2129 234 34.4119C234 30.6109 230.919 27.5295 227.118 27.5295C223.317 27.5295 220.235 30.6109 220.235 34.4119C220.235 38.2129 223.317 41.2942 227.118 41.2942Z" fill="#4563D1"/>
      </g>
    </g>

    <g>
      <g>
        <path d="M9.07967 8.82792H22.7331V15.7976H10.13C7.72452 15.7976 6.53873 16.3177 6.60649 17.254C6.60649 18.6756 9.11355 19.9933 14.1616 21.2763C17.8544 22.2125 20.4293 23.3914 21.8861 24.8131C23.3429 26.2348 24.0882 28.2459 24.0882 30.8813C24.0882 34.3488 23.1058 36.9494 21.1407 38.7525C19.1757 40.5209 16.296 41.4225 12.5015 41.4225H0V34.4528H12.3321C15.3135 34.3141 16.8719 33.5166 16.9736 32.0602C16.9736 30.8119 15.9911 29.9103 14.0599 29.3902C7.48735 27.7258 3.52346 26.0614 2.10053 24.397C0.677597 22.7326 0 20.7215 0 18.3636C0 11.9487 3.04915 8.79324 9.11356 8.82792H9.07967Z" fill="#231F20" />
      </g>
      <g>
        <path d="M34.6436 31.703C36.3606 33.5081 38.4737 34.4453 40.917 34.4453C43.3603 34.4453 45.4404 33.5428 47.1903 31.703H47.2234L51.9449 36.6322H51.9119C48.8743 39.8604 45.2423 41.4225 40.95 41.4225C36.6577 41.4225 32.9927 39.8257 29.9881 36.6669C26.9835 33.5081 25.4647 29.655 25.4647 25.1424C25.4647 20.6298 26.9835 16.7767 29.9881 13.5832C32.9927 10.3897 36.6577 8.82764 40.95 8.82764C45.2423 8.82764 48.9073 10.4244 51.9119 13.5832C54.9165 16.742 56.4353 20.5951 56.4353 25.1424C56.4353 25.9061 56.3693 26.7045 56.2372 27.4681H32.3324C32.6956 29.0649 33.488 30.4881 34.6436 31.7377V31.703ZM47.1903 18.5471C45.4734 16.742 43.3603 15.8048 40.917 15.8048C38.4737 15.8048 36.3936 16.7073 34.6436 18.5471C34.0823 19.1372 33.5871 19.7967 33.2239 20.491H48.6101C48.2469 19.7967 47.7516 19.1719 47.1903 18.5471Z" fill="#231F20" />
      </g>
      <g> <path d="M75.6487 0V41.4226H68.7664V0H75.6487Z" fill="#231F20"/> </g>
      <g>
        <path d="M66.0135 0V41.4226H59.1311V0H66.0135Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M75.6487 0В41.4226H68.7664V0H75.6487Z" fill="#231F20"/>
      </g>


      
      <g>
        <path d="M89.5042 25.2218C89.5042 20.6873 91.0551 16.8154 94.1232 13.6064C97.1913 10.3973 100.934 8.82764 105.317 8.82764C109.7 8.82764 113.442 10.4322 116.51 13.6064C119.578 16.7806 121.129 20.6524 121.129 25.2218C121.129 29.7913 119.578 33.6282 116.51 36.8024C113.442 39.9766 109.7 41.5811 105.317 41.5811C101.911 41.5811 98.8771 40.6044 96.2473 38.686V50.9293H89.4705V25.1869L89.5042 25.2218ZM111.756 31.8493C113.51 30.0354 114.42 27.803 114.42 25.2218C114.42 22.6406 113.543 20.4431 111.756 18.5944C109.969 16.7457 107.845 15.8388 105.35 15.8388C102.855 15.8388 100.731 16.7457 98.9445 18.5944C97.1576 20.4431 96.281 22.6406 96.281 25.2218C96.281 27.803 97.1576 30.0005 98.9445 31.8493C100.698 33.6631 102.855 34.6049 105.35 34.6049C107.845 34.6049 109.969 33.698 111.756 31.8493Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M139.712 41.4225C135.324 41.4225 131.578 39.8257 128.506 36.6669C125.435 33.5081 123.882 29.655 123.882 25.1424C123.882 20.6298 125.435 16.7767 128.506 13.5832C131.578 10.3897 135.324 8.82764 139.712 8.82764C144.1 8.82764 147.846 10.4244 150.917 13.5832C153.989 16.742 155.541 20.5951 155.541 25.1424C155.541 29.6897 153.989 33.5081 150.917 36.6669C147.846 39.8257 144.1 41.4225 139.712 41.4225ZM146.125 31.703C147.88 29.898 148.791 27.6764 148.791 25.1077C148.791 22.539 147.913 20.3521 146.125 18.5124C144.336 16.6726 142.209 15.7701 139.712 15.7701C137.214 15.7701 135.088 16.6726 133.299 18.5124C131.51 20.3521 130.633 22.539 130.633 25.1077C130.633 27.6764 131.51 29.8633 133.299 31.703C135.054 33.5081 137.214 34.4453 139.712 34.4453C142.209 34.4453 144.336 33.5428 146.125 31.703Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M161.718 6.86373C160.76 6.86373 159.938 6.52054 159.287 5.86849C158.602 5.18211 158.294 4.39279 158.294 3.43186C158.294 2.47094 158.637 1.64729 159.287 0.995241C159.972 0.308868 160.76 0 161.718 0C162.677 0 163.499 0.343186 164.149 0.995241C164.834 1.68161 165.142 2.47094 165.142 3.43186C165.142 4.39279 164.8 5.21643 164.149 5.86849C163.464 6.55486 162.677 6.86373 161.718 6.86373ZM165.177 9.16308V41.4226H158.294V9.16308H165.177Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M174.025 41.4225H167.241V25.1251C167.241 20.6173 168.794 16.7683 171.865 13.5782C174.937 10.388 178.683 8.82764 183.071 8.82764C187.458 8.82764 191.205 10.4227 194.276 13.5782C197.347 16.7336 198.9 20.5826 198.9 25.1251V41.4225H192.116V25.1251C192.116 22.5591 191.238 20.3745 189.45 18.5367C187.661 16.6989 185.534 15.7974 183.037 15.7974C180.539 15.7974 178.413 16.6989 176.624 18.5367C174.835 20.3745 173.958 22.5591 173.958 25.1251V41.4225H174.025Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M208.389 16.1031V25.3195C208.389 27.8549 209.265 30.0134 211.05 31.8293C212.801 33.6109 214.956 34.536 217.449 34.536V41.4226C213.07 41.4226 209.332 39.8465 206.267 36.7287C203.202 33.6109 201.653 29.8078 201.653 25.3538V0H208.423V9.18218H217.482V16.0688H208.423L208.389 16.1031Z" fill="#231F20"/>
      </g>
      <g>
        <path d="M227.118 41.2942C230.919 41.2942 234 38.2129 234 34.4119C234 30.6109 230.919 27.5295 227.118 27.5295C223.317 27.5295 220.235 30.6109 220.235 34.4119C220.235 38.2129 223.317 41.2942 227.118 41.2942Z" fill="#4563D1"/>
      </g>
    </g>
  </svg>
        </Link>

          
          <h2 className="mt-6 text-center font-semibold text-gray-900 max-w-[300px] mx-auto">
            Вітаємо у Sell Point! Увійдіть до свого профілю, щоб розпочати.
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Або{' '}
            <Link href="/auth/register" className="font-medium text-[#4563d1] hover:text-[#364ea8]">
              створіть новий акаунт
            </Link>
          </p>
        </div>
        
        {error && (
          <div className={`px-4 py-3 rounded-md ${
            error.toLowerCase().includes('заблоковано') || error.toLowerCase().includes('блоковано')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {error.toLowerCase().includes('заблоковано') || error.toLowerCase().includes('блоковано') ? (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Акаунт заблоковано
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              error
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="-mt-2 space-y-6 max-w-[350px] mx-auto">
          <div className="space-y-4">
            <div>

              <input
                id="login"
                name="login"
                type="text"
                autoComplete="email"
                required
                value={formData.login}
                onChange={handleInputChange}
                className={getInputClassName('login')}
                placeholder="Введіть ваш email або логін"
              />
              {validationErrors.login && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.login}</p>
              )}
            </div>
            
            <div>

              <div className="relative">
              <input
                id="password"
                name="password"
                  type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                  className={`${getInputClassName('password')} pr-10`}
                placeholder="Введіть ваш пароль"
              />
                <button
                  type="button"
                  aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                  className="px-2 py-2 absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#4563d1] focus:ring-[#4563d1] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Запам&apos;ятати мене
              </label>
            </div>

            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-[#4563d1] hover:text-[#364ea8]">
                Забули пароль?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#4563d1] hover:bg-[#364ea8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4563d1] disabled:opacity-50 disabled:cursor-not-allowed  transition-colors duration-200 ease-out"
            >
              {isLoading ? 'Вхід...' : 'Увійти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 