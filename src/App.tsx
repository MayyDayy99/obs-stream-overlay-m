import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OverlayView } from '@/components/OverlayView'
import { ControllerView } from '@/components/ControllerView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OverlayView />} />
        <Route path="/controller" element={<ControllerView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App