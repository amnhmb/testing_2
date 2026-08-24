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
    
    let totalDeposits = 0;
    let outstandingBalance = 0;
    const statusCounts = {
      'PENDING': 0,
      'PROCESSING': 0,
      'COMPLETED': 0
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
      
      statusCounts[order_status] = (statusCounts[order_status] || 0) + 1;

      // 2. Financials
      totalDeposits += parseFloat(inv.deposit || 0);
      if (inv.status !== 'Paid') {
        outstandingBalance += Math.max(0, parseFloat(inv.grand_total || 0) - parseFloat(inv.deposit || 0));
      }
    });

    // 23:50 MYT is UTC+8
    const mytDateObj = new Date(Date.now() + 8 * 3600 * 1000);
    const mytDateStr = mytDateObj.toISOString().split('T')[0];

    // Build the status lines, keeping the order PENDING, PROCESSING, COMPLETED first.
    let statusText = `- PENDING: ${statusCounts['PENDING']}\n- PROCESSING: ${statusCounts['PROCESSING']}\n- COMPLETED: ${statusCounts['COMPLETED']}`;
    for (const [status, count] of Object.entries(statusCounts)) {
      if (!['PENDING', 'PROCESSING', 'COMPLETED'].includes(status)) {
        statusText += `\n- ${status}: ${count}`;
      }
    }

    const message = `📅 ThirtyOne Lab Status (Snapshot Semasa)
Date: ${mytDateStr} (MYT)

📦 Orders by Status:
${statusText}

💰 Financials (All-Time):
- Total Deposits Received: RM ${totalDeposits.toFixed(2)}
- Total Outstanding Balance: RM ${outstandingBalance.toFixed(2)}
`;

    await sendTelegramMessage(message);
    console.log("Successfully sent nightly status.");

  } catch (error) {
    console.error("Error occurred:", error);
    await sendTelegramMessage(`⚠️ Nightly status FAILED: ${error.message}`);
    process.exit(1);
  }
}

run();
