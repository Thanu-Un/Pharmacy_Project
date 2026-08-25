const suppliersUrl = 'http://localhost:8080/api/operation/suppliers';

async function seedSuppliers() {
  const suppliers = [
    {
      company: 'Mega Lifesciences Co., Ltd.',
      name: 'John Doe',
      emailAddress: 'supplier1@megalife.com',
      phone: '012345678',
      address: 'Building 15, St. 271, Sangkat Boeung Keng Kang',
      city: 'Phnom Penh'
    },
    {
      company: 'DKSH Cambodia Ltd.',
      name: 'Jane Smith',
      emailAddress: 'info.cambodia@dksh.com',
      phone: '098765432',
      address: 'PPSEZ, National Road 4',
      city: 'Phnom Penh'
    },
    {
      company: 'Pharma Product Manufacturing (PPM)',
      name: 'Sopheap Meas',
      emailAddress: 'sales@ppm-pharma.com',
      phone: '023880111',
      address: 'St. 598, Sangkat Boeung Kak II',
      city: 'Phnom Penh'
    }
  ];

  try {
    console.log("Seeding Suppliers...");
    let count = 0;
    for (const sup of suppliers) {
      const response = await fetch(suppliersUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sup)
      });
      if (response.ok) {
        count++;
        console.log(`Added supplier: ${sup.company}`);
      } else {
        console.error(`Failed to add supplier: ${sup.company}`);
      }
    }
    console.log(`Successfully seeded ${count} suppliers!`);
  } catch (err) {
    console.error("Error during seeding suppliers:", err);
  }
}

seedSuppliers();
