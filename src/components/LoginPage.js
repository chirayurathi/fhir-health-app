import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { MdSecurity, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
`;

const ShieldIcon = styled(MdSecurity)`
  width: 48px;
  height: 48px;
  color: #667eea;
  margin-right: 12px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0a0a0;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(102, 126, 234, 0.1);
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.2);
`;

const LoginPage = () => {
  const [ssn, setSsn] = useState('');
  const [showSsn, setShowSsn] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const history = useHistory();

  const formatSSN = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 9) {
      return cleaned.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
    }
    return cleaned.slice(0, 9).replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
  };

  const handleSSNChange = (e) => {
    const formatted = formatSSN(e.target.value);
    setSsn(formatted);
    setError('');
  };

  const validateSSN = (ssn) => {
    const cleaned = ssn.replace(/\D/g, '');
    return cleaned.length === 9;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateSSN(ssn)) {
      setError('Please enter a valid 9-digit Social Security Number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      login(ssn);
      history.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <ShieldIcon />
          <Title>Health Portal</Title>
        </Logo>
        <Subtitle>Secure access to your health information</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <MdSecurity size={20} />
            </InputIcon>
            <Input
              type={showSsn ? 'text' : 'password'}
              value={ssn}
              onChange={handleSSNChange}
              placeholder="Social Security Number"
              maxLength={11}
              required
            />
            <ToggleButton
              type="button"
              onClick={() => setShowSsn(!showSsn)}
              aria-label={showSsn ? 'Hide SSN' : 'Show SSN'}
            >
              {showSsn ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
            </ToggleButton>
          </InputGroup>

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Login'}
          </LoginButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
