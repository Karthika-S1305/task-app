import { useState, useContext } from 'react';
import axios from 'axios';
import UserContext from './UserContext';
import { Redirect } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = useContext(UserContext);

  function registerUser(e) {
    e.preventDefault();

    // Input validation
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    const data = { email, password };
    axios
      .post('http://localhost:4000/register', data, { withCredentials: true })
      .then((response) => {
        user.setEmail(response.data.email);
        setEmail('');
        setPassword('');
        setRedirect(true);
      })
      .catch((e) => {
        console.log(e);
        setError('Registration failed. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  if (redirect) {
    return <Redirect to={'/'} />;
  }

  return (
    <form action="" onSubmit={(e) => registerUser(e)}>
      <input
        style={{ width: '230px', height: '23px' }}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        style={{ width: '230px', height: '23px', marginTop: '10px' }}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />
      <button className='cursor-style' type="submit" disabled={loading || !email.trim() || !password.trim()}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default Register;