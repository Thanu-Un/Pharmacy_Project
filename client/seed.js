const categories = [
  { code: 'CAT-001', name: 'Antibiotics', description: 'Medicines that destroy or slow down the growth of bacteria.' },
  { code: 'CAT-002', name: 'Analgesics', description: 'Painkillers used to relieve pain.' },
  { code: 'CAT-003', name: 'Antipyretics', description: 'Drugs that reduce fever.' },
  { code: 'CAT-004', name: 'Antiseptics', description: 'Substances applied to living tissue to reduce infection.' },
  { code: 'CAT-005', name: 'Vitamins', description: 'Organic compounds required as nutrients.' },
  { code: 'CAT-006', name: 'Supplements', description: 'Dietary supplements to improve health.' },
  { code: 'CAT-007', name: 'Cardiovascular', description: 'Drugs affecting the heart and blood vessels.' },
  { code: 'CAT-008', name: 'Respiratory', description: 'Medications for respiratory system diseases.' },
  { code: 'CAT-009', name: 'Gastrointestinal', description: 'Drugs for the stomach and intestines.' },
  { code: 'CAT-010', name: 'Dermatological', description: 'Topical medications for skin conditions.' },
  { code: 'CAT-011', name: 'Ophthalmic', description: 'Eye drops and treatments.' },
  { code: 'CAT-012', name: 'Neurological', description: 'Drugs for the nervous system.' },
  { code: 'CAT-013', name: 'Endocrine', description: 'Hormonal treatments.' },
  { code: 'CAT-014', name: 'Antihistamines', description: 'Medications for allergies.' },
  { code: 'CAT-015', name: 'Vaccines', description: 'Biological preparations for immunity.' },
  { code: 'CAT-016', name: 'First Aid', description: 'Basic medical supplies for immediate care.' },
  { code: 'CAT-017', name: 'Dental Care', description: 'Oral hygiene and treatments.' },
  { code: 'CAT-018', name: 'Pediatric', description: 'Medications specifically for children.' },
  { code: 'CAT-019', name: 'Maternal Care', description: 'Supplements and drugs for pregnancy.' },
  { code: 'CAT-020', name: 'Medical Devices', description: 'Equipment used for medical purposes.' }
];

async function seed() {
  let count = 0;
  for (const cat of categories) {
    try {
      const res = await fetch('http://localhost:8080/api/operation/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
      });
      if (res.ok) count++;
      else console.error(`Failed to add ${cat.code}: ${await res.text()}`);
    } catch (e) {
      console.error(`Error adding ${cat.code}:`, e.message);
    }
  }
  console.log(`Successfully added ${count} categories!`);
}
seed();
