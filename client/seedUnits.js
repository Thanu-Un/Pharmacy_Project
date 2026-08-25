const baseUrl = 'http://localhost:8080/api/operation/units';

async function seedUnits() {
  try {
    console.log("Seeding Units...");

    // 1. Capsule (Base)
    let res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'CAP', name: 'Capsule' })
    });
    if (!res.ok) throw new Error(await res.text());
    const capsule = await res.json();
    console.log("Created:", capsule.name, "with ID:", capsule.id);

    // 2. Blister (1 Blister = 10 Capsules)
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code: 'BLI', 
        name: 'Blister', 
        baseUnitId: capsule.id, 
        operator: '*', 
        operationValue: '10' 
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const blister = await res.json();
    console.log("Created:", blister.name, "with ID:", blister.id);

    // 3. Box (1 Box = 10 Blisters)
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code: 'BOX', 
        name: 'Box', 
        baseUnitId: blister.id, 
        operator: '*', 
        operationValue: '10' 
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const box = await res.json();
    console.log("Created:", box.name, "with ID:", box.id);

    // 4. Bottle
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'BOT', name: 'Bottle' })
    });
    if (!res.ok) throw new Error(await res.text());
    const bottle = await res.json();
    console.log("Created:", bottle.name, "with ID:", bottle.id);

    // 5. Tablet
    res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TAB', name: 'Tablet' })
    });
    if (!res.ok) throw new Error(await res.text());
    const tablet = await res.json();
    console.log("Created:", tablet.name, "with ID:", tablet.id);

    console.log("Successfully seeded 5 units!");
  } catch (err) {
    console.error("Error during seeding:", err);
  }
}

seedUnits();
