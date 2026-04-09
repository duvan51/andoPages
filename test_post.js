const url = 'https://vcjyvquqgteqiemdnrul.supabase.co/rest/v1/treatments';
const apiKey = 'sb_publishable_l5VJBPLTlzstB9sMHaoJqw_vV07pibv';

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': apiKey,
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    title: 'Test',
    description: 'Test',
    category: 'Diagnóstico',
    active: true,
    price: '0',
    imageUrl: '',
    secondary_images: [],
    videos: [],
    company_id: 'dbbd37ca-876a-466d-a199-3bd1af94e225' // mock uuid
  })
}).then(res => Promise.all([res.status, res.text()]))
  .then(([status, body]) => console.log('POST WITH VIDEO:', status, '\nBody:', body))
  .catch(console.error);

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': apiKey,
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    title: 'Test',
    description: 'Test',
    category: 'Diagnóstico',
    active: true,
    price: '0',
    imageUrl: '',
    secondary_images: [],
    // videos: [],
    company_id: 'dbbd37ca-876a-466d-a199-3bd1af94e225' // mock uuid
  })
}).then(res => Promise.all([res.status, res.text()]))
  .then(([status, body]) => console.log('POST WITHOUT VIDEO:', status, '\nBody:', body))
  .catch(console.error);
