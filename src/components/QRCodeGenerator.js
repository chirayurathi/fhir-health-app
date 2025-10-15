import React from 'react';
import styled from 'styled-components';
import QRCode from 'react-qr-code';

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const QRCodeWrapper = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  display: inline-block;
`;

const QRCodeWithLogo = styled.div`
  position: relative;
  display: inline-block;
`;

const LogoOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const ProvidenceLogo = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #718096;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(113, 128, 150, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const QRCodeGenerator = ({ data }) => {
  const hasData = Object.keys(data).length > 0;
  
  const formatDataToString = (data) => {
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

  const formattedString = formatDataToString(data);

  if (!hasData) {
    return (
      <EmptyState>
        <EmptyIcon>📋</EmptyIcon>
        <div>
          <h3>No Data Selected</h3>
          <p>Select items from your health data to generate a QR code</p>
        </div>
      </EmptyState>
    );
  }

  return (
    <QRCodeContainer>
      <QRCodeWrapper>
        <QRCodeWithLogo data-testid="qr-code-with-logo">
          <QRCode
            value={formattedString}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox="0 0 200 200"
            data-testid="qr-code"
          />
          <LogoOverlay>
            <ProvidenceLogo>
              <img src="/providence-logo.png" alt="Providence Hospitals" />
            </ProvidenceLogo>
          </LogoOverlay>
        </QRCodeWithLogo>
      </QRCodeWrapper>
    </QRCodeContainer>
  );
};

export default QRCodeGenerator;
