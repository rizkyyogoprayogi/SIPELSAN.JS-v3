import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Santriwati from './pages/Santriwati'
import Kelas from './pages/Kelas'
import MasterPelanggaran from './pages/MasterPelanggaran'
import InputPelanggaran from './pages/InputPelanggaran'
import Riwayat from './pages/Riwayat'
import GenerateSurat from './pages/GenerateSurat'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="santriwati" element={<Santriwati />} />
            <Route path="kelas" element={<Kelas />} />
            <Route path="master-pelanggaran" element={<MasterPelanggaran />} />
            <Route path="input-pelanggaran" element={<InputPelanggaran />} />
            <Route path="riwayat" element={<Riwayat />} />
            <Route path="generate-surat" element={<GenerateSurat />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
