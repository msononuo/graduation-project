import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Colleges from './pages/Colleges';
import SingleCollege from './pages/SingleCollege';
import Majors from './pages/Majors';
import MajorDetails from './pages/MajorDetails';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import EventApproval from './pages/EventApproval';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminPortal from './pages/AdminPortal';
import ChangePassword from './pages/ChangePassword';
import CompleteProfile from './pages/CompleteProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="colleges" element={<Colleges />} />
          <Route path="colleges/:id" element={<SingleCollege />} />
          <Route path="majors" element={<Majors />} />
          <Route path="majors/:id" element={<MajorDetails />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="event-approval" element={<EventApproval />} />
          <Route path="admin" element={<AdminPortal />} />
          <Route path="profile" element={<Profile />} />
          <Route path="login" element={<Login />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="complete-profile" element={<CompleteProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
