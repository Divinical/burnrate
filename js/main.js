// BURNRATE TOOL v1.0 — FINAL PATCHED VERSION

// === INITIAL SETUP ===
let currentCurrency = localStorage.getItem('currency') || '£';

function updateCurrencySpans() {
  document.querySelectorAll('.currency-symbol').forEach(span => {
    span.textContent = currentCurrency;
  });
}

function updateResultCurrency() {
  const txt = resultBox.textContent;
  if (txt.match(/[£$€¥]/g)) {
    resultBox.textContent = txt.replace(/[£$€¥]/g, currentCurrency);
  }
}

const currencySelector = document.getElementById('currencySelector');
currencySelector.value = currentCurrency;
currencySelector.addEventListener('change', () => {
  currentCurrency = currencySelector.value;
  localStorage.setItem('currency', currentCurrency);
  updateLiveTotal();
  updateCurrencySpans();
  updateResultCurrency();
});

function updatePlaceholders() {
  document.getElementById('income').placeholder = `0.00`;
  document.getElementById('expenses').placeholder = `0.00`;
  document.querySelectorAll('.custom-expense').forEach(input => input.placeholder = `0.00`);
}

const toggleExtrasBtn = document.getElementById('toggleExtras');
const extraSection = document.getElementById('extra-section');
toggleExtrasBtn.addEventListener('click', () => {
  extraSection.classList.toggle('hidden');

  const hasExpenses = customInputsContainer.children.length > 0;
  const isVisible = !extraSection.classList.contains('hidden');

  toggleExtrasBtn.textContent = isVisible
    ? (hasExpenses ? 'Hide Optional Expenses' : 'Add Optional Expenses')
    : (hasExpenses ? 'View Optional Expenses' : '+ Add Optional Expenses');
});
// === TOGGLE CUSTOM INCOME SECTION ===
const toggleIncomeBtn = document.getElementById('toggleIncome');
const extraIncomeSection = document.getElementById('extra-income-section');
toggleIncomeBtn.addEventListener('click', () => {
  extraIncomeSection.classList.toggle('hidden');
});

let customCount = 0;
const addCustomBtn = document.getElementById('addCustom');
const customInputsContainer = document.getElementById('custom-inputs');

function addCustomInput(label = '', amount = '', recurrence = 'monthly') {
  customCount++;
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-2 group';

  wrapper.innerHTML = `
    <input type="text" maxlength="25" class="custom-label w-full rounded-md bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Label e.g. Spotify" value="${label}" />
    <div class="relative">
      <span class="currency-symbol absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-zinc-400">${currentCurrency}</span>
      <input type="number" class="custom-expense pl-7 w-full rounded-md bg-zinc-800 border border-zinc-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="00.00" value="${amount}" />
      <button class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500 hover:text-red-400 delete-expense" title="Remove">✕</button>
    </div>
    <select class="recurrence w-full bg-zinc-800 border border-zinc-700 text-sm text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500">
      <option value="monthly" ${recurrence === 'monthly' ? 'selected' : ''}>Monthly</option>
      <option value="weekly" ${recurrence === 'weekly' ? 'selected' : ''}>Weekly</option>
      <option value="daily" ${recurrence === 'daily' ? 'selected' : ''}>Daily</option>
    </select>
    <div class="monthly-breakdown text-xs text-zinc-400 mt-1"></div>
  `;

  customInputsContainer.appendChild(wrapper);

  const expenseInput = wrapper.querySelector('.custom-expense');
  const recurrenceSelect = wrapper.querySelector('.recurrence');
  const deleteBtn = wrapper.querySelector('.delete-expense');

  expenseInput.addEventListener('input', updateLiveTotal);
  recurrenceSelect.addEventListener('change', updateLiveTotal);
  deleteBtn.addEventListener('click', () => {
    wrapper.remove();
    updateLiveTotal();
  });

  updateLiveTotal();
}


addCustomBtn.addEventListener('click', () => addCustomInput());
let incomeCount = 0;
const addIncomeBtn = document.getElementById('addCustomIncome');
const customIncomeContainer = document.getElementById('custom-income-inputs');

function addCustomIncome(label = '', amount = '', recurrence = 'monthly') {
  incomeCount++;
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-2 group';

  wrapper.innerHTML = `
    <input type="text" maxlength="25" class="custom-income-label w-full rounded-md bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-white" placeholder="Label e.g. Freelance Logo" value="${label}" />
    <div class="relative">
      <span class="currency-symbol absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-zinc-400">${currentCurrency}</span>
      <input type="number" class="custom-income pl-7 w-full rounded-md bg-zinc-800 border border-zinc-700 px-4 py-2 text-white" placeholder="00.00" value="${amount}" />
      <button class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500 hover:text-red-400 delete-income" title="Remove">✕</button>
    </div>
    <select class="income-recurrence w-full bg-zinc-800 border border-zinc-700 text-sm text-white rounded-md py-2 px-3">
      <option value="monthly" ${recurrence === 'monthly' ? 'selected' : ''}>Monthly</option>
      <option value="weekly" ${recurrence === 'weekly' ? 'selected' : ''}>Weekly</option>
      <option value="once" ${recurrence === 'once' ? 'selected' : ''}>One-time</option>
    </select>
  `;

  customIncomeContainer.appendChild(wrapper);

  wrapper.querySelector('.delete-income').addEventListener('click', () => {
    wrapper.remove();
    updateLiveTotal();
  });

  wrapper.querySelector('.custom-income').addEventListener('input', updateLiveTotal);
  wrapper.querySelector('.income-recurrence').addEventListener('change', updateLiveTotal);
}

addIncomeBtn.addEventListener('click', () => addCustomIncome());

const incomeInput = document.getElementById('income');
const essentialsInput = document.getElementById('expenses');
const totalBox = document.createElement('div');
totalBox.className = 'text-center text-sm text-amber-400 mt-2 drop-shadow-[0_0_6px_rgba(255,193,7,0.4)]';
totalBox.id = 'liveTotalBox';
document.querySelector('main').appendChild(totalBox);

function updateLiveTotal() {
    let extraIncome = 0;

document.querySelectorAll('#custom-income-inputs .group').forEach(group => {
  const val = parseFloat(group.querySelector('.custom-income')?.value || 0);
  const recurrence = group.querySelector('.income-recurrence')?.value || 'monthly';

  if (!isNaN(val)) {
    let adjusted = val;
    if (recurrence === 'weekly') adjusted *= 4;
    if (recurrence === 'once') adjusted = val;
    extraIncome += adjusted;
  }
});
  const groups = document.querySelectorAll('.group');
  let optionalTotal = 0;

  groups.forEach(group => {
    const input = group.querySelector('.custom-expense');
    const recurrence = group.querySelector('.recurrence')?.value || 'monthly';
    const val = parseFloat(input?.value);
    const breakdown = group.querySelector('.monthly-breakdown');

    if (!isNaN(val)) {
      let monthlyEquivalent = val;
      if (recurrence === 'weekly') monthlyEquivalent *= 4;
      if (recurrence === 'daily') monthlyEquivalent *= 30;
      optionalTotal += monthlyEquivalent;
      if (breakdown) breakdown.textContent = `${currentCurrency}${val.toFixed(2)} / ${recurrence} → ${currentCurrency}${monthlyEquivalent.toFixed(2)} / month`;
    } else if (breakdown) {
      breakdown.textContent = '';
    }
  });

const essentials = parseFloat(essentialsInput.value) || 0;
const total = essentials + optionalTotal;
const effectiveIncome = (parseFloat(incomeInput.value) || 0) + extraIncome;
  totalBox.textContent = `Live Total Expenses: ${currentCurrency}${total.toFixed(2)} | Income: ${currentCurrency}${effectiveIncome.toFixed(2)}`;
  totalBox.classList.add("animate-pulse");
setTimeout(() => totalBox.classList.remove("animate-pulse"), 1000);
}

const calculateBtn = document.getElementById('calculate');
const resultBox = document.getElementById('result');

function getOptionalExpenses() {
  const groups = document.querySelectorAll('.group');
  return Array.from(groups).map(group => {
    return {
      amount: parseFloat(group.querySelector('.custom-expense')?.value || 0),
      recurrence: group.querySelector('.recurrence')?.value || 'monthly'
    };
  });
}

function calculateMonthlyTotal(expenses) {
  return expenses.reduce((acc, item) => {
    let val = item.amount;
    if (item.recurrence === 'weekly') val *= 4;
    if (item.recurrence === 'daily') val *= 30;
    return acc + val;
  }, 0);
}
function getSurvivalStatus(days) {
  if (days >= 90) return { label: "🔥 Healthy", color: "bg-green-800 text-green-200" };
  if (days >= 30) return { label: "⚠️ Warning", color: "bg-yellow-800 text-yellow-200" };
  return { label: "💀 Unsustainable", color: "bg-red-800 text-red-200" };
}

function updateResults(survivalDays, essentialsTotal, optionalTotal) {
  const totalMonthly = essentialsTotal + optionalTotal;
  const status = getSurvivalStatus(survivalDays);

  if (isNaN(survivalDays) || survivalDays <= 0) {
    resultBox.innerHTML = '';
    return;
  }
  resultBox.classList.remove('hidden');
  resultBox.innerHTML = `
    <div class="p-4 border border-amber-500/10 bg-zinc-900 text-sm space-y-3 rounded-xl shadow-inner shadow-amber-500/5 transition-all duration-500 transform translate-y-4 opacity-0" id="resultContent">
      <div class="text-xl font-bold">${currentCurrency}${totalMonthly.toFixed(2)} total burn / month</div>
      <div>🧾 <strong>Essentials:</strong> ${currentCurrency}${essentialsTotal.toFixed(2)}<br>
           💡 <strong>Optional:</strong> ${currentCurrency}${optionalTotal.toFixed(2)}</div>
      <div class="mt-2 text-lg">🕒 You can survive <strong>${Math.floor(survivalDays)}</strong> more days.</div>
      <span class="inline-block px-2 py-1 mt-2 rounded text-xs font-semibold ${status.color} shadow-md shadow-${status.color.split(' ')[0]}/50">
    </div>
  `;

  requestAnimationFrame(() => {
    const content = document.getElementById("resultContent");
    if (content) content.classList.remove("opacity-0");
  });
}

calculateBtn.addEventListener('click', () => {
  const income = parseFloat(incomeInput.value);
  const essentials = parseFloat(essentialsInput.value);
  const optionalExpenses = getOptionalExpenses();
  const optionalTotal = calculateMonthlyTotal(optionalExpenses);
  const totalExpenses = essentials + optionalTotal;

  if (isNaN(income) || isNaN(totalExpenses) || income <= 0) {
    resultBox.textContent = "Please enter valid numbers.";
    resultBox.classList.remove("hidden");
    resultBox.classList.replace("text-emerald-400", "text-red-500");
    return;
  }

  const survivalDays = (income / totalExpenses) * 30;
  updateResults(survivalDays, essentials, optionalTotal);

  const inputs = {
    income,
    essentials,
    custom: Array.from(document.querySelectorAll('.group')).map(group => ({
      label: group.querySelector('.custom-label')?.value || '',
      amount: group.querySelector('.custom-expense')?.value || '',
      recurrence: group.querySelector('.recurrence')?.value || 'monthly'
    }))
  };
  localStorage.setItem('burnrateData', JSON.stringify(inputs));
});

// === RESTORE FROM LOCALSTORAGE ===
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const incomeParam = params.get('income');
  const essentialsParam = params.get('essentials');
  const customEncoded = params.get('custom');

  const isSnapshot = incomeParam || essentialsParam || customEncoded;

  // 🔗 STEP 1: Load from snapshot if present
  if (incomeParam) incomeInput.value = incomeParam;
  if (essentialsParam) essentialsInput.value = essentialsParam;

  if (customEncoded) {
    try {
      const decoded = JSON.parse(decodeURIComponent(customEncoded));
      decoded.forEach(entry => {
        addCustomInput(entry.label, entry.amount, entry.recurrence);
      });
    } catch (e) {
      console.warn("Invalid snapshot data");
    }
  }

  // 🔐 STEP 2: Only fallback to localStorage if not a snapshot
  if (!isSnapshot) {
    const saved = JSON.parse(localStorage.getItem('burnrateData'));
    if (saved) {
      incomeInput.value = saved.income || '';
      essentialsInput.value = saved.essentials || '';
      saved.custom?.forEach(entry => {
        addCustomInput(entry.label, entry.amount, entry.recurrence);
      });
    }
  }

  // ✅ STEP 3: Update UI regardless
  updateLiveTotal();

  if (customInputsContainer.children.length > 0) {
    toggleExtrasBtn.textContent = 'View Optional Expenses';
  }

  // 🧹 STEP 4: Clean the URL after snapshot is applied
  if (isSnapshot && window.history.replaceState) {
    const cleanURL = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanURL);
  }
});


// === CLEAR ALL BUTTON ===
const resetBtn = document.createElement('button');
resetBtn.id = 'resetAll';
resetBtn.textContent = '🗑️ Clear All';
resetBtn.className = 'mt-2 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition';
calculateBtn.insertAdjacentElement('afterend', resetBtn);

resetBtn.addEventListener('click', () => {
  localStorage.removeItem('burnrateData');
  location.reload();
});
// === PDF EXPORT (Enhanced) ===
document.getElementById('exportPDF').addEventListener('click', () => {
  const resultContent = document.getElementById('resultContent');
  if (!resultContent) {
    alert("Please calculate your BurnRate first.");
    return;
  }

  const timestamp = new Date().toLocaleString();

  const win = window.open('', '', 'width=850,height=1000');
  win.document.write(`
    <html>
      <head>
        <title>BurnRate Report</title>
        <style>
          body {
            font-family: sans-serif;
            padding: 40px;
            background: #1a1a1a;
            color: #fff;
          }
          h1 {
            font-size: 26px;
            color: #f97316;
            margin-bottom: 10px;
          }
          .section {
            background: #262626;
            padding: 16px;
            border-radius: 10px;
            margin-bottom: 20px;
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            margin-top: 10px;
          }
          .green { background: #166534; color: #bbf7d0; }
          .yellow { background: #78350f; color: #fde68a; }
          .red { background: #7f1d1d; color: #fecaca; }
          footer {
            font-size: 12px;
            color: #aaa;
            margin-top: 40px;
            text-align: center;
          }
          hr {
            border: none;
            border-top: 1px solid #444;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <h1>🔥 BurnRate Report</h1>

<div class="section">
  ${resultContent.innerHTML}

  <!-- Optional Expense Breakdown -->
  <div style="margin-top:20px;">
    <strong>Optional Expense Breakdown:</strong>
    <ul style="margin-top:10px; padding-left:20px; line-height:1.6;">
      ${Array.from(document.querySelectorAll('.group')).map(group => {
        const label = group.querySelector('.custom-label')?.value || 'Unnamed';
        const val = parseFloat(group.querySelector('.custom-expense')?.value) || 0;
        const recurrence = group.querySelector('.recurrence')?.value || 'monthly';

        let monthly = val;
        if (recurrence === 'weekly') monthly *= 4;
        if (recurrence === 'daily') monthly *= 30;

        return `<li>${label} — ${currentCurrency}${val.toFixed(2)} / ${recurrence} → <strong>${currentCurrency}${monthly.toFixed(2)}</strong> / month</li>`;
      }).join('')}
    </ul>
  </div>
</div>

        <hr />

        <p class="text-sm text-zinc-500">Generated: ${timestamp}</p>

        <footer>
          Built by BenWritesHUB · <a href="https://benwriteshub.gumroad.com" style="color:#f97316; text-decoration:none;">benwriteshub.gumroad.com</a>
        </footer>
      </body>
    </html>
  `);

  win.document.close();
  win.print();
});
// === SHAREABLE SNAPSHOT URL ===
document.getElementById('copySnapshot').addEventListener('click', () => {
  const income = incomeInput.value || '';
  const essentials = essentialsInput.value || '';

  const custom = Array.from(document.querySelectorAll('.group')).map(group => ({
    label: group.querySelector('.custom-label')?.value || '',
    amount: group.querySelector('.custom-expense')?.value || '',
    recurrence: group.querySelector('.recurrence')?.value || 'monthly'
  }));

  const params = new URLSearchParams({
  income,
  essentials,
  custom: JSON.stringify(custom)
});

  const url = `${location.origin}${location.pathname}?${params.toString()}`;
  navigator.clipboard.writeText(url)
    .then(() => alert("Snapshot link copied to clipboard!"))
    .catch(err => alert("Failed to copy link."));
});

