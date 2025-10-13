import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdLogout, MdPerson, MdFavorite, MdGroup, MdQrCode, MdContentCopy, MdCheck } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { fhirService } from '../services/fhirService';
import QRCodeGenerator from './QRCodeGenerator';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
`;

const Header = styled.header`
  background: white;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserIcon = styled(MdPerson)`
  width: 40px;
  height: 40px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 8px;
  border-radius: 50%;
`;

const WelcomeText = styled.div`
  h1 {
    color: #1a202c;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  p {
    color: #718096;
    font-size: 0.875rem;
    margin: 0;
  }
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const DataSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
`;

const QRCodeSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const SectionTitle = styled.h2`
  color: #1a202c;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.02);
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  accent-color: #667eea;
  cursor: pointer;
`;

const DataContent = styled.div`
  flex: 1;
`;

const DataLabel = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const DataValue = styled.div`
  color: #4a5568;
  font-size: 0.875rem;
`;

const CategorySection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #718096;
  font-size: 1.125rem;
`;

const ErrorState = styled.div`
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const QRCodeWrapper = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const JSONPreview = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
`;

const JSONCode = styled.pre`
  color: #2d3748;
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CopyButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #5a67d8;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const DashboardPage = () => {
  const { ssn, logout } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!ssn) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await fhirService.getPatientData(ssn);
        setHealthData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ssn]);

  const handleItemToggle = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const getSelectedData = () => {
    if (!healthData) return {};

    const selectedData = {};

    if (selectedItems.has('patient')) {
      selectedData.patient = healthData.patient;
    }

    // Collect selected allergies
    const selectedAllergies = healthData.allergies.filter(allergy => 
      selectedItems.has(allergy.id)
    );
    if (selectedAllergies.length > 0) {
      selectedData.allergies = selectedAllergies;
    }

    // Collect selected emergency contacts
    const selectedContacts = healthData.emergencyContacts.filter(contact => 
      selectedItems.has(contact.id)
    );
    if (selectedContacts.length > 0) {
      selectedData.emergencyContacts = selectedContacts;
    }

    return selectedData;
  };

  const copyToClipboard = async () => {
    const selectedData = getSelectedData();
    const jsonString = JSON.stringify(selectedData, null, 2);
    
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingState>Loading your health data...</LoadingState>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorState>{error}</ErrorState>
      </DashboardContainer>
    );
  }

  if (!healthData) {
    return (
      <DashboardContainer>
        <ErrorState>No health data found</ErrorState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <HeaderLeft>
          <UserIcon />
          <WelcomeText>
            <h1>Welcome, {healthData.patient.name}</h1>
            <p>Manage your health information and generate QR codes</p>
          </WelcomeText>
        </HeaderLeft>
        <LogoutButton onClick={handleLogout}>
          <MdLogout size={16} />
          Logout
        </LogoutButton>
      </Header>

      <MainContent>
        <DataSection>
          <CategorySection>
            <SectionTitle>
              <MdPerson size={20} />
              Demographics
            </SectionTitle>
            <DataItem>
              <Checkbox
                type="checkbox"
                id="patient"
                checked={selectedItems.has('patient')}
                onChange={() => handleItemToggle('patient')}
              />
              <DataContent>
                <DataLabel>Personal Information</DataLabel>
                <DataValue>
                  {healthData.patient.name} • {healthData.patient.gender} • Born {healthData.patient.birthDate}
                </DataValue>
                <DataValue>
                  {healthData.patient.address} • {healthData.patient.phone} • {healthData.patient.email}
                </DataValue>
              </DataContent>
            </DataItem>
          </CategorySection>

          <CategorySection>
            <SectionTitle>
              <MdFavorite size={20} />
              Allergies ({healthData.allergies.length})
            </SectionTitle>
            {healthData.allergies.map((allergy) => (
              <DataItem key={allergy.id}>
                <Checkbox
                  type="checkbox"
                  id={allergy.id}
                  checked={selectedItems.has(allergy.id)}
                  onChange={() => handleItemToggle(allergy.id)}
                />
                <DataContent>
                  <DataLabel>{allergy.substance}</DataLabel>
                  <DataValue>
                    Severity: {allergy.severity} • Status: {allergy.status}
                  </DataValue>
                </DataContent>
              </DataItem>
            ))}
          </CategorySection>

          <CategorySection>
            <SectionTitle>
              <MdGroup size={20} />
              Emergency Contacts ({healthData.emergencyContacts.length})
            </SectionTitle>
            {healthData.emergencyContacts.map((contact) => (
              <DataItem key={contact.id}>
                <Checkbox
                  type="checkbox"
                  id={contact.id}
                  checked={selectedItems.has(contact.id)}
                  onChange={() => handleItemToggle(contact.id)}
                />
                <DataContent>
                  <DataLabel>{contact.name}</DataLabel>
                  <DataValue>
                    {contact.relationship} • {contact.phone}
                  </DataValue>
                </DataContent>
              </DataItem>
            ))}
          </CategorySection>
        </DataSection>

        <QRCodeSection>
          <SectionTitle>
            <MdQrCode size={20} />
            QR Code Generator
          </SectionTitle>
          
          <QRCodeContainer>
            <QRCodeWrapper>
              <QRCodeGenerator data={getSelectedData()} />
            </QRCodeWrapper>
            
            <JSONPreview>
              <JSONCode>
                {JSON.stringify(getSelectedData(), null, 2)}
              </JSONCode>
            </JSONPreview>
            
            <CopyButton onClick={copyToClipboard} disabled={Object.keys(getSelectedData()).length === 0}>
              {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </CopyButton>
          </QRCodeContainer>
        </QRCodeSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardPage;
