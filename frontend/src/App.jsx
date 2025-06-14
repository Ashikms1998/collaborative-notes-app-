import React from "react";
import {BrowserRouter, Routes ,Route} from 'react-router-dom'
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";




const App = () => {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Signup/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
    </>
  );
};

export default App;
