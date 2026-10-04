import nodemailer from 'nodemailer';

// === Настройки почты из .env ===
const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;

const isMailConfigured = Boolean(MAIL_HOST && MAIL_USER && MAIL_PASS);

const port = Number(MAIL_PORT) || 465;

const transporter = isMailConfigured
    ? nodemailer.createTransport({
        host: MAIL_HOST,
        port,
        secure: port === 465,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS
        }
    })
    : null;

// === Защита от HTML в данных клиента ===
function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatPrice(value) {
    return `${value.toLocaleString('ru-RU')} ₽`;
}

// === HTML-версия чека ===
function buildReceiptHtml(order) {
    const rows = order.items.map(item => `
        <tr>
            <td style="padding:8px 0;border-bottom:1px solid #E3DCCD;">${escapeHtml(item.name)}</td>
            <td style="padding:8px 0;border-bottom:1px solid #E3DCCD;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #E3DCCD;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
    `).join('');

    const commentBlock = order.comment
        ? `<p style="margin:16px 0 0;"><strong>Комментарий:</strong> ${escapeHtml(order.comment)}</p>`
        : '';

    return `
        <div style="background:#F5EFE3;padding:32px 16px;font-family:Arial,sans-serif;color:#2E2A24;">
            <div style="max-width:480px;margin:0 auto;background:#FFFDF8;border-radius:16px;padding:32px;">
                <h1 style="margin:0 0 4px;font-family:Georgia,serif;color:#5B6B3A;">Мох и Мёд</h1>
                <p style="margin:0 0 24px;color:#6B655B;">Спасибо за заказ!</p>

                <p style="margin:0 0 4px;"><strong>Заказ №${order.id}</strong></p>
                <p style="margin:0 0 16px;color:#6B655B;">${escapeHtml(order.createdAt)}</p>

                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <thead>
                        <tr>
                            <th style="text-align:left;padding-bottom:8px;">Позиция</th>
                            <th style="text-align:center;padding-bottom:8px;">Кол-во</th>
                            <th style="text-align:right;padding-bottom:8px;">Сумма</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>

                <p style="margin:16px 0 0;font-size:18px;text-align:right;"><strong>Итого: ${formatPrice(order.total)}</strong></p>

                <p style="margin:24px 0 0;"><strong>Имя:</strong> ${escapeHtml(order.customerName)}</p>
                <p style="margin:4px 0 0;"><strong>Телефон:</strong> ${escapeHtml(order.customerPhone)}</p>
                ${commentBlock}
            </div>
        </div>
    `;
}

// === Текстовая версия (для почтовиков без HTML) ===
function buildReceiptText(order) {
    const lines = order.items.map(item =>
        `${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    );

    return [
        'Мох и Мёд — спасибо за заказ!',
        '',
        `Заказ №${order.id} от ${order.createdAt}`,
        '',
        ...lines,
        '',
        `Итого: ${formatPrice(order.total)}`,
        '',
        `Имя: ${order.customerName}`,
        `Телефон: ${order.customerPhone}`,
        order.comment ? `Комментарий: ${order.comment}` : ''
    ].join('\n').trim();
}

// === Отправка чека ===
export async function sendReceipt(order) {
    if (!order.customerEmail) return;

    if (!transporter) {
        console.log(`Почта не настроена в .env — чек к заказу №${order.id} не отправлен`);
        return;
    }

    await transporter.sendMail({
        from: `"Мох и Мёд" <${MAIL_USER}>`,
        to: order.customerEmail,
        subject: `Ваш заказ №${order.id} — Мох и Мёд`,
        text: buildReceiptText(order),
        html: buildReceiptHtml(order)
    });

    console.log(`Чек к заказу №${order.id} отправлен на ${order.customerEmail}`);
}

// === Подтверждение брони ===
function formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
}

function buildBookingHtml(booking) {
    const commentBlock = booking.comment
        ? `<p style="margin:8px 0 0;"><strong>Комментарий:</strong> ${escapeHtml(booking.comment)}</p>`
        : '';

    return `
        <div style="background:#F5EFE3;padding:32px 16px;font-family:Arial,sans-serif;color:#2E2A24;">
            <div style="max-width:480px;margin:0 auto;background:#FFFDF8;border-radius:16px;padding:32px;">
                <h1 style="margin:0 0 4px;font-family:Georgia,serif;color:#5B6B3A;">Мох и Мёд</h1>
                <p style="margin:0 0 24px;color:#6B655B;">Столик забронирован — ждём вас!</p>

                <p style="margin:0 0 8px;"><strong>Бронь №${booking.id}</strong></p>
                <p style="margin:0 0 8px;"><strong>Дата:</strong> ${formatDate(booking.date)}</p>
                <p style="margin:0 0 8px;"><strong>Время:</strong> ${booking.time} (на ${booking.durationHours} часа)</p>
                <p style="margin:0 0 8px;"><strong>Столик:</strong> №${escapeHtml(booking.tableLabel)}</p>
                <p style="margin:0 0 8px;"><strong>Гостей:</strong> ${booking.guests}</p>

                <p style="margin:24px 0 0;"><strong>Имя:</strong> ${escapeHtml(booking.guestName)}</p>
                <p style="margin:8px 0 0;"><strong>Телефон:</strong> ${escapeHtml(booking.guestPhone)}</p>
                ${commentBlock}

                <p style="margin:24px 0 0;color:#6B655B;font-size:13px;">Если планы изменятся, пожалуйста, позвоните нам.</p>
            </div>
        </div>
    `;
}

function buildBookingText(booking) {
    return [
        'Мох и Мёд — столик забронирован, ждём вас!',
        '',
        `Бронь №${booking.id}`,
        `Дата: ${formatDate(booking.date)}`,
        `Время: ${booking.time} (на ${booking.durationHours} часа)`,
        `Столик: №${booking.tableLabel}`,
        `Гостей: ${booking.guests}`,
        '',
        `Имя: ${booking.guestName}`,
        `Телефон: ${booking.guestPhone}`,
        booking.comment ? `Комментарий: ${booking.comment}` : '',
        '',
        'Если планы изменятся, пожалуйста, позвоните нам.'
    ].join('\n').trim();
}

export async function sendBookingConfirmation(booking) {
    if (!booking.guestEmail) return;

    if (!transporter) {
        console.log(`Почта не настроена в .env — подтверждение брони №${booking.id} не отправлено`);
        return;
    }

    await transporter.sendMail({
        from: `"Мох и Мёд" <${MAIL_USER}>`,
        to: booking.guestEmail,
        subject: `Бронь №${booking.id} на ${formatDate(booking.date)} — Мох и Мёд`,
        text: buildBookingText(booking),
        html: buildBookingHtml(booking)
    });

    console.log(`Подтверждение брони №${booking.id} отправлено на ${booking.guestEmail}`);
}
