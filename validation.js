// === Общие проверки контактных данных ===
// Используются и в заказах, и в бронях

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizePhone(phone) {
    const digits = String(phone).replace(/\D/g, '');

    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
        return '+7' + digits.slice(1);
    }

    if (digits.length === 10) {
        return '+7' + digits;
    }

    return null;
}

// Возвращает { contact } при успехе или { error } с текстом ошибки
export function validateContact(data) {
    const name = String(data?.name ?? '').trim();
    const phone = normalizePhone(data?.phone ?? '');
    const email = String(data?.email ?? '').trim().toLowerCase();
    const comment = String(data?.comment ?? '').trim();

    if (name.length < 2 || name.length > 50) {
        return { error: 'Укажите имя' };
    }

    if (!phone) {
        return { error: 'Укажите корректный номер телефона' };
    }

    if (email && !EMAIL_PATTERN.test(email)) {
        return { error: 'Проверьте адрес почты' };
    }

    if (comment.length > 300) {
        return { error: 'Комментарий слишком длинный' };
    }

    return { contact: { name, phone, email, comment } };
}
