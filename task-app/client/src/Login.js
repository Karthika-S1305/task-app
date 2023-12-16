import {useState, useContext} from 'react';
import axios from 'axios';
import UserContext from "./UserContext";
import {Redirect} from "react-router-dom";

function Login() {

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loginError,setLoginError] = useState(false);
  const [redirect,setRedirect] = useState(false);

  const user = useContext(UserContext);

  function loginUser(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError(true);
      return;
    }
    const data = {email,password};
    axios.post('http://localhost:4000/login', data, {withCredentials:true})
      .then(response => {
        user.setEmail(response.data.email);
        setEmail('');
        setPassword('');
        setLoginError(false);
        setRedirect(true);
      })
      .catch(() => {
        setLoginError(true);
      });
  }

  if (redirect) {
    return <Redirect to={'/'} />
  }

  return (
    <form action="" 
    onSubmit={e => loginUser(e)}
    >
      {loginError && (
        <div>Login error! wrong email or password!</div>
      )}
      <input type="email" style={{width:'230px',height:'23px'}} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/><br />
      <input type="password" placeholder="Password" style={{width:'230px',height:'23px',marginTop: '10px' }} value={password} onChange={e => setPassword(e.target.value)}/><br />    <br />
      <button className='cursor-style' type="submit">Login</button>
    </form>
  );
}

export default Login;