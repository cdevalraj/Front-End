import './App.css';
import Nav from './Nav';
import Home from './Pages/Home';
import About from './Pages/About';
import Error from './Pages/Error';
import Login from './Pages/LoginPages/Login';
import Signup from "./Pages/LoginPages/Signup";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <Router>
      <div >
        <Nav />
        <div>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/about" element={<About/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="*" element={<Error/>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;