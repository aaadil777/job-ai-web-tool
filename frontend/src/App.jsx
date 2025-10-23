import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CreateNewUser from './pages/CreateNewUser.jsx'
import SignIn from './pages/SignIn.jsx'
import AppliedJobs from './pages/AppliedJobs.jsx'
import SavedJobs from './pages/SavedJobs.jsx'
import MatchedAI from './pages/MatchedAI.jsx'
import ResumeUpload from './pages/ResumeUpload.jsx'
import Profile from './pages/Profile.jsx'

// Lazy stubs to be replaced as pages are added
function NotFound() { return <div style={{padding: 24}}><h2>Page not found</h2></div> }

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/createNewUser" element={<CreateNewUser />} />
      <Route path="/signIn" element={<SignIn />} />
      <Route path="/appliedJobs" element={<AppliedJobs />} />
      <Route path="/savedJobs" element={<SavedJobs />} />
      <Route path="/matchedAI" element={<MatchedAI />} />
      <Route path="/resume_upload" element={<ResumeUpload />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
