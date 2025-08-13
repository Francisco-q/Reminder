import React from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold">
                R
              </div>
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Reminder
              </span>
            </div>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
