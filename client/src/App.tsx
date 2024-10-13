import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE_URL = 'http://localhost:8000';

interface Queues {
  [key: string]: number;
}

interface Message {
  message: string;
}

function App() {
  const [queues, setQueues] = useState<Queues>({});
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [fetchedMessage, setFetchedMessage] = useState<string>('');

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueues = async () => {
    try {
      const response = await axios.get<Queues>(`${API_BASE_URL}/api/queues`);
      setQueues(response.data);
    } catch (error) {
      console.error('Error fetching queues:', error);
    }
  };

  const handleAddMessage = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/${selectedQueue}`, {
        content: { message: newMessage },
      });
      setNewMessage('');
      fetchQueues();
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const handleGetMessage = async () => {
    try {
      const response = await axios.get<Message>(
        `${API_BASE_URL}/api/${selectedQueue}`
      );
      setFetchedMessage(JSON.stringify(response.data, null, 2));
      fetchQueues();
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-r from-indigo-600 to-blue-400 text-white p-8'>
      <h1 className='text-4xl font-bold mb-8'>Queue Management System</h1>

      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Queues</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {Object.entries(queues).map(([name, count]) => (
            <div
              key={name}
              className='bg-white text-gray-800 p-4 rounded shadow'
            >
              <h3 className='font-semibold'>{name}</h3>
              <p>Messages: {count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Add Message</h2>
        <input
          type='text'
          value={selectedQueue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSelectedQueue(e.target.value)
          }
          placeholder='Queue name'
          className='mr-2 p-2 text-gray-800 rounded'
        />
        <input
          type='text'
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewMessage(e.target.value)
          }
          placeholder='Message'
          className='mr-2 p-2 text-gray-800 rounded'
        />
        <button
          onClick={handleAddMessage}
          className='bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded'
        >
          Add Message
        </button>
      </div>

      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Get Message</h2>
        <input
          type='text'
          value={selectedQueue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSelectedQueue(e.target.value)
          }
          placeholder='Queue name'
          className='mr-2 p-2 text-gray-800 rounded'
        />
        <button
          onClick={handleGetMessage}
          className='bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded'
        >
          Get Message
        </button>
        {fetchedMessage && (
          <pre className='mt-4 p-4 bg-white text-gray-800 rounded overflow-auto'>
            {fetchedMessage}
          </pre>
        )}
      </div>
    </div>
  );
}

export default App;
