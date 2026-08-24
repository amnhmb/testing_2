import fs from 'fs';

async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.');
    return;
  }
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
  if (!res.ok) {
    console.error(`Telegram API error: ${res.status} ${res.statusText}`);
  }
}

async function run() {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is missing.');
    }

    const res = await fetch(`${url}/rest/v1/invoices?select=*`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });

    if (!res.ok) {
      throw new Error(`Supabase fetch failed: ${res.status} ${res.statusText}`);
    }

    const invoices = await res.json();
    
    // Sort invoices by invoice_no ascending
    invoices.sort((a, b) => {
      const aNo = a.invoice_no || '';
      const bNo = b.invoice_no || '';
      return aNo.localeCompare(bNo, undefined, { numeric: true });
    });
    
    const statusGroups = {
      'PENDING': [],
      'PROCESSING': [],
      'COMPLETED': []
    };

    invoices.forEach(inv => {
      // 1. Parse Status
      let order_status = inv.order_status || 'PENDING';
      if (inv.notes && inv.notes.includes('__METADATA__:')) {
        try {
          const metaStr = inv.notes.split('__METADATA__:')[1];
          const meta = JSON.parse(metaStr);
          if (meta.order_status !== undefined) order_status = meta.order_status;
        } catch(e) {}
      }
      
      if (!statusGroups[order_status]) {
        statusGroups[order_status] = [];
      }
      
      statusGroups[order_status].push(inv);
    });

    // 23:50 MYT is UTC+8
    const mytDateObj = new Date(Date.now() + 8 * 3600 * 1000);
    const mytDateStr = mytDateObj.toISOString().split('T')[0];

    let statusText = '';
    
    const buildStatusBlock = (status) => {
      const groupInvoices = statusGroups[status] || [];
      let block = `${status} : ${groupInvoices.length}`;
      groupInvoices.forEach((inv, index) => {
        const clientName = inv.client_name || 'UNKNOWN';
        const paymentTag = String(inv.status || 'Unpaid').toUpperCase();
        block += `\n${index + 1}. ${clientName} [${paymentTag}]`;
      });
      return block;
    };

    // Core 3 statuses
    const coreStatuses = ['PENDING', 'PROCESSING', 'COMPLETED'];
    const blocks = [];
    
    for (const status of coreStatuses) {
      blocks.push(buildStatusBlock(status));
    }
    
    // Other statuses
    for (const status of Object.keys(statusGroups)) {
      if (!coreStatuses.includes(status)) {
        blocks.push(buildStatusBlock(status));
      }
    }

    statusText = blocks.join('\n\n');

    const message = `🧾 ThirtyOne Lab Status (Snapshot Semasa)\nDate: ${mytDateStr} (MYT)\n\n📦 Orders by Status:\n\n${statusText}`;

    await sendTelegramMessage(message);
    console.log("Successfully sent nightly status.");

  } catch (error) {
    console.error("Error occurred:", error);
    await sendTelegramMessage(`⚠️ Nightly status FAILED: ${error.message}`);
    process.exit(1);
  }
}

run();
