import './App.css';
import Nav from './Nav';
import Home from './Pages/Home';
import About from './Pages/About';
import Error from './Pages/Error';
import Login from './Pages/SL_Pages/Login';
import Signup from "./Pages/SL_Pages/Signup";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import SLNav from './Pages/SL_Pages/slnav';
import RequireAdminAuth from './components/RequireAdminAuth';
import Admin from './Pages/Admin';
import Note from './Pages/Note';
import PersistLogin from './components/PersistLogin';
import NotesPage from './Pages/NotesPage';

function App() {
  return (
    <Router>
      <div >
        <Nav />
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route element={<PersistLogin />}>
              <Route element={<RequireAuth AllowedRole={'Basic'} />}>
                <Route path='/notes' element={<NotesPage />} />
                <Route path="/note" element={<Note />} />
                <Route path="/note/:id/:title/:con" element={<Note />} />
                <Route path="/profile" element={<></>} />
              </Route>
              <Route element={<RequireAdminAuth AllowedRole={'Admin'} />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
            <Route element={<SLNav />}>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
            </Route>
            <Route path="*" element={<Error />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;