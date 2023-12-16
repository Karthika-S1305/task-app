import './App.css';
import {BrowserRouter, Switch, Route, NavLink} from "react-router-dom";
import {useState,useEffect} from 'react';
import Register from "./Register";
import UserContext from "./UserContext";
import axios from "axios";
import Login from "./Login";
import Home from "./Home";

function App() {
  const [email,setEmail] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/user', {withCredentials:true})
      .then(response => {
        setEmail(response.data.email);
      }).catch(e=>{
        console.log(e);
      });
  }, []);

  function logout() {
    axios.post('http://localhost:4000/logout', {}, {withCredentials:true})
      .then(() => setEmail('')).catch(e=>{console.log(e)});
  }

  return (
    <UserContext.Provider value={{email,setEmail}}>
      <BrowserRouter>
        <nav >
        <NavLink to="/" exact activeClassName="active" className='nav-link'>Home</NavLink>

          {!email && (
            <>
              <NavLink  activeClassName="active" className='nav-link'to={'/login'}>Login</NavLink>
              <NavLink  activeClassName="active" className='nav-link'to={'/register'}>Register</NavLink>
            </>
          )}
          {!!email && (
            <a className='cursor-style' onClick={e => {e.preventDefault();logout();}}>Logout</a>
          )}
        </nav>
        <main>
          <Switch>
            <Route exact path={'/'} component={Home} />
            <Route exact path={'/register'} component={Register} />
            <Route exact path={'/login'} component={Login} />
          </Switch>
        </main>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
