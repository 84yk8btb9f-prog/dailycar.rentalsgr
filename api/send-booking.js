const { Resend } = require('resend');

const OWNER_EMAIL = 'dailyrentalsgreece@gmail.com';
const FROM        = 'Daily Car Rentals Greece <no-reply@dailycargreece.com>';
const PHONE       = '+30 698 305 6936';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    ref, first_name, last_name, email, phone,
    pickup_location, pickup_date, return_date,
    car_group, insurance, extras, notes, estimated_total,
  } = req.body || {};

  const customerName = [first_name, last_name].filter(Boolean).join(' ') || 'Customer';

  if (!process.env.RESEND_API_KEY) {
    console.warn('[send-booking] RESEND_API_KEY not set — skipping emails');
    return res.status(200).json({ ok: true, ref, note: 'emails_skipped' });
  }

  const resend  = new Resend(process.env.RESEND_API_KEY);
  const now     = new Date();
  const pickupD = pickup_date ? new Date(pickup_date) : null;
  const returnD = return_date ? new Date(return_date) : null;
  const sends   = [];

  // 1. Customer confirmation (immediate)
  if (email) {
    sends.push(resend.emails.send({
      from:    FROM,
      to:      email,
      subject: `Booking Confirmed #${ref} — Daily Car Rentals Greece`,
      html:    tplConfirm({ customerName, ref, pickup_location, pickup_date, return_date, car_group, insurance, extras, notes, estimated_total }),
    }));
  }

  // 2. Owner notification (immediate)
  sends.push(resend.emails.send({
    from:    FROM,
    to:      OWNER_EMAIL,
    subject: `New Booking #${ref} — ${customerName}`,
    html:    tplOwner({ customerName, ref, email, phone, pickup_location, pickup_date, return_date, car_group, insurance, extras, notes, estimated_total }),
  }));

  // 3. Customer reminder — 1 day before pickup at 09:00
  if (email && pickupD && pickupD > now) {
    const remind = new Date(pickupD);
    remind.setDate(remind.getDate() - 1);
    remind.setHours(9, 0, 0, 0);
    if (remind > now) {
      sends.push(resend.emails.send({
        from:        FROM,
        to:          email,
        subject:     `Your rental starts tomorrow — Booking #${ref}`,
        html:        tplReminder({ customerName, ref, pickup_location, pickup_date, car_group }),
        scheduledAt: remind.toISOString(),
      }));
    }
  }

  // 4. Testimonial request — 1 day after return at 10:00
  if (email && returnD && returnD > now) {
    const survey = new Date(returnD);
    survey.setDate(survey.getDate() + 1);
    survey.setHours(10, 0, 0, 0);
    sends.push(resend.emails.send({
      from:        FROM,
      to:          email,
      subject:     `How was your experience? — Daily Car Rentals Greece`,
      html:        tplTestimonial({ customerName, ref }),
      scheduledAt: survey.toISOString(),
    }));
  }

  await Promise.allSettled(sends);
  return res.status(200).json({ ok: true, ref });
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                              */
/* ------------------------------------------------------------------ */

function wrap(inner) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;max-width:600px">

<tr><td style="background:#0a0a0a;padding:24px 40px">
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:11px;font-weight:900;letter-spacing:4px;color:#e81c2e;text-transform:uppercase">DAILY CAR RENTALS</div>
  <div style="font-size:9px;letter-spacing:3px;color:rgba(255,255,255,0.25);margin-top:3px">GREECE &nbsp;·&nbsp; dailycargreece.com</div>
</td></tr>

${inner}

<tr><td style="background:#0a0a0a;padding:20px 40px;text-align:center">
  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);line-height:1.7">
    &copy; 2025 Daily Car Rentals Greece &nbsp;·&nbsp; Spyrou Davari, Koropi 194 00<br/>
    <a href="tel:+306983056936" style="color:rgba(255,255,255,0.3);text-decoration:none">${PHONE}</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function row(label, value, accent) {
  if (!value) return '';
  return `<tr>
    <td style="padding:10px 16px 10px 0;border-bottom:1px solid #f5f5f5;font-size:11px;color:#999;width:130px;vertical-align:top;white-space:nowrap">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;font-size:${accent ? '18px' : '14px'};font-weight:${accent ? '900' : '600'};color:${accent ? '#e81c2e' : '#111'};font-family:${accent ? 'Arial Black,Arial,sans-serif' : 'inherit'}">${value}</td>
  </tr>`;
}

function redBtn(href, label) {
  return `<a href="${href}" style="display:inline-block;background:#e81c2e;color:#fff;text-decoration:none;font-family:Arial Black,Arial,sans-serif;font-size:13px;font-weight:900;padding:14px 28px;border-radius:10px;letter-spacing:0.3px">${label}</a>`;
}

/* ------------------------------------------------------------------ */
/* TEMPLATE 1 — Customer booking confirmation                          */
/* ------------------------------------------------------------------ */
function tplConfirm({ customerName, ref, pickup_location, pickup_date, return_date, car_group, insurance, extras, notes, estimated_total }) {
  return wrap(`
<tr><td style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid #f0f0f0">
  <div style="width:56px;height:56px;background:#f0fdf4;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
  </div>
  <h1 style="margin:0 0 10px;font-size:22px;font-weight:900;color:#0a0a0a;font-family:Arial Black,Arial,sans-serif">Booking Confirmed!</h1>
  <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6">Hi ${customerName}, your request is received.<br/>We'll call you within <strong>1 hour</strong> to confirm everything.</p>
  <div style="display:inline-block;background:#0a0a0a;border-radius:8px;padding:10px 22px">
    <span style="font-family:Arial Black,Arial,sans-serif;font-size:11px;font-weight:900;letter-spacing:3px;color:#e81c2e">REF #${ref}</span>
  </div>
</td></tr>

<tr><td style="padding:32px 40px 8px">
  <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#bbb;margin-bottom:16px">Booking Summary</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${row('Pickup Location', pickup_location)}
    ${row('Pickup Date',     pickup_date)}
    ${row('Return Date',     return_date)}
    ${row('Vehicle',         car_group)}
    ${row('Insurance',       insurance)}
    ${extras && extras !== 'None' ? row('Extras', extras) : ''}
    ${notes ? row('Notes', notes) : ''}
    ${row('Estimated Total', estimated_total, true)}
  </table>
</td></tr>

<tr><td style="padding:24px 40px 8px">
  <div style="background:#f9f9f9;border-radius:12px;padding:22px 24px">
    <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#bbb;margin-bottom:14px">What happens next</div>
    <table cellpadding="0" cellspacing="0">
      <tr><td style="width:26px;vertical-align:top;padding-top:1px"><div style="width:20px;height:20px;background:#e81c2e;border-radius:50%;text-align:center;line-height:20px;font-size:9px;font-weight:900;color:#fff;font-family:Arial Black,Arial,sans-serif">1</div></td><td style="padding:0 0 10px 12px;font-size:13px;color:#444;line-height:1.5">We call or WhatsApp you within <strong>1 hour</strong> (08:00–22:00)</td></tr>
      <tr><td style="width:26px;vertical-align:top;padding-top:1px"><div style="width:20px;height:20px;background:#e81c2e;border-radius:50%;text-align:center;line-height:20px;font-size:9px;font-weight:900;color:#fff;font-family:Arial Black,Arial,sans-serif">2</div></td><td style="padding:0 0 10px 12px;font-size:13px;color:#444;line-height:1.5">We confirm availability, dates, and final price</td></tr>
      <tr><td style="width:26px;vertical-align:top;padding-top:1px"><div style="width:20px;height:20px;background:#e81c2e;border-radius:50%;text-align:center;line-height:20px;font-size:9px;font-weight:900;color:#fff;font-family:Arial Black,Arial,sans-serif">3</div></td><td style="padding:0 0 0 12px;font-size:13px;color:#444;line-height:1.5"><strong>Pay on pickup</strong> — no credit card required</td></tr>
    </table>
  </div>
</td></tr>

<tr><td style="padding:24px 40px 40px;text-align:center">
  <p style="margin:0 0 16px;font-size:13px;color:#999">Need us sooner? We're a call away.</p>
  ${redBtn('tel:+306983056936', 'Call ' + PHONE)}
  <p style="margin:12px 0 0;font-size:11px;color:#bbb">Available daily 08:00–22:00 &nbsp;·&nbsp; Koropi, Attica</p>
</td></tr>
`);
}

/* ------------------------------------------------------------------ */
/* TEMPLATE 2 — Owner new booking notification                         */
/* ------------------------------------------------------------------ */
function tplOwner({ customerName, ref, email, phone, pickup_location, pickup_date, return_date, car_group, insurance, extras, notes, estimated_total }) {
  return wrap(`
<tr><td style="background:#e81c2e;padding:14px 40px;text-align:center">
  <span style="font-family:Arial Black,Arial,sans-serif;font-size:12px;font-weight:900;color:#fff;letter-spacing:2px">NEW BOOKING RECEIVED</span>
</td></tr>

<tr><td style="padding:32px 40px 0;text-align:center">
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:26px;font-weight:900;color:#0a0a0a;letter-spacing:-0.5px">${customerName}</div>
  <div style="font-size:11px;color:#bbb;letter-spacing:2px;margin-top:4px">REF #${ref}</div>
</td></tr>

<tr><td style="padding:24px 40px 0">
  <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#bbb;margin-bottom:12px">Contact</div>
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding:6px 0;font-size:12px;color:#999;width:70px">Phone</td>
      <td><a href="tel:${phone}" style="font-size:17px;font-weight:900;color:#e81c2e;text-decoration:none;font-family:Arial Black,Arial,sans-serif">${phone}</a></td>
    </tr>
    ${email ? `<tr><td style="padding:6px 0;font-size:12px;color:#999">Email</td><td><a href="mailto:${email}" style="font-size:14px;font-weight:600;color:#333;text-decoration:none">${email}</a></td></tr>` : ''}
  </table>
</td></tr>

<tr><td style="padding:24px 40px 8px">
  <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#bbb;margin-bottom:12px">Booking Details</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${row('Pickup Location', pickup_location)}
    ${row('Pickup Date',     pickup_date)}
    ${row('Return Date',     return_date)}
    ${row('Vehicle',         car_group)}
    ${row('Insurance',       insurance)}
    ${extras && extras !== 'None' ? row('Extras', extras) : ''}
    ${notes ? row('Notes', notes) : ''}
    ${row('Estimated Total', estimated_total, true)}
  </table>
</td></tr>

<tr><td style="padding:24px 40px 40px;text-align:center">
  ${redBtn('tel:' + phone, 'Call Customer Now')}
  ${email ? `&nbsp;&nbsp;<a href="mailto:${email}" style="display:inline-block;background:#f0f0f0;color:#0a0a0a;text-decoration:none;font-family:Arial Black,Arial,sans-serif;font-size:12px;font-weight:700;padding:14px 22px;border-radius:10px">Reply by Email</a>` : ''}
</td></tr>
`);
}

/* ------------------------------------------------------------------ */
/* TEMPLATE 3 — Customer pre-rental reminder (1 day before)           */
/* ------------------------------------------------------------------ */
function tplReminder({ customerName, ref, pickup_location, pickup_date, car_group }) {
  return wrap(`
<tr><td style="padding:40px 40px 24px;text-align:center;border-bottom:1px solid #f0f0f0">
  <h1 style="margin:0 0 10px;font-size:22px;font-weight:900;color:#0a0a0a;font-family:Arial Black,Arial,sans-serif">See you tomorrow!</h1>
  <p style="margin:0;color:#555;font-size:14px;line-height:1.6">Hi ${customerName}, a friendly reminder for booking <strong>#${ref}</strong>.</p>
</td></tr>

<tr><td style="padding:28px 40px 8px">
  <table width="100%" cellpadding="0" cellspacing="0">
    ${row('Pickup Date',     pickup_date)}
    ${row('Pickup Location', pickup_location)}
    ${row('Vehicle',         car_group)}
  </table>
</td></tr>

<tr><td style="padding:8px 40px 32px">
  <div style="background:#f9f9f9;border-radius:12px;padding:22px 24px">
    <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#bbb;margin-bottom:12px">What to bring</div>
    <div style="font-size:13px;color:#444;line-height:2.2">
      &mdash; Valid driving licence<br/>
      &mdash; National ID card or passport<br/>
      &mdash; Payment (cash or card accepted)<br/>
      &mdash; Security deposit (returned at end of rental)
    </div>
  </div>
</td></tr>

<tr><td style="padding:0 40px 40px;text-align:center">
  <p style="margin:0 0 16px;font-size:13px;color:#999">Questions? We're here.</p>
  ${redBtn('tel:+306983056936', 'Call ' + PHONE)}
  <p style="margin:12px 0 0;font-size:11px;color:#bbb">Daily 08:00–22:00</p>
</td></tr>
`);
}

/* ------------------------------------------------------------------ */
/* TEMPLATE 4 — Customer testimonial / review request (day after)     */
/* ------------------------------------------------------------------ */
function tplTestimonial({ customerName, ref }) {
  return wrap(`
<tr><td style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid #f0f0f0">
  <h1 style="margin:0 0 10px;font-size:22px;font-weight:900;color:#0a0a0a;font-family:Arial Black,Arial,sans-serif">Thank you, ${customerName}!</h1>
  <p style="margin:0;color:#555;font-size:14px;line-height:1.6">We hope you enjoyed your rental with us.<br/>We'd love to hear about your experience.</p>
</td></tr>

<tr><td style="padding:32px 40px">
  <div style="background:#f9f9f9;border-radius:12px;padding:24px;text-align:center">
    <div style="font-size:28px;letter-spacing:4px;color:#fbbf24;margin-bottom:12px">★★★★★</div>
    <div style="font-size:14px;color:#444;line-height:1.7;margin-bottom:20px">
      Your feedback helps us improve and helps other travellers<br/>make confident decisions. It only takes 30 seconds.
    </div>
    ${redBtn('https://g.page/r/daily-car-rentals-greece/review', 'Leave a Google Review')}
  </div>
</td></tr>

<tr><td style="padding:0 40px 32px">
  <div style="border-radius:12px;border:1px solid #e8e8e8;padding:22px 24px">
    <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#bbb;margin-bottom:12px">Book again?</div>
    <p style="margin:0 0 16px;font-size:13px;color:#555;line-height:1.6">Our returning customers get priority service.<br/>Call us or visit our website to check availability.</p>
    <a href="https://dailycargreece.com/contact.html" style="font-size:13px;font-weight:700;color:#e81c2e;text-decoration:none">Book your next rental &rarr;</a>
  </div>
</td></tr>

<tr><td style="padding:0 40px 40px;text-align:center">
  <p style="margin:0;font-size:12px;color:#aaa">Booking ref: <strong>#${ref}</strong> &nbsp;·&nbsp; <a href="tel:+306983056936" style="color:#aaa;text-decoration:none">${PHONE}</a></p>
</td></tr>
`);
}
