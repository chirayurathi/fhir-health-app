// For Node < 18 uncomment next line:
// import fetch from "node-fetch";

const baseUrl = "https://hapi.fhir.org/baseR4";

async function getPatientData(patientId) {
  async function fetchFHIR(resource, query = "") {
    const response = await fetch(`${baseUrl}/${resource}${query}`);
    if (!response.ok) throw new Error(`Failed to fetch ${resource}: ${response.status}`);
    return response.json();
  }

  // 1️⃣ Get Patient
  const patient = await fetchFHIR(`Patient/${patientId}`);

  // 2️⃣ Get PCP (Practitioner)
  let pcp = null;
  try {
    if (patient.generalPractitioner?.[0]) {
      const pcpRef = patient.generalPractitioner[0].reference;
      const pcpData = await fetchFHIR(pcpRef);
      pcp = {
        id: pcpData.id,
        name: pcpData.name?.[0]
          ? `${pcpData.name[0].given?.join(" ")} ${pcpData.name[0].family}`
          : "Unknown",
        phone: pcpData.telecom?.find(t => t.system === "phone")?.value || "N/A",
        address: pcpData.address?.[0]
          ? `${pcpData.address[0].line?.join(", ")}, ${pcpData.address[0].city}, ${pcpData.address[0].state} ${pcpData.address[0].postalCode || ""}`
          : "N/A",
      };
    }
  } catch {
    pcp = null;
  }

  // 3️⃣ Get Allergies
  const allergyBundle = await fetchFHIR("AllergyIntolerance", `?patient=${patientId}`);
  const allergies = allergyBundle.entry?.map((entry, i) => {
    const a = entry.resource;
    return {
      id: a.id || `allergy-${i + 1}`,
      substance: a.code?.text || a.code?.coding?.[0]?.display || "Unknown",
      severity: a.reaction?.[0]?.severity || "Unknown",
      status: a.clinicalStatus?.coding?.[0]?.code || "Unknown",
    };
  }) || [];

  // 4️⃣ Get Emergency Contacts (RelatedPerson)
  const contactBundle = await fetchFHIR("RelatedPerson", `?patient=${patientId}`);
  const emergencyContacts = contactBundle.entry?.map((entry, i) => {
    const c = entry.resource;
    return {
      id: c.id || `contact-${i + 1}`,
      name: c.name?.[0]
        ? `${c.name[0].given?.join(" ")} ${c.name[0].family}`
        : "Unknown",
      relationship: c.relationship?.[0]?.coding?.[0]?.display || "Unknown",
      phone: c.telecom?.find(t => t.system === "phone")?.value || "N/A",
    };
  }) || [];

  // 5️⃣ Try to extract blood group
  let bloodGroup = "Unknown";

  // Option A: from Patient extension
  const extBlood = patient.extension?.find(e =>
    e.url.toLowerCase().includes("bloodgroup") ||
    e.url.toLowerCase().includes("blood-group")
  );
  if (extBlood) bloodGroup = extBlood.valueString || extBlood.valueCode || "Unknown";

  // Option B: from Observation (LOINC 883-9)
  if (bloodGroup === "Unknown") {
    try {
      const obsBundle = await fetchFHIR(
        "Observation",
        `?patient=${patientId}&code=http://loinc.org|883-9`
      );
      const obs = obsBundle.entry?.[0]?.resource;
      if (obs?.valueString) bloodGroup = obs.valueString;
      else if (obs?.valueCodeableConcept?.text)
        bloodGroup = obs.valueCodeableConcept.text;
    } catch {
      /* ignore */
    }
  }

  // 6️⃣ Final formatted data
  return {
    patient: {
      id: patient.id,
      name: patient.name?.[0]
        ? `${patient.name[0].given?.join(" ")} ${patient.name[0].family}`
        : "Unknown",
      birthDate: patient.birthDate || "Unknown",
      gender: patient.gender || "Unknown",
      bloodGroup,
      pcp,
      address: patient.address?.[0]
        ? `${patient.address[0].line?.join(", ")}, ${patient.address[0].city}, ${patient.address[0].state} ${patient.address[0].postalCode || ""}`
        : "Unknown",
      phone: patient.telecom?.find(t => t.system === "phone")?.value || "N/A",
      email: patient.telecom?.find(t => t.system === "email")?.value || "N/A",
    },
    allergies,
    emergencyContacts,
  };
}

// 🧪 Example test
getPatientData("45375590") // Replace with a real patient ID from HAPI
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);