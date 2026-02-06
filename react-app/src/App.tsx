import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/query-client';
import { ThemeProvider } from './theme/ThemeProvider';
import { LoginPage } from './features/auth';
import { useSession } from './hooks';
import { Box, Typography, Container } from '@mui/material';

// Placeholder home component - to be implemented
function HomePage() {
  const { session } = useSession();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Appknox Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        User ID: {session?.user_id || 'Not logged in'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This is the React-Vite app. Features will be built phase by phase.
      </Typography>
    </Container>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h4">404 - Page Not Found</Typography>
                </Box>
              }
            />
          </Routes>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
