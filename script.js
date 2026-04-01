let cur = '0', prev = '', op = null, freshResult = false, justOpped = false;

const numEl  = document.getElementById('num');
const exprEl = document.getElementById('expr');

function fmt(val) {
    let n = parseFloat(val);
    if (isNaN(n)) return val;
    if (Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1e-9))
        return n.toExponential(6).replace(/\.?0+e/, 'e');
    let s = parseFloat(n.toPrecision(12)).toString();
    let parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function render() {
    numEl.textContent = fmt(cur);
    let size = cur.replace(/,/g, '').length;
    numEl.style.fontSize = size > 12 ? '1.8rem' : size > 9 ? '2.4rem' : '3.4rem';
}

function setActiveOp(o) {
    document.querySelectorAll('.btn-orange').forEach(b => b.classList.remove('active-op'));
    if (o) {
        document.querySelectorAll('[data-op]').forEach(b => {
            if (b.dataset.op === o) b.classList.add('active-op');
        });
    }
}

function calc(a, b, o) {
    a = parseFloat(a);
    b = parseFloat(b);
    if (o === '+') return a + b;
    if (o === '-') return a - b;
    if (o === '*') return a * b;
    if (o === '/') return b === 0 ? 'Error' : a / b;
}

function opLabel(o) {
    return { '+': '+', '-': '−', '*': '×', '/': '÷' }[o] || o;
}

document.getElementById('keys').addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const { action, val, op: opVal } = btn.dataset;

    if (action === 'num') {
        if (cur === '0' || freshResult || justOpped) {
            cur = (val === '0' && (cur === '0' || justOpped)) ? '0' : val;
            freshResult = false;
            justOpped = false;
        } else {
            if (cur.replace('-', '').replace('.', '').length >= 9) return;
            cur += val;
        }
        setActiveOp(null);
    }

    else if (action === 'dot') {
        if (freshResult || justOpped) { cur = '0.'; freshResult = false; justOpped = false; }
        else if (!cur.includes('.')) cur += '.';
        setActiveOp(null);
    }

    else if (action === 'ac') {
        cur = '0'; prev = ''; op = null; freshResult = false; justOpped = false;
        exprEl.textContent = '';
        setActiveOp(null);
    }

    else if (action === 'sign') {
        if (cur !== '0') cur = cur.startsWith('-') ? cur.slice(1) : '-' + cur;
    }

    else if (action === 'pct') {
        cur = String(parseFloat(cur) / 100);
    }

    else if (action === 'op') {
        if (op && !justOpped && !freshResult) {
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

    else if (action === 'eq') {
        if (!op) return;
        exprEl.textContent = fmt(prev) + ' ' + opLabel(op) + ' ' + fmt(cur) + ' =';
        let res = calc(prev, cur, op);
        if (res === 'Error') {
            cur = 'Error'; op = null;
        } else {
            cur = String(parseFloat(res.toPrecision ? res.toPrecision(12) : res));
            freshResult = true;
        }
        op = null;
        setActiveOp(null);
    }

    render();
});

render();

