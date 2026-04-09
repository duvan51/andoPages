const url = 'https://vcjyvquqgteqiemdnrul.supabase.co/rest/v1/treatments?limit=1';
const apiKey = 'sb_publishable_l5VJBPLTlzstB9sMHaoJqw_vV07pibv';

fetch(url, {
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
