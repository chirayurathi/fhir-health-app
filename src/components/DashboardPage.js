import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdLogout, MdPerson, MdFavorite, MdGroup, MdQrCode, MdContentCopy, MdCheck, MdDownload } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { fhirService } from '../services/fhirService';
import QRCodeGenerator from './QRCodeGenerator';
import html2canvas from 'html2canvas';

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
  justify-content: space-between;
`;

const SectionTitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DownloadButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;

  &:hover {
    background: #5a67d8;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
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

  const formatDataForPreview = (data) => {
    let result = '';
    
    // Patient information
    if (data.patient) {
      result += 'PATIENT INFO\n';
      result += `Name: ${data.patient.name}\n`;
      result += `Birth Date: ${data.patient.birthDate}\n`;
      result += `Gender: ${data.patient.gender}\n`;
      result += `Address: ${data.patient.address}\n`;
      result += `Phone: ${data.patient.phone}\n`;
      result += `Email: ${data.patient.email}\n\n`;
    }
    
    // Allergies
    if (data.allergies && data.allergies.length > 0) {
      result += 'ALLERGIES\n';
      data.allergies.forEach((allergy, index) => {
        result += `Substance: ${allergy.substance}\n`;
        result += `Severity: ${allergy.severity}\n`;
        result += `Status: ${allergy.status}\n`;
        if (index < data.allergies.length - 1) {
          result += '\n';
        }
      });
      result += '\n';
    }
    
    // Emergency Contacts
    if (data.emergencyContacts && data.emergencyContacts.length > 0) {
      result += 'EMERGENCY CONTACTS\n';
      data.emergencyContacts.forEach((contact, index) => {
        result += `Name: ${contact.name}\n`;
        result += `Relationship: ${contact.relationship}\n`;
        result += `Phone: ${contact.phone}\n`;
        if (index < data.emergencyContacts.length - 1) {
          result += '\n';
        }
      });
    }
    
    return result.trim();
  };

  const copyToClipboard = async () => {
    const selectedData = getSelectedData();
    const formattedString = formatDataForPreview(selectedData);
    
    try {
      await navigator.clipboard.writeText(formattedString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadQRCode = () => {
    const selectedData = getSelectedData();
    const hasData = Object.keys(selectedData).length > 0;
    
    if (!hasData) {
      console.log('No data selected for download');
      return;
    }
    
    console.log('Starting QR code download...');
    
    // Find the QR code SVG element more specifically - look for the QR code component's SVG
    let qrCodeElement = null;
    
    // Try to find the QR code container with logo
    const qrCodeWithLogo = document.querySelector('[data-testid="qr-code-with-logo"]');
    if (qrCodeWithLogo) {
      qrCodeElement = qrCodeWithLogo;
      console.log('Found QR code with logo container via data-testid');
    } else {
      // Fallback to the old method
      const qrCodeContainer = document.querySelector('[data-testid="qr-code"]');
      if (qrCodeContainer) {
        // Find the parent container that includes the logo (QRCodeWithLogo)
        const qrWithLogo = qrCodeContainer.closest('div[style*="position: relative"]');
        if (qrWithLogo) {
          qrCodeElement = qrWithLogo;
          console.log('Found QR code with logo container');
        } else {
          qrCodeElement = qrCodeContainer.querySelector('svg');
          console.log('Found QR code via data-testid fallback');
        }
      }
    }
    
    // Fallback: look for SVG within the QR code wrapper
    if (!qrCodeElement) {
      const qrWrapper = document.querySelector('div[style*="padding: 1rem"]'); // QRCodeWrapper styling
      if (qrWrapper) {
        qrCodeElement = qrWrapper.querySelector('svg');
        console.log('Found QR code via wrapper fallback');
      }
    }
    
    // Last resort: find the largest SVG (QR codes are typically larger than icons)
    if (!qrCodeElement) {
      const allSvgs = document.querySelectorAll('svg');
      let largestSvg = null;
      let largestArea = 0;
      
      allSvgs.forEach(svg => {
        const rect = svg.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > largestArea) {
          largestArea = area;
          largestSvg = svg;
        }
      });
      
      if (largestSvg && largestArea > 10000) { // QR codes are typically large
        qrCodeElement = largestSvg;
        console.log('Found QR code via largest SVG fallback');
      }
    }
    
    if (!qrCodeElement) {
      console.error('QR code SVG element not found');
      console.log('Available SVG elements:', document.querySelectorAll('svg'));
      console.log('SVG sizes:', Array.from(document.querySelectorAll('svg')).map(svg => {
        const rect = svg.getBoundingClientRect();
        return `${rect.width}x${rect.height}`;
      }));
      return;
    }
    
    console.log('Found QR code SVG element:', qrCodeElement);
    
    try {
      // Check if we found the container with logo or just the SVG
      const isContainer = qrCodeElement.tagName !== 'svg';
      
      if (isContainer) {
        // Use html2canvas approach for container with logo
        console.log('Using container approach for QR code with logo');
        
        // Install html2canvas if not available
        if (typeof html2canvas === 'undefined') {
          console.log('html2canvas not available, falling back to SVG approach');
          const svg = qrCodeElement.querySelector('svg');
          if (svg) {
            qrCodeElement = svg;
          } else {
            throw new Error('No SVG found in container');
          }
        } else {
          // Use html2canvas to capture the entire container
          html2canvas(qrCodeElement, {
            backgroundColor: 'white',
            scale: 2,
            width: 200,
            height: 200
          }).then(canvas => {
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `health-qr-code-${new Date().toISOString().split('T')[0]}.png`;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
                console.log('QR code with logo PNG download initiated');
              }
            }, 'image/png', 1.0);
          }).catch(error => {
            console.error('html2canvas error:', error);
            throw error;
          });
          return; // Exit early for html2canvas approach
        }
      }
      
      // Fallback to SVG approach
      console.log('Using SVG approach');
      
      // Get the bounding box of the SVG
      const svgRect = qrCodeElement.getBoundingClientRect();
      console.log('SVG dimensions:', svgRect);
      
      // Create a canvas with higher resolution for better quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 2; // Higher resolution
      canvas.width = 200 * scale;
      canvas.height = 200 * scale;
      
      // Set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clone and modify the SVG
      const svgClone = qrCodeElement.cloneNode(true);
      svgClone.setAttribute('width', '200');
      svgClone.setAttribute('height', '200');
      svgClone.setAttribute('viewBox', '0 0 200 200');
      
      // Get the SVG data as string with proper namespace
      const svgData = new XMLSerializer().serializeToString(svgClone);
      console.log('SVG data:', svgData.substring(0, 200) + '...');
      
      // Create a data URL with proper MIME type and encoding
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
      
      // Create an image from the SVG data
      const img = new Image();
      img.onload = function() {
        console.log('Image loaded successfully');
        
        // Scale the context for higher resolution
        ctx.scale(scale, scale);
        
        // Draw the image on canvas
        ctx.drawImage(img, 0, 0, 200, 200);
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Canvas blob created, size:', blob.size);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `health-qr-code-${new Date().toISOString().split('T')[0]}.png`;
            link.style.display = 'none';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
            console.log('QR code PNG download initiated');
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/png', 1.0);
      };
      
      img.onerror = function() {
        console.error('Failed to load SVG as image');
      };
      
      img.src = svgDataUrl;
      
    } catch (error) {
      console.error('Error downloading QR code:', error);
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
              <SectionTitleLeft>
                <MdPerson size={20} />
                Demographics
              </SectionTitleLeft>
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
              <SectionTitleLeft>
                <MdFavorite size={20} />
                Allergies ({healthData.allergies.length})
              </SectionTitleLeft>
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
              <SectionTitleLeft>
                <MdGroup size={20} />
                Emergency Contacts ({healthData.emergencyContacts.length})
              </SectionTitleLeft>
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
            <SectionTitleLeft>
              <MdQrCode size={20} />
              QR Code Generator
            </SectionTitleLeft>
            <DownloadButton 
              onClick={downloadQRCode} 
              disabled={Object.keys(getSelectedData()).length === 0}
              title="Download QR Code"
            >
              <MdDownload size={16} />
            </DownloadButton>
          </SectionTitle>
          
          <QRCodeContainer>
            <QRCodeWrapper>
              <QRCodeGenerator data={getSelectedData()} />
            </QRCodeWrapper>
            
            <JSONPreview>
              <JSONCode>
                {formatDataForPreview(getSelectedData())}
              </JSONCode>
            </JSONPreview>
            
            <CopyButton onClick={copyToClipboard} disabled={Object.keys(getSelectedData()).length === 0}>
              {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
              {copied ? 'Copied!' : 'Copy Text'}
            </CopyButton>
          </QRCodeContainer>
        </QRCodeSection>
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardPage;
