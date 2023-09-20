import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [user_id, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://3.39.153.9:3000/account/login', {
        user_id: user_id,
        password: password,
      });
      setMessage(response.data.message);

    } catch (error) {
     
      setMessage(error.response.data.detail);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <div>
        <label>User ID: </label>
        <input type="text" value={user_id} onChange={(e) => setUserId(e.target.value)} />
      </div>
      <div>
        <label>Password: </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button onClick={handleLogin} >Login</button>
      <div>{message}</div>
    </div>
  );
}

export default App;