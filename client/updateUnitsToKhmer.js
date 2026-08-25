const baseUrl = 'http://localhost:8080/api/operation/units';

async function updateUnits() {
  try {
    console.log("Updating Units to Khmer names...");

    // 1. Capsule -> គ្រាប់
    await fetch(baseUrl + '/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'CAP', name: 'គ្រាប់' })
    });
    console.log("Updated ID 1 to គ្រាប់");

    // 2. Blister -> បន្ទះ
    await fetch(baseUrl + '/2', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'BLI', name: 'បន្ទះ', baseUnitId: 1, operator: '*', operationValue: '10' })
    });
    console.log("Updated ID 2 to បន្ទះ");

    // 3. Box -> ប្រអប់
    await fetch(baseUrl + '/3', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'BOX', name: 'ប្រអប់', baseUnitId: 2, operator: '*', operationValue: '10' })
    });
    console.log("Updated ID 3 to ប្រអប់");

    // 4. Bottle -> ដប
    await fetch(baseUrl + '/4', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'BOT', name: 'ដប' })
    });
    console.log("Updated ID 4 to ដប");

    // 5. Tablet -> គ្រាប់សំប៉ែត
    await fetch(baseUrl + '/5', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'TAB', name: 'គ្រាប់សំប៉ែត' })
    });
    console.log("Updated ID 5 to គ្រាប់សំប៉ែត");

    console.log("Successfully updated all units to Khmer names!");
  } catch (err) {
    console.error("Error during update:", err);
  }
}

updateUnits();
