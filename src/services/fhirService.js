// FHIR Service for interacting with HAPI FHIR public test server
// Documentation: http://hapi.fhir.org/

// Mock data for demo purposes - in a real app, this would come from FHIR API
const MOCK_DATA = {
  patient: {
    id: "patient-001",
    name: "John Smith",
    birthDate: "1985-03-15",
    gender: "male",
    bloodGroup: "O+",
    pcp: {
      id: "pcp-001",
      name: "Dr. Jane Williams",
      phone: "(555) 987-6543",
      address: "456 Medical Center, Anytown, NY 12345"
    },
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
      console.log(`Searching for patient with SSN: ${ssn}`);
      
      // Step 1: Search for patient by identifier (SSN)
      const patients = await this.searchPatientByIdentifier(ssn);
      
      if (!patients.entry || patients.entry.length === 0) {
        // If no real patient found, fall back to mock data for demo
        console.log('No patient found in FHIR server, using mock data');
        return this.getMockData(ssn);
      }
      
      const patientResource = patients.entry[0].resource;
      const patientId = patientResource.id;
      
      console.log(`Found patient: ${patientId}`);
      
      // Step 2: Fetch patient demographics
      const patient = await this.getPatientById(patientId);
      
      // Step 3: Fetch allergies
      const allergies = await this.getAllergies(patientId);
      
      // Step 4: Fetch emergency contacts
      const emergencyContacts = await this.getEmergencyContacts(patientId);
      
      // Transform FHIR resources to our app format
      return this.transformFHIRData(patient, allergies, emergencyContacts);
      
    } catch (error) {
      console.error('Error fetching FHIR data:', error);
      
      // Fall back to mock data if FHIR server is unavailable
      console.log('Falling back to mock data due to error');
      return this.getMockData(ssn);
    }
  }

  getMockData(ssn) {
    // Simulate loading delay
    return new Promise(resolve => {
      setTimeout(() => {
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
        resolve(mockData);
      }, 1000);
    });
  }

  transformFHIRData(patient, allergies, emergencyContacts) {
    // Extract patient name
    const name = patient.name && patient.name[0] 
      ? `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim()
      : 'Unknown Patient';

    // Extract address
    const address = patient.address && patient.address[0]
      ? `${patient.address[0].line?.join(', ') || ''}, ${patient.address[0].city || ''}, ${patient.address[0].state || ''} ${patient.address[0].postalCode || ''}`.trim()
      : 'Address not available';

    // Extract phone
    const phone = patient.telecom?.find(t => t.system === 'phone')?.value || 'Phone not available';

    // Extract email
    const email = patient.telecom?.find(t => t.system === 'email')?.value || 'Email not available';

    // Extract blood group from extensions
    const bloodGroup = patient.extension?.find(ext => 
      ext.url === 'http://hl7.org/fhir/StructureDefinition/patient-bloodGroup'
    )?.valueCodeableConcept?.text || 'Blood group not available';

    // Extract PCP information
    const pcpReference = patient.generalPractitioner?.[0];
    const pcp = pcpReference ? {
      id: pcpReference.reference,
      name: pcpReference.display || 'PCP name not available',
      phone: 'PCP phone not available',
      address: 'PCP address not available'
    } : {
      id: 'not-available',
      name: 'PCP not available',
      phone: 'Phone not available',
      address: 'Address not available'
    };

    return {
      patient: {
        id: patient.id,
        name: name,
        birthDate: patient.birthDate || 'Birth date not available',
        gender: patient.gender || 'Gender not specified',
        bloodGroup: bloodGroup,
        pcp: pcp,
        address: address,
        phone: phone,
        email: email
      },
      allergies: this.transformAllergies(allergies),
      emergencyContacts: this.transformEmergencyContacts(emergencyContacts)
    };
  }

  transformAllergies(allergiesBundle) {
    if (!allergiesBundle.entry) return [];
    
    return allergiesBundle.entry.map(entry => {
      const allergy = entry.resource;
      return {
        id: allergy.id,
        substance: allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown substance',
        severity: allergy.criticality || 'Unknown severity',
        status: allergy.clinicalStatus?.coding?.[0]?.code || 'Unknown status'
      };
    });
  }

  transformEmergencyContacts(contactsBundle) {
    if (!contactsBundle.entry) return [];
    
    return contactsBundle.entry.map(entry => {
      const contact = entry.resource;
      const name = contact.name 
        ? `${contact.name.given?.join(' ') || ''} ${contact.name.family || ''}`.trim()
        : 'Unknown Contact';
      
      return {
        id: contact.id,
        name: name,
        relationship: contact.relationship?.[0]?.coding?.[0]?.display || 'Relationship not specified',
        phone: contact.telecom?.find(t => t.system === 'phone')?.value || 'Phone not available'
      };
    });
  }

  // Real FHIR API calls
  async searchPatientByIdentifier(identifier) {
    try {
      const response = await fetch(
        `${this.baseUrl}/Patient?identifier=${identifier}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Patient search result:', data);
      return data;
    } catch (error) {
      console.error('Error searching for patient:', error);
      throw error;
    }
  }

  async getPatientById(patientId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/Patient/${patientId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Patient data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async getAllergies(patientId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/AllergyIntolerance?patient=${patientId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Allergies data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching allergies:', error);
      throw error;
    }
  }

  async getEmergencyContacts(patientId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/RelatedPerson?patient=${patientId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Emergency contacts data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      throw error;
    }
  }
}

export const fhirService = new FHIRService();
