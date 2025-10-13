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
  const jsonString = JSON.stringify(data, null, 2);

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
        <QRCode
          value={jsonString}
          size={200}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox="0 0 200 200"
        />
      </QRCodeWrapper>
    </QRCodeContainer>
  );
};

export default QRCodeGenerator;
