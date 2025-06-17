const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { exec } = require('child_process');

// TODO Replace to google sheet path
const csv = fs.readFileSync(path.join(__dirname, 'sheet.csv'), 'utf8');

const parsed = Papa.parse(csv, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: false,
}).data;

const orderRows = parsed.slice(3);

let mergedMap = new Map();

const generateKey = (item) => {
    const extrasKey = JSON.stringify(
        (item.extras || []).sort((a, b) =>
            a.option_id.localeCompare(b.option_id)
        )
    );
    return `${item.id}-${extrasKey}-${item.comment || ''}`;
};

for (const row of orderRows) {
    const jsonStr = row[2];
    if (!jsonStr || !jsonStr.trim().startsWith('{')) continue;

    try {
        const json = JSON.parse(jsonStr);
        if (!Array.isArray(json.items)) continue;

        for (const item of json.items) {
            const key = generateKey(item);

            if (mergedMap.has(key)) {
                mergedMap.get(key).qty += item.qty;
            } else {
                // Deep clone to avoid reference issues
                mergedMap.set(key, JSON.parse(JSON.stringify(item)));
            }
        }
    } catch (err) {
        console.warn(
            `❌ JSON invalide sur la ligne ${parsed.indexOf(row) + 1}`
        );
    }
}

// Final payload
const finalPayload = Array.from(mergedMap.values());
const encoded = encodeURIComponent(JSON.stringify(finalPayload));
const baseUrl =
    'https://app.fritzy.be/r?time_before_order&accept_cash=false&cash_first=false&slug=friterie-de-la-gare&id=b5ce1d14-b4b4-493c-846b-eaab8a464240&name=%5Bobject%20Object%5D&address=%5Bobject%20Object%5D&longitude=4.6134811&latitude=50.6375544&description=%5Bobject%20Object%5D&eat_in=%5Bobject%20Object%5D&reopen_at=2025-06-14T20%3A11%3A57.730Z&image_cover=18aa908e-908e-4000-8a908e98a0.-.73b.png&promo=%5Bobject%20Object%5D&days=%5Bobject%20Object%5D&days=%5Bobject%20Object%5D&days=%5Bobject%20Object%5D&days=%5Bobject%20Object%5D&days=%5Bobject%20Object%5D&days=%5Bobject%20Object%5D&days_delivery=%5Bobject%20Object%5D&days_delivery=%5Bobject%20Object%5D&days_delivery=%5Bobject%20Object%5D&days_delivery=%5Bobject%20Object%5D&days_delivery=%5Bobject%20Object%5D&days_delivery=%5Bobject%20Object%5D&customer_fee=0.3&orders_per_shift=1&minimum_amount_order&special_shifts&loyalty=%5Bobject%20Object%5D&delivery=%5Bobject%20Object%5D&vertical=fritzy&qr_codes=10014&distance=0&user_distance=29.1493550166889&avails_today=%5Bobject%20Object%5D&avails_today=%5Bobject%20Object%5D&avails_times=11.5&avails_times=11.75&avails_times=12&avails_times=12.25&avails_times=12.5&avails_times=12.75&avails_times=13&avails_times=13.25&avails_times=13.5&avails_times=17.5&avails_times=17.75&avails_times=18&avails_times=18.25&avails_times=18.5&avails_times=18.75&avails_times=19&avails_times=19.25&avails_times=19.5&avails_times=19.75&avails_times=20&avails_times=20.25&avails_times=20.5&avails_times=20.75&avails_first_in=30&delivery_avails_today=%5Bobject%20Object%5D&delivery_avails_today=%5Bobject%20Object%5D&delivery_avails_times=11.5&delivery_avails_times=11.75&delivery_avails_times=12&delivery_avails_times=12.25&delivery_avails_times=12.5&delivery_avails_times=12.75&delivery_avails_times=13&delivery_avails_times=13.25&delivery_avails_times=13.5&delivery_avails_times=17.5&delivery_avails_times=17.75&delivery_avails_times=18&delivery_avails_times=18.25&delivery_avails_times=18.5&delivery_avails_times=18.75&delivery_avails_times=19&delivery_avails_times=19.25&delivery_avails_times=19.5&delivery_avails_times=19.75&delivery_avails_times=20&delivery_avails_times=20.25&delivery_avails_times=20.5&delivery_avails_times=20.75';
const finalUrl = `${baseUrl}&json_order=${encoded}`;

// copy to clipboard
exec(`echo "${finalUrl}" | pbcopy`, (err) => {
    if (err) {
        console.error('Error copying to clipboard:', err);
    } else {
        console.log('URL copied to clipboard successfully!');
    }
});
