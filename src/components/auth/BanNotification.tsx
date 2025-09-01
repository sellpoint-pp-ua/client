'use client';

import { useState } from 'react';
import { NoSymbolIcon } from '@heroicons/react/24/outline';

export const BanNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-red-600 bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <NoSymbolIcon className="h-8 w-8 text-red-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Ваш акаунт заблоковано
            </h3>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-700 mb-4">
            Ваш акаунт було заблоковано адміністратором системи.
          </p>
          <p className="text-gray-600 text-sm">
            Для розблокування зверніться до адміністратора.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Зрозуміло
          </button>
        </div>
      </div>
    </div>
  );
};
