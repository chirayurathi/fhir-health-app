// FHIR Service for interacting with HAPI FHIR public test server
// Documentation: http://hapi.fhir.org/

// Mock data for demo purposes - in a real app, this would come from FHIR API
const MOCK_DATA = {
  patient: {
    id: "patient-001",
    name: "John Smith",
    birthDate: "1985-03-15",
    gender: "male",
    address: "123 Main St, Anytown, NY 12345",
    phone: "(555) 123-4567",
    email: "john.smith@email.com"
  },
  allergies: [
    {
      id: "allergy-001",
      substance: "Penicillin",
      severity: "High",
      status: "Active"
    },
    {
      id: "allergy-002", 
      substance: "Peanuts",
      severity: "High",
      status: "Active"
    },
    {
      id: "allergy-003",
      substance: "Shellfish",
      severity: "Medium",
      status: "Active"
    }
  ],
  emergencyContacts: [
    {
      id: "contact-001",
      name: "Jane Smith",
      relationship: "Spouse",
      phone: "(555) 987-6543"
    },
    {
      id: "contact-002",
      name: "Robert Smith",
      relationship: "Father",
      phone: "(555) 456-7890"
    }
  ]
};

class FHIRService {
  constructor() {
    this.baseUrl = 'http://hapi.fhir.org/baseR4';
  }

  async getPatientData(ssn) {
    try {
      // In a real implementation, you would:
      // 1. Search for patient by identifier (SSN)
      // 2. Fetch patient demographics
      // 3. Fetch allergies
      // 4. Fetch emergency contacts
      
      // For demo purposes, return mock data after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different data based on SSN for demo
      const mockData = { ...MOCK_DATA };
      if (ssn.includes('123')) {
        mockData.patient.name = "Alice Johnson";
        mockData.patient.birthDate = "1990-07-22";
        mockData.patient.gender = "female";
        mockData.allergies = [
          {
            id: "allergy-004",
            substance: "Latex",
            severity: "High", 
            status: "Active"
          }
        ];
        mockData.emergencyContacts = [
          {
            id: "contact-003",
            name: "Mike Johnson",
            relationship: "Brother",
            phone: "(555) 234-5678"
          }
        ];
      }
      
      return mockData;
    } catch (error) {
      console.error('Error fetching FHIR data:', error);
      throw new Error('Failed to fetch patient data');
    }
  }

  // Real FHIR API calls (commented out for demo)
  /*
  async searchPatientByIdentifier(identifier) {
    const response = await fetch(
      `${this.baseUrl}/Patient?identifier=${identifier}`
    );
    if (!response.ok) {
      throw new Error('Failed to search for patient');
    }
    return response.json();
  }

  async getPatientById(patientId) {
    const response = await fetch(`${this.baseUrl}/Patient/${patientId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch patient');
    }
    return response.json();
  }

  async getAllergies(patientId) {
    const response = await fetch(
      `${this.baseUrl}/AllergyIntolerance?patient=${patientId}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch allergies');
    }
    return response.json();
  }

  async getEmergencyContacts(patientId) {
    const response = await fetch(
      `${this.baseUrl}/RelatedPerson?patient=${patientId}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch emergency contacts');
    }
    return response.json();
  }
  */
}

export const fhirService = new FHIRService();
