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

  initCalcExtra({
    id: 'form-compound',
    calculate: (form, resPanel) => {
      const principal = getValForm(form, 'principal');
      const monthly = getValForm(form, 'monthly');
      const rate = getValForm(form, 'rate') / 100;
      const years = getValForm(form, 'years');

      const n = 12; // Monthly compound
      const t = years;

      let balance = principal * Math.pow(1 + rate / n, n * t);
      let futureValSeries = rate > 0 ? (monthly * (Math.pow(1 + rate / n, n * t) - 1)) / (rate / n) : (monthly * n * t);
      const totalBalance = balance + futureValSeries;

      const totalContr = monthly * 12 * years;
      const interestEarned = totalBalance - principal - totalContr;

      resPanel.innerHTML = `
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
      const solveFor = form.querySelector('#solve_for').value;
      const pmtInput = form.querySelector('#pmt');
      const amtInput = form.querySelector('#amount');
      const termInput = form.querySelector('#term');

      [pmtInput, amtInput, termInput].forEach(el => {
        el.disabled = false;
        el.parentElement.style.opacity = '1';
      });

      let pmt = getValForm(form, 'pmt');
      let amt = getValForm(form, 'amount');
      let term = getValForm(form, 'term');
      let r = getValForm(form, 'apr') / 100 / 12;

      let resultText = '';
      let secondaryText = '';

      if (solveFor === 'pmt') {
        pmtInput.disabled = true; pmtInput.parentElement.style.opacity = '0.5';
        pmt = r > 0 ? (amt * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1) : (amt / term);
        if (!isNaN(pmt) && isFinite(pmt)) pmtInput.value = pmt.toFixed(2);
        const totalPaid = pmt * term;
        resultText = `Monthly Payment: ${formatCurrency(pmt)}`;
        secondaryText = `Total Interest: ${formatCurrency(totalPaid - amt)} | Total Paid: ${formatCurrency(totalPaid)}`;
      } else if (solveFor === 'amount') {
        amtInput.disabled = true; amtInput.parentElement.style.opacity = '0.5';
        amt = r > 0 ? pmt * (1 - Math.pow(1 + r, -term)) / r : pmt * term;
        if (!isNaN(amt) && isFinite(amt)) amtInput.value = amt.toFixed(2);
        const totalPaid = pmt * term;
        resultText = `Max Loan Amount: ${formatCurrency(amt)}`;
        secondaryText = `Total Interest: ${formatCurrency(totalPaid - amt)}`;
      } else if (solveFor === 'term') {
        termInput.disabled = true; termInput.parentElement.style.opacity = '0.5';
        if (pmt <= amt * r) {
          resultText = `Payment Too Low`;
          secondaryText = `Interest exceeds monthly payment`;
          termInput.value = '';
        } else {
          term = r > 0 ? Math.log(pmt / (pmt - amt * r)) / Math.log(1 + r) : amt / pmt;
          if (!isNaN(term) && isFinite(term)) termInput.value = term.toFixed(0);
          const totalPaid = pmt * term;
          resultText = `Term: ${Math.ceil(term)} Months`;
          secondaryText = `Total Interest Paid: ${formatCurrency(totalPaid - amt)}`;
        }
      }

      resPanel.innerHTML = `
        <div class="result-value" style="font-size: 2rem;">${resultText}</div>
        <div class="result-secondary">${secondaryText}</div>
      `;
    }
  });

  initCalcExtra({
    id: 'form-mortgage',
    calculate: (form, resPanel) => {
      const solveFor = form.querySelector('#solve_for').value;
      const priceInput = form.querySelector('#price');
      const targetInput = form.querySelector('#target_pmt');

      [priceInput, targetInput].forEach(el => {
        el.disabled = false;
        el.parentElement.style.opacity = '1';
      });

      const down = getValForm(form, 'down');
      const apr = getValForm(form, 'apr') / 100;
      const years = getValForm(form, 'years');
      const tax = getValForm(form, 'tax') / 12;
      const ins = getValForm(form, 'insurance') / 12;
      const r = apr / 12;
      const n = years * 12;

      if (solveFor === 'pmt') {
        targetInput.disabled = true; targetInput.parentElement.style.opacity = '0.5';
        const price = getValForm(form, 'price');
        const p = price - down;
        const pmt = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : (p / n);
        const total = pmt + tax + ins;
        if (!isNaN(total) && isFinite(total)) targetInput.value = total.toFixed(2);
        resPanel.innerHTML = `
          <div class="result-value">Monthly: ${formatCurrency(total)}</div>
          <div class="result-secondary">P&I: ${formatCurrency(pmt)} | Tax/Ins: ${formatCurrency(tax + ins)}</div>
        `;
      } else {
        priceInput.disabled = true; priceInput.parentElement.style.opacity = '0.5';
        const targetPmt = getValForm(form, 'target_pmt');
        const availableForPI = targetPmt - tax - ins;
        let p = 0;
        if (availableForPI > 0) {
          p = r > 0 ? availableForPI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)) : availableForPI * n;
        }
        const maxPrice = p + down;
        if (!isNaN(maxPrice) && isFinite(maxPrice)) priceInput.value = maxPrice.toFixed(2);
        resPanel.innerHTML = `
          <div class="result-value">Affordable: ${formatCurrency(maxPrice)}</div>
          <div class="result-secondary">Loan Amount: ${formatCurrency(p)} | Down: ${formatCurrency(down)}</div>
        `;
      }
    }
  });

  initCalcExtra({
    id: 'form-savings-goal',
    calculate: (form, resPanel) => {
      const solveFor = form.querySelector('#solve_for').value;
      const currentInput = form.querySelector('#current');
      const mInput = form.querySelector('#monthly');
      const targetInput = form.querySelector('#target');
      const yearsInput = form.querySelector('#years');

      [currentInput, mInput, targetInput, yearsInput].forEach(el => {
        el.disabled = false;
        el.parentElement.style.opacity = '1';
      });

      const rate = getValForm(form, 'rate') / 100 / 12;
      let current = getValForm(form, 'current');
      let monthly = getValForm(form, 'monthly');
      let target = getValForm(form, 'target');
      let years = getValForm(form, 'years');
      let months = years * 12;

      if (solveFor === 'time') {
        yearsInput.disabled = true; yearsInput.parentElement.style.opacity = '0.5';
        let mCount = 0;
        let temp = current;
        if (monthly <= 0 && temp < target && rate <= 0) mCount = -1;
        else {
          while (temp < target && mCount < 1200) {
            temp += temp * rate + monthly;
            mCount++;
          }
        }
        if (mCount >= 0) {
          yearsInput.value = (mCount / 12).toFixed(1);
          resPanel.innerHTML = `<div class="result-value">${mCount} Months</div><div class="result-secondary">~ ${(mCount / 12).toFixed(1)} years</div>`;
        } else {
          resPanel.innerHTML = `<div class="result-value">Unreachable</div>`;
        }
      } else if (solveFor === 'monthly') {
        mInput.disabled = true; mInput.parentElement.style.opacity = '0.5';
        const factor = Math.pow(1 + rate, months);
        if (rate > 0) {
          monthly = (target - current * factor) * rate / (factor - 1);
        } else {
          monthly = (target - current) / months;
        }
        if (!isNaN(monthly) && isFinite(monthly)) mInput.value = monthly.toFixed(2);
        resPanel.innerHTML = `<div class="result-value">${formatCurrency(monthly)} / mo</div><div class="result-secondary">For ${years} years</div>`;
      } else if (solveFor === 'initial') {
        currentInput.disabled = true; currentInput.parentElement.style.opacity = '0.5';
        const factor = Math.pow(1 + rate, months);
        let series = rate > 0 ? (monthly * (factor - 1)) / rate : (monthly * months);
        current = (target - series) / factor;
        if (!isNaN(current) && isFinite(current)) currentInput.value = current.toFixed(2);
        resPanel.innerHTML = `<div class="result-value">${formatCurrency(current)} Initial</div><div class="result-secondary">Then ${formatCurrency(monthly)} / mo</div>`;
      }
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
      const solveFor = form.querySelector('#solve_for').value;
      const amtInput = form.querySelector('#amount');
      const r = getValForm(form, 'rate') / 100;
      const y = getValForm(form, 'years');
      const amt = getValForm(form, 'amount');

      if (solveFor === 'future') {
        const future = amt * Math.pow(1 + r, y);
        resPanel.innerHTML = `
          <div class="result-value">${formatCurrency(future)}</div>
          <div class="result-secondary">Purchasing power of ${formatCurrency(amt)} in ${y} years</div>
        `;
      } else {
        const past = amt / Math.pow(1 + r, y);
        resPanel.innerHTML = `
          <div class="result-value">${formatCurrency(past)}</div>
          <div class="result-secondary">Purchasing power of ${formatCurrency(amt)} ${y} years ago</div>
        `;
      }
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
      const budget = getValForm(form, 'budget');
      const strategy = form.querySelector('#strategy').value;
      const rows = form.querySelectorAll('.debt-row');

      let debts = [];
      rows.forEach(row => {
        const name = row.querySelector('.debt-name').value || 'Debt';
        const bal = parseFloat(row.querySelector('.debt-balance').value) || 0;
        const apr = parseFloat(row.querySelector('.debt-apr').value) || 0;
        if (bal > 0) debts.push({ name, bal, apr });
      });

      if (debts.length === 0) {
        resPanel.innerHTML = '<div class="result-value">-</div><div class="result-secondary">Add some debts to begin</div>';
        return;
      }

      // Sort based on strategy
      if (strategy === 'avalanche') debts.sort((a, b) => b.apr - a.apr);
      else debts.sort((a, b) => a.bal - b.bal);

      let totalMonths = 0;
      let totalInterest = 0;
      let currentDebts = debts.map(d => ({ ...d }));

      while (currentDebts.some(d => d.bal > 0) && totalMonths < 600) {
        let remainingBudget = budget;

        // Pay interest first on all
        currentDebts.forEach(d => {
          const interest = d.bal * (d.apr / 100 / 12);
          d.bal += interest;
          totalInterest += interest;
        });

        // Apply budget
        for (let d of currentDebts) {
          if (d.bal > 0) {
            const pay = Math.min(d.bal, remainingBudget);
            d.bal -= pay;
            remainingBudget -= pay;
          }
        }

        if (remainingBudget === budget) {
          resPanel.innerHTML = '<div class="result-value">Budget Too Low</div><div class="result-secondary">Interest exceeds monthly budget</div>';
          return;
        }
        totalMonths++;
      }

      resPanel.innerHTML = `
        <div class="result-value">${totalMonths} Months</div>
        <div class="result-secondary">Total Interest: ${formatCurrency(totalInterest)} | Debt-Free: ${totalMonths} mo</div>
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
      const solveFor = form.querySelector('#solve_for').value;
      const incInput = form.querySelector('#income');
      const rateInput = form.querySelector('#rate');

      [incInput, rateInput].forEach(el => {
        el.disabled = false;
        el.parentElement.style.opacity = '1';
      });

      const exp = getValForm(form, 'expenses');
      const hours = getValForm(form, 'hours');
      const weeks = getValForm(form, 'weeks');
      const buffer = getValForm(form, 'buffer') / 100;
      const totalHours = hours * weeks;

      if (solveFor === 'rate') {
        incInput.disabled = true; incInput.parentElement.style.opacity = '0.5';
        const inc = getValForm(form, 'income');
        const totalNeeded = (inc + exp) / (1 - buffer);
        const rate = totalHours > 0 ? totalNeeded / totalHours : 0;
        if (!isNaN(rate) && isFinite(rate)) rateInput.value = rate.toFixed(2);
        resPanel.innerHTML = `
          <div class="result-value">${formatCurrency(rate)} / hour</div>
          <div class="result-secondary">Gross Needed: ${formatCurrency(totalNeeded)}</div>
        `;
      } else {
        rateInput.disabled = true; rateInput.parentElement.style.opacity = '0.5';
        const rate = getValForm(form, 'rate');
        const totalGross = rate * totalHours;
        const netAfterExp = totalGross * (1 - buffer) - exp;
        if (!isNaN(netAfterExp) && isFinite(netAfterExp)) incInput.value = netAfterExp.toFixed(2);
        resPanel.innerHTML = `
          <div class="result-value">${formatCurrency(netAfterExp)} Net</div>
          <div class="result-secondary">Gross Revenue: ${formatCurrency(totalGross)}</div>
        `;
      }
    }
  });

  // Global Add Debt Logic
  const addDebtBtn = document.getElementById('add-debt-btn');
  if (addDebtBtn) {
    addDebtBtn.addEventListener('click', () => {
      const list = document.getElementById('debt-list');
      const row = document.createElement('div');
      row.className = 'debt-row';
      row.style = 'display:grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.5rem;';
      row.innerHTML = `
        <input type="text" class="debt-name" placeholder="Debt Name">
        <input type="number" class="debt-balance" placeholder="0">
        <input type="number" class="debt-apr" placeholder="0">
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove(); document.getElementById('form-debt').dispatchEvent(new Event('input'))">×</button>
      `;
      list.appendChild(row);

      // Trigger update on input
      row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
          document.getElementById('form-debt').dispatchEvent(new Event('input'));
        });
      });
    });
  }

});
