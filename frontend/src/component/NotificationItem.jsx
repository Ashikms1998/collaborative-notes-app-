import React from 'react';
const NotificationItem = ({ user, timestamp }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <p className="text-gray-900 dark:text-gray-100 text-base font-medium">
            {user}
          </p><span>shared a post with you</span>
          {timestamp && (
            <span className="text-gray-600 dark:text-gray-400 text-xs mt-1 block">
              {timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;