import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Redirect to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <GlobalStyle />
      <Router>
        <AppContainer>
          <Switch>
            <Route path="/login" component={LoginPage} />
            <Route 
              path="/dashboard" 
              component={() => (
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              )} 
            />
            <Route path="/" render={() => <Redirect to="/login" />} />
          </Switch>
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;
