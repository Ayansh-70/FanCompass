async function testEndpoints() {
  console.log("--- Test 1: Fan Query (Wheelchair) ---");
  let res1 = await fetch('http://localhost:3000/api/fan/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "I need to get to my seat",
      context: { language: "en", seat_section: "A1", minutes_to_kickoff: 10, accessibility_needs: ["wheelchair"] }
    })
  });
  console.log("Status:", res1.status);
  console.log("Response:", await res1.json());

  console.log("\n--- Test 2: Fan Query (Low Vision) ---");
  let res2 = await fetch('http://localhost:3000/api/fan/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "I need to get to my seat",
      context: { language: "en", seat_section: "A1", minutes_to_kickoff: 10, accessibility_needs: ["low_vision"] }
    })
  });
  console.log("Status:", res2.status);
  console.log("Response:", await res2.json());

  console.log("\n--- Test 3: Staff Insight (Fake Gate) ---");
  let res3 = await fetch('http://localhost:3000/api/staff/insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      minutes_to_kickoff: 10,
      context: { gate_id: "G999", requesting_role: "volunteer" }
    })
  });
  console.log("Status:", res3.status);
  console.log("Response:", await res3.json());
}

testEndpoints().catch(console.error);
