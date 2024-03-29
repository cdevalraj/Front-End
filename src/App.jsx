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
import ZoomPage from './Pages/Zoom';
import VideoChatPage from './Pages/VideoChat';
import VCLobbyPage from './components/VideoChatLobbyPage';

function App() {
  return (
    <Router>
      <div >
        <Nav />
        <div>
          <Routes>
            <Route element={<PersistLogin />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route element={<RequireAuth AllowedRole={'Basic'} />}>
                <Route path='/notes' element={<NotesPage />} />
                <Route path="/video" element={<ZoomPage />} />
                <Route path='/video/lobby' element={<VCLobbyPage />} />
                <Route path="/video/:roomId" element={<VideoChatPage />} />
                <Route path="/note" element={<Note />} />
                <Route path="/note/:id" element={<Note />} />
                <Route path="/profile" element={<></>} />
              </Route>
              <Route element={<RequireAdminAuth AllowedRole={'Admin'} />}>
                <Route path="/admin" element={<Admin />} />c
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