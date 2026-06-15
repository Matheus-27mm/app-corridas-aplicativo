import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

import { AppLayout } from '@/components/app-layout'
import { Toaster } from '@/components/ui/sonner'
import { AbastecimentosPage } from '@/pages/abastecimentos'
import { DespesasPage } from '@/pages/despesas'
import { GanhosPage } from '@/pages/ganhos'
import { InicioPage } from '@/pages/inicio'
import { LoginPage } from '@/pages/login'
import { MaisPage } from '@/pages/mais'

import './index.css'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: 'ganhos', element: <GanhosPage /> },
      { path: 'abastecimentos', element: <AbastecimentosPage /> },
      { path: 'despesas', element: <DespesasPage /> },
      { path: 'mais', element: <MaisPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>,
)
