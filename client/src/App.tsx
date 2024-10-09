import React, { useState, useEffect } from 'react';

const apiUrl = 'http://localhost:8000/api';

const App: React.FC = () => {
  const [queues, setQueues] = useState<{ name: string; count: number }[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setQueues([
      { name: 'queue1', count: 1 },
      { name: 'queue2', count: 1 },
    ]);
  }, []);

  const handleQueueSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQueue(e.target.value);
  };

  const handleGoClick = async () => {
    if (!selectedQueue) {
      setError('Please select a queue');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/${selectedQueue}?timeout=5000`);

      if (response.status === 204) {
        setError('No messages available in the queue');
      } else if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        setError('Failed to fetch message');
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-dark-900 text-white p-6'>
      <h1 className='text-4xl font-bold text-voyantis-blue mb-8'>
        Message Queue Dashboard
      </h1>

      <div className='mb-6'>
        <label className='block text-xl font-medium mb-2'>Select Queue</label>
        <select
          value={selectedQueue}
          onChange={handleQueueSelect}
          className='block w-full p-3 border border-gray-700 bg-dark-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-voyantis-blue'
        >
          <option value=''>-- Select Queue --</option>
          {queues.map((queue) => (
            <option key={queue.name} value={queue.name}>
              {queue.name} ({queue.count} messages)
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGoClick}
        className='w-full p-3 bg-voyantis-blue text-white font-semibold rounded-md shadow-md hover:bg-voyantis-blue-dark focus:outline-none focus:ring-2 focus:ring-voyantis-blue'
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Go'}
      </button>

      {error && <p className='mt-4 text-red-500 font-semibold'>{error}</p>}
      {message && (
        <p className='mt-4 text-green-500 font-semibold'>Message: {message}</p>
      )}
    </div>
  );
};

export default App;
