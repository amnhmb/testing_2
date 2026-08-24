import fs from 'fs';

async function run() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL or SUPABASE_ANON_KEY is missing.');
    process.exit(1);
  }

  console.log("Fetching all invoices...");
  const res = await fetch(`${url}/rest/v1/invoices?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });

  if (!res.ok) {
    console.error(`Supabase fetch failed: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const invoices = await res.json();
  let updatedCount = 0;

  for (const inv of invoices) {
    let newStatus = 'BELUM_DRAFT'; // Default
    
    if (inv.notes && inv.notes.includes('__METADATA__:')) {
      try {
        const metaStr = inv.notes.split('__METADATA__:')[1];
        const meta = JSON.parse(metaStr);
        if (meta.order_status !== undefined) {
           newStatus = meta.order_status;
        } else if (inv.order_status && inv.order_status !== 'BELUM_DRAFT') {
           // If column has something other than the default, trust it
           newStatus = inv.order_status; 
        }
      } catch(e) {
        console.warn(`Failed to parse metadata for invoice ${inv.id}`);
      }
    } else if (inv.order_status && inv.order_status !== 'BELUM_DRAFT') {
       newStatus = inv.order_status;
    }
    
    // Legacy mapping
    if (newStatus === 'NOT_SUBMITTED' || !newStatus) {
      newStatus = 'BELUM_DRAFT';
    }
    
    console.log(`Updating Invoice ${inv.id} -> ${newStatus}`);
    
    const updateRes = await fetch(`${url}/rest/v1/invoices?id=eq.${inv.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({ order_status: newStatus })
    });
    
    if (!updateRes.ok) {
      console.error(`Failed to update invoice ${inv.id}: ${updateRes.statusText}`);
    } else {
      updatedCount++;
    }
  }

  console.log(`Successfully backfilled ${updatedCount} out of ${invoices.length} invoices.`);
}

run();
