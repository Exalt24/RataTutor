import { useEffect, useState } from 'react';
import { API_URL, APP_TITLE, DEBUG } from './config';
import './index.css'

function App() {
  const [msg, setMsg] = useState('loading…');

  useEffect(() => {
    fetch(`${API_URL}ping/`)
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(() => setMsg('error'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
      <h1 className="text-3xl font-medium mb-4">
        Welcome to <span className="text-purple-600">{APP_TITLE}</span>
      </h1>
      <h1 className="text-3xl font-medium mb-4">
        {API_URL} says: <span className="text-purple-600">{msg}</span>
      </h1>
      <h1 className="text-3xl font-medium">
        Debug: <span className="text-purple-600">{DEBUG ? 'true' : 'false'}</span>
      </h1>
    </div>
  );
}

export default App
