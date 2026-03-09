const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100);
};

// Utilities for creating amortization tables
function createTable(headers, rows) {
    let table = '<table class="data-table"><thead><tr>';
    headers.forEach(h => table += `<th>${h}</th>`);
    table += '</tr></thead><tbody>';
    rows.forEach(r => {
        table += '<tr>';
        r.forEach(c => table += `<td>${c}</td>`);
        table += '</tr>';
    });
    table += '</tbody></table>';
    return table;
}

// Common input val
function getVal(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}

// Inits a calculator with generic reset logic
function initCalc(calcConfig) {
    const { id, calculate, inputs } = calcConfig;
    const form = document.getElementById(id);
    if (!form) return;

    const btnCalc = form.querySelector('.btn-primary');
    const btnReset = form.querySelector('button[type="reset"]');

    if (btnCalc) {
        btnCalc.addEventListener('click', (e) => {
            e.preventDefault();
            calculate();
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            setTimeout(() => {
                // Clear results
                const resPanel = form.querySelector('.result-panel');
                if (resPanel) resPanel.innerHTML = '<div class="result-value">-</div><div class="result-secondary">Fill details to see results</div>';
            }, 0);
        });
    }
}

// Individual tools initialization
document.addEventListener('DOMContentLoaded', () => {

    // Compound Interest
    initCalc({
        id: 'form-compound',
        calculate: () => {
            const principal = getVal('principal');
            const monthly = getVal('monthly');
            const rateStr = getVal('rate');
            const years = getVal('years');

            const rate = rateStr / 100;
            const n = 12; // Monthly compound
            const t = years;

            let balance = principal * Math.pow(1 + rate / n, n * t);
            let futureValSeries = (monthly * (Math.pow(1 + rate / n, n * t) - 1)) / (rate / n);
            const totalBalance = balance + futureValSeries;

            const totalContr = monthly * 12 * years;
            const interestEarned = totalBalance - principal - totalContr;

            document.getElementById('result-panel').innerHTML = `
        <div class="result-value">${formatCurrency(totalBalance)}</div>
        <div class="result-secondary">Total Contributions: ${formatCurrency(totalContr + principal)}</div>
        <div class="result-secondary">Total Interest: ${formatCurrency(interestEarned)}</div>
      `;
        }
    });

});
