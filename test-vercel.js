fetch('https://zorxm13.vercel.app/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'test',
    post_id: 1,
    generation_type: 'test',
    dev_mode: true,
    license_key: 'dev_bypass_2024'
  })
}).then(r => r.json()).then(data => {
  console.log("Vercel Test Result:")
  console.log(JSON.stringify(data, null, 2))
}).catch(e => {
  console.error("Test failed", e)
})
