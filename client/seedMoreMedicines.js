const categoriesUrl = 'http://localhost:8080/api/operation/categories';
const unitsUrl = 'http://localhost:8080/api/operation/units';
const productsUrl = 'http://localhost:8080/api/operation/products';

async function seedMoreMedicines() {
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
        code: '10000011',
        name: 'Aspirin 81mg',
        category: getCat('Analgesics'),
        unit: tabletUnit,
        cost: 0.20,
        price: 0.50,
        quantity: 600,
        alertQuantity: 60,
        details: 'Low-dose aspirin used to prevent heart attacks and strokes.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
      },
      {
        code: '10000012',
        name: 'Loratadine 10mg',
        category: getCat('Antihistamines'),
        unit: tabletUnit,
        cost: 0.15,
        price: 0.45,
        quantity: 800,
        alertQuantity: 80,
        details: 'Non-drowsy 24-hour allergy relief medication.',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300'
      },
      {
        code: '10000013',
        name: 'Loperamide 2mg',
        category: getCat('Gastrointestinal'),
        unit: capsuleUnit,
        cost: 0.25,
        price: 0.75,
        quantity: 400,
        alertQuantity: 45,
        details: 'Used for fast relief of diarrhea.',
        image: 'https://images.unsplash.com/photo-1607619056574-7b8f304b3c8c?w=300'
      },
      {
        code: '10000014',
        name: 'Ranitidine 150mg',
        category: getCat('Gastrointestinal'),
        unit: tabletUnit,
        cost: 0.40,
        price: 1.00,
        quantity: 350,
        alertQuantity: 30,
        details: 'Reduces stomach acid to treat heartburn and indigestion.',
        image: 'https://images.unsplash.com/photo-1607619056574-7b8f304b3c8c?w=300'
      },
      {
        code: '10000015',
        name: 'Amlodipine 5mg',
        category: getCat('Cardiovascular'),
        unit: tabletUnit,
        cost: 0.35,
        price: 0.90,
        quantity: 500,
        alertQuantity: 50,
        details: 'Calcium channel blocker used to treat high blood pressure.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
      },
      {
        code: '10000016',
        name: 'Losartan 50mg',
        category: getCat('Cardiovascular'),
        unit: tabletUnit,
        cost: 0.60,
        price: 1.50,
        quantity: 300,
        alertQuantity: 30,
        details: 'Angiotensin II receptor antagonist for hypertension.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
      },
      {
        code: '10000017',
        name: 'Simvastatin 20mg',
        category: getCat('Cardiovascular'),
        unit: tabletUnit,
        cost: 0.50,
        price: 1.20,
        quantity: 450,
        alertQuantity: 40,
        details: 'Statin medication to lower blood cholesterol levels.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300'
      },
      {
        code: '10000018',
        name: 'Prednisolone 5mg',
        category: getCat('Endocrine'),
        unit: tabletUnit,
        cost: 0.30,
        price: 0.80,
        quantity: 200,
        alertQuantity: 25,
        details: 'Corticosteroid medication used to treat allergies and inflammation.',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f15e81a8?w=300'
      },
      {
        code: '10000019',
        name: 'Levothyroxine 50mcg',
        category: getCat('Endocrine'),
        unit: tabletUnit,
        cost: 0.45,
        price: 1.10,
        quantity: 400,
        alertQuantity: 35,
        details: 'Thyroid hormone replacement for hypothyroidism.',
        image: 'https://images.unsplash.com/photo-1628771065518-0d82f15e81a8?w=300'
      },
      {
        code: '10000020',
        name: 'Albuterol Inhaler 90mcg',
        category: getCat('Respiratory'),
        unit: bottleUnit,
        cost: 5.00,
        price: 11.50,
        quantity: 150,
        alertQuantity: 20,
        details: 'Bronchodilator for asthma relief and prevention of bronchospasm.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300'
      },
      {
        code: '10000021',
        name: 'Montelukast 10mg',
        category: getCat('Respiratory'),
        unit: tabletUnit,
        cost: 0.80,
        price: 1.95,
        quantity: 320,
        alertQuantity: 30,
        details: 'Leukotriene receptor antagonist used for maintenance of asthma.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300'
      },
      {
        code: '10000022',
        name: 'Azithromycin 500mg',
        category: getCat('Antibiotics'),
        unit: tabletUnit,
        cost: 3.50,
        price: 7.00,
        quantity: 180,
        alertQuantity: 15,
        details: 'Macrolide antibiotic used for bacterial infections.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300'
      },
      {
        code: '10000023',
        name: 'Ciprofloxacin 500mg',
        category: getCat('Antibiotics'),
        unit: tabletUnit,
        cost: 1.50,
        price: 3.80,
        quantity: 260,
        alertQuantity: 25,
        details: 'Fluoroquinolone antibiotic for bacterial infections.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300'
      },
      {
        code: '10000024',
        name: 'Cephalexin 500mg',
        category: getCat('Antibiotics'),
        unit: capsuleUnit,
        cost: 2.00,
        price: 4.50,
        quantity: 220,
        alertQuantity: 20,
        details: 'First-generation cephalosporin antibiotic.',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300'
      },
      {
        code: '10000025',
        name: 'Vitamin D3 1000IU',
        category: getCat('Vitamins'),
        unit: tabletUnit,
        cost: 1.00,
        price: 2.20,
        quantity: 400,
        alertQuantity: 40,
        details: 'Fat-soluble vitamin supplement for bone and immune health.',
        image: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=300'
      },
      {
        code: '10000026',
        name: 'Multivitamin Tablets',
        category: getCat('Vitamins'),
        unit: bottleUnit,
        cost: 4.00,
        price: 8.50,
        quantity: 110,
        alertQuantity: 15,
        details: 'Daily nutritional support dietary multivitamin.',
        image: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=300'
      },
      {
        code: '10000027',
        name: 'Calcium Supplement',
        category: getCat('Supplements'),
        unit: bottleUnit,
        cost: 2.80,
        price: 5.90,
        quantity: 130,
        alertQuantity: 15,
        details: 'Supports healthy bones, teeth, and muscles.',
        image: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=300'
      },
      {
        code: '10000028',
        name: 'Fish Oil 1000mg',
        category: getCat('Supplements'),
        unit: bottleUnit,
        cost: 3.50,
        price: 7.90,
        quantity: 140,
        alertQuantity: 20,
        details: 'Rich in Omega-3 fatty acids for heart and brain health.',
        image: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=300'
      },
      {
        code: '10000029',
        name: 'Hydrocortisone Cream 1%',
        category: getCat('Dermatological'),
        unit: bottleUnit,
        cost: 1.20,
        price: 2.80,
        quantity: 90,
        alertQuantity: 10,
        details: 'Topical steroid cream to relieve skin itching and inflammation.',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300'
      },
      {
        code: '10000030',
        name: 'Betadine Antiseptic 10%',
        category: getCat('Antiseptics'),
        unit: bottleUnit,
        cost: 1.50,
        price: 3.20,
        quantity: 160,
        alertQuantity: 15,
        details: 'Povidone-iodine solution used to treat skin wounds and prevent infections.',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300'
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
    console.log(`Successfully seeded ${count} additional medicines!`);
  } catch (err) {
    console.error("Error during seeding more medicines:", err);
  }
}

seedMoreMedicines();
