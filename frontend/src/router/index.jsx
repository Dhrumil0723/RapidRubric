import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedLayout from '../components/layout/ProtectedLayout'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

import StudentDashboard from '../pages/student/StudentDashboard'
import SubmitAssignment from '../pages/student/SubmitAssignment'
import MyFeedback from '../pages/student/MyFeedback'
import FeedbackViewer from '../pages/student/FeedbackViewer'
import VersionHistory from '../pages/student/VersionHistory'

import TADashboard from '../pages/ta/TADashboard'
import TAReleased from '../pages/ta/TAReleased'
import TAReturned from '../pages/ta/TAReturned'
import ReviewSubmission from '../pages/ta/ReviewSubmission'

import InstructorDashboard from '../pages/instructor/InstructorDashboard'
import Courses from '../pages/instructor/Courses'
import RubricBuilder from '../pages/instructor/RubricBuilder'
import Analytics from '../pages/instructor/Analytics'

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600">You are not authorized to view this page.</p>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedLayout allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/feedback" element={<MyFeedback />} />
          <Route path="/student/feedback/:submissionId" element={<FeedbackViewer />} />
          <Route path="/student/versions" element={<VersionHistory />} />
          <Route path="/student/assignments/:assignmentId/submit" element={<SubmitAssignment />} />
        </Route>

        <Route element={<ProtectedLayout allowedRoles={['ta']} />}>
          <Route path="/ta" element={<TADashboard />} />
          <Route path="/ta/released" element={<TAReleased />} />
          <Route path="/ta/returned" element={<TAReturned />} />
          <Route path="/ta/review/:submissionId" element={<ReviewSubmission />} />
        </Route>

        <Route element={<ProtectedLayout allowedRoles={['instructor']} />}>
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<Courses />} />
          <Route path="/instructor/rubrics/new" element={<RubricBuilder />} />
          <Route path="/instructor/analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
