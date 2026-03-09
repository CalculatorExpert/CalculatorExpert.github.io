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

  // Live Auto Calculation with Debounce
  let timeoutId;
  form.addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      calculate();
    }, 300); // 300ms debounce
  });

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


// Generated Additions to tools.js
function getValForm(form, id) {
  const el = form.querySelector('#' + id);
  return el ? (parseFloat(el.value) || 0) : 0;
}

function initCalcExtra(calcConfig) {
  const form = document.getElementById(calcConfig.id);
  if (!form) return;

  const btnCalc = form.querySelector('.btn-primary');
  const btnReset = form.querySelector('button[type="reset"]');
  const resPanel = document.getElementById('result-panel-' + calcConfig.id);

  if (btnCalc) {
    btnCalc.addEventListener('click', (e) => {
      e.preventDefault();
      calcConfig.calculate(form, resPanel);
    });
  }

  // Live Auto Calculation with Debounce
  let timeoutId;
  form.addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      calcConfig.calculate(form, resPanel);
    }, 300); // 300ms debounce
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      setTimeout(() => {
        if (resPanel) resPanel.innerHTML = '<div class="result-value">-</div><div class="result-secondary">Fill details to see results</div>';
      }, 0);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {

  initCalcExtra({
    id: 'form-loan',
    calculate: (form, resPanel) => {
      const amount = getValForm(form, 'amount');
      const apr = getValForm(form, 'apr') / 100;
      const term = getValForm(form, 'term');

      const r = apr / 12;
      const pmt = r > 0 ? (amount * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1) : (amount / term);
      const totalPaid = pmt * term;

      resPanel.innerHTML = `
        <div class="result-value">Monthly: ${formatCurrency(pmt)}</div>
        <div class="result-secondary">Total Interest: ${formatCurrency(totalPaid - amount)}</div>
        <div class="result-secondary">Total Paid: ${formatCurrency(totalPaid)}</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-mortgage',
    calculate: (form, resPanel) => {
      const price = getValForm(form, 'price');
      const down = getValForm(form, 'down');
      const apr = getValForm(form, 'apr') / 100;
      const years = getValForm(form, 'years');
      const tax = getValForm(form, 'tax') / 12;
      const ins = getValForm(form, 'insurance') / 12;

      const p = price - down;
      const r = apr / 12;
      const n = years * 12;
      const pmt = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : (p / n);

      resPanel.innerHTML = `
        <div class="result-value">Total Monthly: ${formatCurrency(pmt + tax + ins)}</div>
        <div class="result-secondary">P&I: ${formatCurrency(pmt)} | Tax/Ins: ${formatCurrency(tax + ins)}</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-savings-goal',
    calculate: (form, resPanel) => {
      let current = getValForm(form, 'current');
      const monthly = getValForm(form, 'monthly');
      const rate = getValForm(form, 'rate') / 100 / 12;
      const target = getValForm(form, 'target');

      let months = 0;
      if (monthly <= 0 && current < target && rate <= 0) {
        months = -1;
      } else {
        while (current < target && months < 1200) {
          current += current * rate + monthly;
          months++;
        }
      }

      resPanel.innerHTML = months >= 0
        ? `<div class="result-value">${months} Months</div><div class="result-secondary">~ ${(months / 12).toFixed(1)} years</div>`
        : `<div class="result-value">Unreachable</div>`;
    }
  });

  initCalcExtra({
    id: 'form-retirement',
    calculate: (form, resPanel) => {
      const age = getValForm(form, 'age');
      const retAge = getValForm(form, 'retire_age');
      let sav = getValForm(form, 'savings');
      const cont = getValForm(form, 'contribution');
      const ret = getValForm(form, 'return_rate') / 100;
      const wr = getValForm(form, 'withdrawal_rate') / 100;

      const years = retAge - age;
      for (let i = 0; i < years; i++) {
        sav = (sav + cont) * (1 + ret);
      }

      resPanel.innerHTML = `
        <div class="result-value">Nest Egg: ${formatCurrency(sav)}</div>
        <div class="result-secondary">Estimated Yearly Withdrawal: ${formatCurrency(sav * wr)}</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-inflation',
    calculate: (form, resPanel) => {
      const amt = getValForm(form, 'amount');
      const r = getValForm(form, 'rate') / 100;
      const y = getValForm(form, 'years');

      const future = amt * Math.pow(1 + r, y);
      const past = amt / Math.pow(1 + r, y);

      resPanel.innerHTML = `
        <div class="result-value">Future Cost: ${formatCurrency(future)}</div>
        <div class="result-secondary">To have the purchasing power of ${formatCurrency(amt)} today</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-budget',
    calculate: (form, resPanel) => {
      const inc = getValForm(form, 'income');
      resPanel.innerHTML = `
        <div class="result-value">50/30/20 Rule</div>
        <div class="result-secondary">Needs (50%): ${formatCurrency(inc * 0.5)}</div>
        <div class="result-secondary">Wants (30%): ${formatCurrency(inc * 0.3)}</div>
        <div class="result-secondary">Savings/Debt (20%): ${formatCurrency(inc * 0.2)}</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-debt',
    calculate: (form, resPanel) => {
      const bal = getValForm(form, 'balance');
      const a = getValForm(form, 'apr') / 100 / 12;
      const p = getValForm(form, 'pmt');

      if (p <= bal * a) {
        resPanel.innerHTML = `<div class="result-value">Payment too low</div><div class="result-secondary">Interest exceeds payment</div>`;
        return;
      }

      const months = Math.log(p / (p - bal * a)) / Math.log(1 + a);

      resPanel.innerHTML = `
        <div class="result-value">${Math.ceil(months)} Months</div>
        <div class="result-secondary">Total Paid: ${formatCurrency(Math.ceil(months) * p)}</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-breakeven',
    calculate: (form, resPanel) => {
      const fixed = getValForm(form, 'fixed');
      const price = getValForm(form, 'price');
      const varCost = getValForm(form, 'var_cost');

      const margin = price - varCost;
      const units = margin > 0 ? Math.ceil(fixed / margin) : 0;

      resPanel.innerHTML = margin > 0
        ? `<div class="result-value">${units} Units</div><div class="result-secondary">Break-even Revenue: ${formatCurrency(units * price)}</div>`
        : `<div class="result-value">Unprofitable</div>`;
    }
  });

  initCalcExtra({
    id: 'form-profit',
    calculate: (form, resPanel) => {
      const rev = getValForm(form, 'revenue');
      const cogs = getValForm(form, 'cogs');
      const exp = getValForm(form, 'expenses');

      const gross = rev - cogs;
      const net = gross - exp;
      const grossPct = rev > 0 ? gross / rev : 0;
      const netPct = rev > 0 ? net / rev : 0;

      resPanel.innerHTML = `
        <div class="result-value">Net Profit: ${formatCurrency(net)}</div>
        <div class="result-secondary">Gross Margin: ${(grossPct * 100).toFixed(2)}% | Net Margin: ${(netPct * 100).toFixed(2)}%</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-sales-tax',
    calculate: (form, resPanel) => {
      const price = getValForm(form, 'price');
      const t = getValForm(form, 'tax') / 100;
      const m = form.querySelector('#mode').value;

      let taxAmt, total;
      if (m === 'add') {
        taxAmt = price * t;
        total = price + taxAmt;
      } else {
        total = price;
        taxAmt = price - (price / (1 + t));
      }

      resPanel.innerHTML = `
        <div class="result-value">Tax: ${formatCurrency(taxAmt)}</div>
        <div class="result-secondary">${m === 'add' ? 'Total (Inc. Tax)' : 'Net Price'}: ${formatCurrency(m === 'add' ? total : price - taxAmt)}</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-hourly',
    calculate: (form, resPanel) => {
      const inc = getValForm(form, 'income');
      const exp = getValForm(form, 'expenses');
      const hours = getValForm(form, 'hours');
      const weeks = getValForm(form, 'weeks');
      const buffer = getValForm(form, 'buffer') / 100;

      const totalNeeded = (inc + exp) / (1 - buffer);
      const totalHours = hours * weeks;
      const rate = totalHours > 0 ? totalNeeded / totalHours : 0;

      resPanel.innerHTML = `
        <div class="result-value">${formatCurrency(rate)} / hour</div>
        <div class="result-secondary">Gross revenue needed: ${formatCurrency(totalNeeded)}</div>
      `;
    }
  });

});
