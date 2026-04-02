// O'zgaruvchilarni e'lon qilish
let cur = '0',          // Hozirgi kiritilayotgan son (ekranda ko'rinib turgan)
    prev = '',         // Oldingi kiritilgan son (operatsiyadan oldingi)
    op = null,         // Tanlangan operator (+, -, *, /)
    freshResult = false, // Natija chiqarilgandan keyin yangi son kiritilayotganini tekshirish
    justOpped = false;  // Operator tugmasi hozirgina bosilganini bildiradi

// HTML elementlarini JS orqali ushlab olish
const numEl  = document.getElementById('num');  // Asosiy raqamlar chiqadigan joy
const exprEl = document.getElementById('expr'); // Hisoblash jarayoni (tepadagi kichik matn)

/**
 * fmt() funksiyasi - Sonlarni formatlash uchun.
 * Masalan: 1000 ni 1,000 ko'rinishiga keltiradi yoki juda katta sonlarni
 * eksponental ko'rinishga (1.2e+15) o'tkazadi.
 */
function fmt(val) {
    let n = parseFloat(val);
    if (isNaN(n)) return val; // Agar son bo'lmasa, o'zini qaytaradi (masalan, "Error")

    // Juda katta yoki juda kichik sonlar uchun eksponental format
    if (Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1-9))
        return n.toExponential(6).replace(/\.?0+e/, 'e');

    // Sonlarni vergul bilan ajratish (masalan: 1,234,567)
    let s = parseFloat(n.toPrecision(12)).toString();
    let parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

/**
 * render() funksiyasi - Ekrandagi ma'lumotlarni yangilaydi.
 * Shuningdek, son uzunlashgan sari shrift hajmini kichraytiradi.
 */
function render() {
    numEl.textContent = fmt(cur);
    let size = cur.replace(/,/g, '').length;
    // Raqamlar ko'payib ketsa, shrift hajmini o'zgartirish (dinamik dizayn)
    numEl.style.fontSize = size > 12 ? '1.8rem' : size > 9 ? '2.4rem' : '3.4rem';
}

/**
 * setActiveOp() - Tanlangan operator tugmasini (masalan, +)
 * vizual ravishda faol (active) qilib ko'rsatish uchun.
 */
function setActiveOp(o) {
    document.querySelectorAll('.btn-orange').forEach(b => b.classList.remove('active-op'));
    if (o) {
        document.querySelectorAll('[data-op]').forEach(b => {
            if (b.dataset.op === o) b.classList.add('active-op');
        });
    }
}

/**
 * calc() funksiyasi - Matematik amallarni bajaradi.
 */
function calc(a, b, o) {
    a = parseFloat(a);
    b = parseFloat(b);
    if (o === '+') return a + b;
    if (o === '-') return a - b;
    if (o === '*') return a * b;
    if (o === '/') return b === 0 ? 'Error' : a / b; // 0 ga bo'lish xatosi
}

/**
 * opLabel() - Operator belgilarini chiroyli ko'rinishga o'tkazadi (masalan, '*' -> '×').
 */
function opLabel(o) {
    return { '+': '+', '-': '−', '*': '×', '/': '÷' }[o] || o;
}

/**
 * Tugmalar bosilishini nazorat qilish (Event Delegation)
 */
document.getElementById('keys').addEventListener('click', e => {
    const btn = e.target.closest('.btn'); // Bosilgan element tugma ekanligini aniqlash
    if (!btn) return;
    const { action, val, op: opVal } = btn.dataset; // Tugma ichidagi ma'lumotlarni olish

    // RAQAMLAR BOSILGANDA
    if (action === 'num') {
        if (cur === '0' || freshResult || justOpped) {
            cur = (val === '0' && (cur === '0' || justOpped)) ? '0' : val;
            freshResult = false;
            justOpped = false;
        } else {
            // Maksimal 9 ta raqam kiritish cheklovi
            if (cur.replace('-', '').replace('.', '').length >= 9) return;
            cur += val;
        }
        setActiveOp(null);
    }

    // NUQTA BOSILGANDA
    else if (action === 'dot') {
        if (freshResult || justOpped) { cur = '0.'; freshResult = false; justOpped = false; }
        else if (!cur.includes('.')) cur += '.';
        setActiveOp(null);
    }

    // TOZALASH (AC) BOSILGANDA
    else if (action === 'ac') {
        cur = '0'; prev = ''; op = null; freshResult = false; justOpped = false;
        exprEl.textContent = '';
        setActiveOp(null);
    }

    // ISHORANI O'ZGARTIRISH (+/-)
    else if (action === 'sign') {
        if (cur !== '0') cur = cur.startsWith('-') ? cur.slice(1) : '-' + cur;
    }

    // FOIZ (%) HISOBLASH
    else if (action === 'pct') {
        cur = String(parseFloat(cur) / 100);
    }

    // OPERATORLAR (+, -, *, /) BOSILGANDA
    else if (action === 'op') {
        if (op && !justOpped && !freshResult) {
            // Agar ketma-ket amallar bajarilsa (masalan, 5 + 5 + ...), oraliq natijani hisoblaydi
            let res = calc(prev, cur, op);
            exprEl.textContent = fmt(prev) + ' ' + opLabel(op) + ' ' + fmt(cur) + ' =';
            cur = String(parseFloat(res.toPrecision ? res.toPrecision(12) : res));
            prev = cur;
        } else {
            prev = cur;
        }
        op = opVal;
        justOpped = true;
        freshResult = false;
        exprEl.textContent = fmt(prev) + ' ' + opLabel(op);
        setActiveOp(op);
    }

    // TENG ( = ) BOSILGANDA
    else if (action === 'eq') {
        if (!op) return;
        exprEl.textContent = fmt(prev) + ' ' + opLabel(op) + ' ' + fmt(cur) + ' =';
        let res = calc(prev, cur, op);
        if (res === 'Error') {
            cur = 'Error'; op = null;
        } else {
            // Natijani aniqlik darajasini to'g'rilab chiqarish
            cur = String(parseFloat(res.toPrecision ? res.toPrecision(12) : res));
            freshResult = true;
        }
        op = null;
        setActiveOp(null);
    }

    render(); // Har bir amaldan keyin ekranni yangilash
});

// Dastlabki ishga tushirish
render();