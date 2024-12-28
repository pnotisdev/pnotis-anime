import React from 'react';

const ContributionCalendar = ({ watchHistory }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get dates for last 365 days
  const getDates = () => {
    const dates = [];
    for (let i = 365; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  // Get intensity of color based on watch count
  const getColor = (count) => {
    if (!count) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-100';
    if (count <= 4) return 'bg-green-300';
    if (count <= 6) return 'bg-green-500';
    return 'bg-green-700';
  };

  const dates = getDates();
  const weeks = [];
  let currentWeek = [];

  dates.forEach((date) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Generate month labels based on the dates being displayed
  const monthLabels = weeks.map((week, index) => {
    const firstDate = week[0];
    return index === 0 || firstDate.getDate() === 1 ? months[firstDate.getMonth()] : '';
  });

  return (
    <div className="p-4">
      <div className="flex">
        <div className="w-10"></div>
        <div className="flex justify-between flex-1">
          {monthLabels.map((month, index) => (
            <span key={index} className="text-xs text-gray-400">{month}</span>
          ))}
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col justify-around">
          {days.map(day => (
            <span key={day} className="text-xs text-gray-400 h-3">{day}</span>
          ))}
        </div>
        <div className="grid grid-flow-col gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {week.map((date, dateIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const count = watchHistory[dateStr] || 0;
                return (
                  <div
                    key={dateIndex}
                    className={`w-3 h-3 rounded-sm ${getColor(count)}`}
                    title={`${date.toDateString()}: ${count} episodes watched`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center mt-2 text-xs text-gray-400">
        <span className="mr-2">Less</span>
        <div className={`w-3 h-3 rounded-sm bg-gray-100 mr-1`}></div>
        <div className={`w-3 h-3 rounded-sm bg-green-100 mr-1`}></div>
        <div className={`w-3 h-3 rounded-sm bg-green-300 mr-1`}></div>
        <div className={`w-3 h-3 rounded-sm bg-green-500 mr-1`}></div>
        <div className={`w-3 h-3 rounded-sm bg-green-700 mr-1`}></div>
        <span className="ml-1">More</span>
      </div>
    </div>
  );
};

export default ContributionCalendar;
