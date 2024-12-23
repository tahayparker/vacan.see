import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeIntervals = [
  '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
  '20:30', '21:00', '21:30', '22:00'
];

const Graph = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/schedule')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched schedule data:', data);
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }
        setScheduleData(data);
      })
      .catch((error) => {
        console.error('Error fetching schedule:', error);
        setError(error.message);
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const buttons = document.querySelectorAll('.day-button');
    const handleMouseMove = (e, button) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    };

    const handleMouseLeave = (button) => {
      button.style.setProperty('--x', `50%`);
      button.style.setProperty('--y', `50%`);
    };

    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => handleMouseMove(e, button));
      button.addEventListener('mouseleave', () => handleMouseLeave(button));
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mousemove', (e) => handleMouseMove(e, button));
        button.removeEventListener('mouseleave', () => handleMouseLeave(button));
      });
    };
  }, [selectedDay]);

  if (!scheduleData.length) {
    return <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full px-4 md:px-8 mx-auto pt-20 mt-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin mt-12 rounded-full h-12 w-12 border-b-2 border-[#006D5B]"></div>
        </div>
      </main>
      <Footer className="mt-auto" />
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full px-4 md:px-8 mx-auto pt-20">
        <div className="text-red-500 text-center">Error loading schedule: {error}</div>
      </main>
      <Footer className="mt-auto" />
    </div>;
  }

  const getCellColor = (avail) => {
    return avail === 1 ? 'bg-green-700' : 'bg-red-700';
  };

  const getRoomName = (room) => room.split('-')[0];

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Header />
      <main className="flex-grow w-full px-4 md:px-8 mx-auto pt-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 mt-12 text-center text-white animate-[slideUp_0.5s_ease-out]">
            Room Availability Graph
          </h1>
          
          <div className="mb-8 overflow-x-auto hide-scrollbar animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-center space-x-2 min-w-max md:min-w-0 pb-2">
              {daysOfWeek.map((day, index) => (
                <button
                  key={index}
                  className={`day-button px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 ease-in-out border-2 relative overflow-hidden hover-scale ${
                    selectedDay === index 
                      ? 'text-white border-[#006D5B]' 
                      : 'text-gray-300 border-[#482f1f]'
                  }`}
                  onClick={() => setSelectedDay(index)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {scheduleData.length > 0 && scheduleData[selectedDay]?.rooms && (
            <div className="relative animate-[slideUp_0.5s_ease-out]">
              <div className="w-full overflow-auto max-h-[70vh] pb-16 hide-scrollbar">
                <table className="border-collapse w-full [&_td]:border-black [&_th]:border-black">
                  <thead>
                    <tr>
                      <th className="sticky left-0 top-0 bg-black text-white z-20 min-w-[100px] px-4 py-2 border-2 text-right first-th">Room</th>
                      {timeIntervals.map((time, index) => (
                        <th 
                          key={time} 
                          className={`sticky top-0 bg-black text-white z-10 px-4 py-2 border-2 ${
                            index === timeIntervals.length - 1 ? 'last-th' : ''
                          }`}
                        >
                          {time}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleData[selectedDay].rooms
                      .sort((a, b) => getRoomName(a.room).localeCompare(getRoomName(b.room)))
                      .map((roomData, index) => (
                        <tr key={index}>
                          <td className="sticky left-0 bg-black text-white z-10 px-4 py-2 border-2 text-right">{getRoomName(roomData.room)}</td>
                          {roomData.availability.map((avail, idx) => (
                            <td key={idx} className={`px-4 py-2 border-2 min-w-[80px] ${getCellColor(avail)}`}></td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer className="mt-auto" />
      <style jsx global>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .day-button::before {
          content: '';
          position: absolute;
          top: var(--y, 50%);
          left: var(--x, 50%);
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(0, 109, 91, 0.3) 0%, transparent 60%);
          transition: opacity 0.2s;
          transform: translate(-50%, -50%);
          pointer-events: none;
          opacity: 0;
          z-index: 0;
        }

        .day-button:hover::before {
          opacity: 1;
        }

        .day-button > * {
          position: relative;
          z-index: 1;
        }

        .first-th::before,
        .last-th::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 0;
          width: 100%;
          height: 10px;
          background-color: black;
          z-index: 30;
        }
      `}</style>
    </div>
  );
};

export default Graph;