import fs from 'fs';

function escapeHtml(unsafe) {
  return (unsafe || '').replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

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
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
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
    
    // Sort invoices by client_name alphabetically A-Z
    invoices.sort((a, b) => {
      const aName = (a.client_name || 'UNKNOWN').toUpperCase();
      const bName = (b.client_name || 'UNKNOWN').toUpperCase();
      return aName.localeCompare(bName);
    });
    
    const statusGroups = {
      'PENDING': [],
      'PROCESSING': [],
      'COMPLETED': []
    };

    invoices.forEach(inv => {
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

    const emojis = {
      'PENDING': '⏳',
      'PROCESSING': '⚙️',
      'COMPLETED': '✅',
      'MAINTENANCE': '🛠️',
      'NOT_SUBMITTED': '📝'
    };

    let statusText = '';
    
    const buildStatusBlock = (statusKey) => {
      const groupInvoices = statusGroups[statusKey] || [];
      const emoji = emojis[statusKey] || '📦';
      const statusLabel = statusKey.replace(/_/g, ' ');
      
      let block = `${emoji} <b>${statusLabel}</b> : ${groupInvoices.length}`;
      groupInvoices.forEach((inv, index) => {
        const clientName = escapeHtml(inv.client_name || 'UNKNOWN');
        const paymentTag = String(inv.status || 'Unpaid').toUpperCase();
        block += \`\\n\${index + 1}. \${clientName} [\${paymentTag}]\`;
      });
      return block;
    };

    // Core 3 statuses
    const coreStatuses = ['PENDING', 'PROCESSING', 'COMPLETED'];
    const blocks = [];
    
    for (const status of coreStatuses) {
      blocks.push(buildStatusBlock(status));
    }
    
    // Other statuses, sorted alphabetically
    const otherStatuses = Object.keys(statusGroups)
      .filter(s => !coreStatuses.includes(s))
      .sort((a, b) => a.localeCompare(b));

    for (const status of otherStatuses) {
      blocks.push(buildStatusBlock(status));
    }

    statusText = blocks.join('\\n\\n');

    const message = \`<b>🧾 ThirtyOne Lab Status</b>\\nDate: \${mytDateStr} (MYT)\\n\\n<b>📦 Orders by Status</b>\\n\\n\${statusText}\`;

    await sendTelegramMessage(message);
    console.log("Successfully sent nightly status.");

  } catch (error) {
    console.error("Error occurred:", error);
    await sendTelegramMessage(\`⚠️ Nightly status FAILED: \${escapeHtml(error.message)}\`);
    process.exit(1);
  }
}

run();
