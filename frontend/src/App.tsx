import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { NotesPage } from './pages/NotesPage'
import { ProblemsPage } from './pages/ProblemsPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { RevisionPage } from './pages/RevisionPage'
import { JournalPage } from './pages/JournalPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { DiagramsPage } from './pages/DiagramsPage'
import { ChecklistPage } from './pages/ChecklistPage'
import { SystemDesignPage } from './pages/SystemDesignPage'

import { ThemeProvider } from './context/ThemeContext'
import { AccessProvider } from './context/AccessContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AccessProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/checklist" element={<ChecklistPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/diagrams" element={<DiagramsPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/system-design" element={<SystemDesignPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/revision" element={<RevisionPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AccessProvider>
      </ThemeProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--toast-bg, #FFFFFF)',
            color: 'var(--toast-color, #242522)',
            border: '1px solid var(--border-subtle, #E5E3DC)',
            fontSize: '12px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(36, 37, 34, 0.08)',
          },
          success: {
            iconTheme: {
              primary: '#315C48',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#9E3939',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}
