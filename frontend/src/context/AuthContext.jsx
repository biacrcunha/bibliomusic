import { createContext, useContext, useState } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('bibliomusic_user');
    return salvo ? JSON.parse(salvo) : null;
  });
  async function login(email, senha) {
    const { data } = await api.post('/auth/login', {
      email,
      senha,
    });
    localStorage.setItem('bibliomusic_token', data.token);
    localStorage.setItem('bibliomusic_user', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }
  async function registrar(nome, email, senha) {
    const { data } = await api.post('/auth/register', {
      nome,
      email,
      senha,
    });
    localStorage.setItem('bibliomusic_token', data.token);
    localStorage.setItem('bibliomusic_user', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }
  function logout() {
    localStorage.removeItem('bibliomusic_token');
    localStorage.removeItem('bibliomusic_user');
    setUsuario(null);
  }
  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        registrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
