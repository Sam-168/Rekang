import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './components/auth/AuthLayout'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoginPage } from './pages/auth/LoginPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { VerificationPage } from './pages/auth/VerificationPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/role" element={<RoleSelectionPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route path="/home" element={<ComingSoon />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function ComingSoon() {
  return (
    <main className="coming-soon">
      <a className="brand" href="/login" aria-label="Rekang home">rekang.</a>
      <p className="eyebrow">Next build batch</p>
      <h1>Your campus marketplace is next.</h1>
      <p>The account flow is complete. Marketplace screens will connect here.</p>
      <a className="button button--primary" href="/login">Back to sign in</a>
    </main>
  )
}

export default App
