import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './components/AuthPage';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { UsersPage } from './pages/UsersPage';
import { Rol } from './types';

function AppRoutes() {
  const { usuario } = useAuth();
  return <Routes>
    <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <AuthPage />} />
    <Route path="/registro" element={usuario ? <Navigate to="/" replace /> : <AuthPage registro />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}>
      <Route index element={<DashboardPage />} />
      <Route path="productos" element={<ProductsPage />} />
      <Route element={<ProtectedRoute roles={[Rol.Admin]} />}><Route path="usuarios" element={<UsersPage />} /></Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  const basename = import.meta.env.PROD ? '/panel' : '/';
  return <BrowserRouter basename={basename}><AuthProvider><ProductProvider><AppRoutes /></ProductProvider></AuthProvider></BrowserRouter>;
}
