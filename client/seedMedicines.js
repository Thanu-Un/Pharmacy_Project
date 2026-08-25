const categoriesUrl = 'http://localhost:8080/api/operation/categories';
const unitsUrl = 'http://localhost:8080/api/operation/units';
const productsUrl = 'http://localhost:8080/api/operation/products';

async function seedMedicines() {
  try {
    console.log("Fetching Categories...");
    const catsRes = await fetch(categoriesUrl);
    if (!catsRes.ok) throw new Error("Failed to fetch categories");
    const categories = await catsRes.json();

    console.log("Fetching Units...");
    const unitsRes = await fetch(unitsUrl);
    if (!unitsRes.ok) throw new Error("Failed to fetch units");
    const units = await unitsRes.json();

    // Find specific categories or fallback
    const getCat = (name) => categories.find(c => c.name.toLowerCase().includes(name.toLowerCase())) || categories[0];
    // Find specific units or fallback
    const getUnit = (name) => units.find(u => u.name.toLowerCase().includes(name.toLowerCase())) || units[0];

    const tabletUnit = getUnit('tablet');
    const capsuleUnit = getUnit('capsule');
    const bottleUnit = getUnit('bottle');

    const medicines = [
      {
        code: '10000001',
        name: 'Paracetamol 500mg',
        category: getCat('Antipyretics'),
        unit: tabletUnit,
        cost: 0.50,
        price: 1.00,
        quantity: 500,
        alertQuantity: 50,
        details: 'Used to treat fever and mild to moderate pain.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
      },
      {
        code: '10000002',
        name: 'Amoxicillin 250mg',
        category: getCat('Antibiotics'),
        unit: capsuleUnit,
        cost: 2.50,
        price: 5.00,
        quantity: 200,
        alertQuantity: 20,
        details: 'Antibiotic used to treat bacterial infections.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300'
      },
      {
        code: '10000003',
        name: 'Ibuprofen 400mg',
        category: getCat('Analgesics'),
        unit: tabletUnit,
        cost: 0.80,
        price: 1.80,
        quantity: 300,
        alertQuantity: 30,
        details: 'Nonsteroidal anti-inflammatory drug (NSAID) to reduce pain.',
        image: 'https://images.unsplash.com/photo-1607619056574-7b8f304b3c8c?w=300'
      },
      {
        code: '10000004',
        name: 'Vitamin C 1000mg',
        category: getCat('Vitamins'),
        unit: bottleUnit,
        cost: 3.00,
        price: 6.50,
        quantity: 100,
        alertQuantity: 15,
        details: 'Immunity booster dietary supplement.',
        image: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=300'
      },
      {
        code: '10000005',
        name: 'Cetirizine 10mg',
        category: getCat('Antihistamines'),
        unit: tabletUnit,
        cost: 0.30,
        price: 0.80,
        quantity: 400,
        alertQuantity: 40,
        details: 'Antihistamine used to treat allergy symptoms.',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300'
      },
      {
        code: '10000006',
        name: 'Metformin 850mg',
        category: getCat('Endocrine'),
        unit: tabletUnit,
        cost: 1.20,
        price: 2.50,
        quantity: 350,
        alertQuantity: 25,
        details: 'First-line medication for the treatment of type 2 diabetes.',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f15e81a8?w=300'
      },
      {
        code: '10000007',
        name: 'Atorvastatin 20mg',
        category: getCat('Cardiovascular'),
        unit: tabletUnit,
        cost: 2.00,
        price: 4.20,
        quantity: 250,
        alertQuantity: 20,
        details: 'Statin medication used to prevent cardiovascular disease.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
      },
      {
        code: '10000008',
        name: 'Salbutamol Inhaler',
        category: getCat('Respiratory'),
        unit: bottleUnit,
        cost: 4.50,
        price: 9.00,
        quantity: 80,
        alertQuantity: 10,
        details: 'Used to open up the medium and large airways in the lungs.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300'
      },
      {
        code: '10000009',
        name: 'Omeprazole 20mg',
        category: getCat('Gastrointestinal'),
        unit: capsuleUnit,
        cost: 0.70,
        price: 1.50,
        quantity: 450,
        alertQuantity: 35,
        details: 'Proton-pump inhibitor that decreases stomach acid.',
        image: 'https://images.unsplash.com/photo-1607619056574-7b8f304b3c8c?w=300'
      },
      {
        code: '10000010',
        name: 'Ophthalmic Eye Drops',
        category: getCat('Ophthalmic'),
        unit: bottleUnit,
        cost: 1.80,
        price: 3.50,
        quantity: 120,
        alertQuantity: 15,
        details: 'Lubricant eye drops to relieve dry eyes.',
        image: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=300'
      }
    ];

    let count = 0;
    for (const med of medicines) {
      const response = await fetch(productsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(med)
      });
      if (response.ok) {
        count++;
        console.log(`Added medicine: ${med.name}`);
      } else {
        console.error(`Failed to add ${med.name}: ${await response.text()}`);
      }
    }
    console.log(`Successfully seeded ${count} medicines!`);
  } catch (err) {
    console.error("Error during seeding medicines:", err);
  }
}

seedMedicines();
