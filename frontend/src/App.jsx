import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Painel from './pages/Painel'
import FormularioPersonagem from './pages/FormularioPersonagem'
import Ficha from './pages/Ficha'
import { lerToken } from './services/api'

function RotaProtegida({ children }) {
  return lerToken() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route
        path="/painel"
        element={
          <RotaProtegida>
            <Painel />
          </RotaProtegida>
        }
      />
      <Route
        path="/personagens/novo"
        element={
          <RotaProtegida>
            <FormularioPersonagem />
          </RotaProtegida>
        }
      />
      <Route
        path="/personagens/:id/editar"
        element={
          <RotaProtegida>
            <FormularioPersonagem />
          </RotaProtegida>
        }
      />
      <Route
        path="/personagens/:id"
        element={
          <RotaProtegida>
            <Ficha />
          </RotaProtegida>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}