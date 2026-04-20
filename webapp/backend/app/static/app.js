const state = {
  authUi: {
    screen: 'login',
  },
  auth: {
    authenticated: false,
    username: null,
    role: null,
    customer_id: null,
    permissions: [],
  },
  tables: [],
  overview: null,
  dashboard: null,
  analytics: null,
  pageGuide: [
    {
      name: 'Dashboard',
      audience: 'Managers, reviewers, project presentation',
      purpose: 'Shows the core business overview of the SmartEats platform through KPI cards, order status charts, delivery status charts, and performance rankings.',
      points: [
        'Use this page to present platform scale and current operations at a glance.',
        'It is the best entry page for demonstrations because it summarizes the whole system quickly.',
        'It highlights customer volume, order volume, GMV, rider activity, and top performers.',
      ],
    },
    {
      name: 'No-Code Query',
      audience: 'Customer service staff, non-technical users, teachers',
      purpose: 'Allows users to browse database records without writing SQL by selecting a table, searching, filtering, sorting, and paging through rows.',
      points: [
        'Use this page to demonstrate how non-programmers can explore business data safely.',
        'It is suitable for searching customers, orders, stores, riders, and other operational entities.',
        'This page is the main proof that the system supports no-code data access.',
      ],
    },
    {
      name: 'CRUD Studio',
      audience: 'Administrators, system maintainers, project evaluators',
      purpose: 'Provides guided create, update, and delete workflows driven by live schema metadata so users can manage records from forms instead of SQL tools.',
      points: [
        'Use this page to show that the system is not read-only and supports business maintenance operations.',
        'It dynamically builds key fields and value fields based on the selected table.',
        'This is the page that demonstrates insertion, modification, and deletion capability.',
      ],
    },
    {
      name: 'Schema Explorer',
      audience: 'Database learners, reviewers, developers',
      purpose: 'Displays exposed table names, columns, types, primary keys, and searchable fields using live backend metadata.',
      points: [
        'Use this page to explain the relational schema design behind the web system.',
        'It is especially useful during database project presentations and ER-model discussion.',
        'This page connects the frontend experience back to the database structure.',
      ],
    },
    {
      name: 'AI Assistant',
      audience: 'Analysts, presenters, anyone who prefers natural language over SQL',
      purpose: 'Optional LLM that calls a server-side read-only SQL tool so you can ask business questions in plain language.',
      points: [
        'Requires SMARTEATS_OPENAI_API_KEY (or another OpenAI-compatible endpoint) in the backend .env file.',
        'The model never receives raw passwords; sensitive fields stay masked like the rest of the app.',
        'Use it to demo “database + LLM” integration without giving the model write access.',
      ],
    },
    {
      name: 'Feature Manual',
      audience: 'All users, teachers, judges',
      purpose: 'Lists the implemented capabilities of the SmartEats web application in one place so visitors can understand the full project scope.',
      points: [
        'Use this page as a quick feature checklist during demonstrations or documentation review.',
        'It summarizes both frontend-visible functions and backend-powered capabilities.',
        'It helps explain what the system can do without navigating every page in detail first.',
      ],
    },
    {
      name: 'Page Guide',
      audience: 'First-time visitors and assessors',
      purpose: 'Explains what every page is for, which audience should use it, and how it fits into the overall SmartEats workflow.',
      points: [
        'Use this page when someone needs a guided tour of the web application.',
        'It reduces confusion and makes the navigation self-explanatory.',
        'This page ensures no part of the site lacks a clear description of its role.',
      ],
    },
  ],
  query: {
    table: null,
    page: 1,
    pageSize: 15,
    search: '',
    sortBy: null,
    sortDirection: 'asc',
    filters: [],
    lastResult: null,
  },
  crud: {
    table: null,
    action: 'create',
  },
  agent: {
    messages: [],
  },
  agentLlm: null,
};

const els = {
  authOverlay: document.getElementById('auth-overlay'),
  authLoginView: document.getElementById('auth-login-view'),
  authRegisterView: document.getElementById('auth-register-view'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  loginBtn: document.getElementById('login-btn'),
  showRegisterBtn: document.getElementById('show-register-btn'),
  showLoginBtn: document.getElementById('show-login-btn'),
  registerUsername: document.getElementById('register-username'),
  registerPhone: document.getElementById('register-phone'),
  registerPassword: document.getElementById('register-password'),
  registerBtn: document.getElementById('register-btn'),
  loginMessage: document.getElementById('login-message'),
  registerMessage: document.getElementById('register-message'),
  healthPill: document.getElementById('health-pill'),
  currentUser: document.getElementById('current-user'),
  logoutBtn: document.getElementById('logout-btn'),
  refreshAllBtn: document.getElementById('refresh-all-btn'),
  kpiGrid: document.getElementById('kpi-grid'),
  orderStatusChart: document.getElementById('order-status-chart'),
  deliveryStatusChart: document.getElementById('delivery-status-chart'),
  topDishesTable: document.getElementById('top-dishes-table'),
  riderPerformanceTable: document.getElementById('rider-performance-table'),
  queryTable: document.getElementById('query-table'),
  querySearch: document.getElementById('query-search'),
  querySort: document.getElementById('query-sort'),
  queryDirection: document.getElementById('query-direction'),
  queryPageSize: document.getElementById('query-page-size'),
  filterField: document.getElementById('filter-field'),
  filterOperator: document.getElementById('filter-operator'),
  filterValue: document.getElementById('filter-value'),
  addFilterBtn: document.getElementById('add-filter-btn'),
  clearFiltersBtn: document.getElementById('clear-filters-btn'),
  activeFilters: document.getElementById('active-filters'),
  runQueryBtn: document.getElementById('run-query-btn'),
  queryMeta: document.getElementById('query-meta'),
  prevPageBtn: document.getElementById('prev-page-btn'),
  nextPageBtn: document.getElementById('next-page-btn'),
  queryResults: document.getElementById('query-results'),
  crudTable: document.getElementById('crud-table'),
  crudAction: document.getElementById('crud-action'),
  crudKeyFields: document.getElementById('crud-key-fields'),
  crudValueFields: document.getElementById('crud-value-fields'),
  runMutationBtn: document.getElementById('run-mutation-btn'),
  mutationResult: document.getElementById('mutation-result'),
  schemaGrid: document.getElementById('schema-grid'),
  manualList: document.getElementById('manual-list'),
  pageGuide: document.getElementById('page-guide'),
  agentStatusBanner: document.getElementById('agent-status-banner'),
  agentThread: document.getElementById('agent-thread'),
  agentInput: document.getElementById('agent-input'),
  agentSendBtn: document.getElementById('agent-send-btn'),
  agentClearBtn: document.getElementById('agent-clear-btn'),
  toast: document.getElementById('toast'),
};

const recordsNavButton = document.querySelector('.nav-item[data-view="records"]');

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(detail.detail || 'Request failed');
  }
  return response.json();
}

function showView(viewName) {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === viewName));
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === `view-${viewName}`));
}

function applyRolePermissions() {
  const isAdmin = state.auth.role === 'admin';
  recordsNavButton.style.display = isAdmin ? '' : 'none';
  els.runMutationBtn.disabled = !isAdmin;
  if (!isAdmin) {
    els.mutationResult.textContent = 'Only the administrator can create, update, or delete records.';
    if (document.getElementById('view-records').classList.contains('active')) {
      showView('dashboard');
    }
  }
}

function setAuthMessage(screen, message, isError = false) {
  const target = screen === 'register' ? els.registerMessage : els.loginMessage;
  target.textContent = message;
  target.classList.toggle('error', isError);
}

function showAuthScreen(screen) {
  state.authUi.screen = screen;
  els.authLoginView.classList.toggle('active', screen === 'login');
  els.authRegisterView.classList.toggle('active', screen === 'register');
}

function syncAuthUi() {
  if (state.auth.authenticated) {
    els.authOverlay.classList.add('hidden');
    els.currentUser.textContent = `${state.auth.username} · ${state.auth.role}`;
    els.logoutBtn.style.display = '';
    applyRolePermissions();
    return;
  }
  els.authOverlay.classList.remove('hidden');
  showAuthScreen('login');
  els.currentUser.textContent = 'Not signed in';
  els.logoutBtn.style.display = 'none';
  recordsNavButton.style.display = 'none';
}

async function loadAuthState() {
  state.auth = await api('/api/auth/me');
  syncAuthUi();
  return state.auth;
}

async function handleLogin() {
  const username = els.loginUsername.value.trim();
  const password = els.loginPassword.value;
  if (!username || !password) {
    setAuthMessage('login', 'Username and password are required.', true);
    return;
  }
  try {
    const result = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    state.auth = result;
    els.loginPassword.value = '';
    setAuthMessage('login', 'Sign-in successful.');
    syncAuthUi();
    await bootstrapData();
  } catch (error) {
    setAuthMessage('login', error.message, true);
  }
}

async function handleRegister() {
  const username = els.registerUsername.value.trim();
  const phone = els.registerPhone.value.trim();
  const password = els.registerPassword.value;
  if (!username || !phone || !password) {
    setAuthMessage('register', 'Username, phone, and password are required for registration.', true);
    return;
  }
  try {
    await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, phone, password }),
    });
    els.registerUsername.value = '';
    els.registerPhone.value = '';
    els.registerPassword.value = '';
    els.loginUsername.value = username;
    els.loginPassword.value = '';
    showAuthScreen('login');
    setAuthMessage('login', 'Registration successful. Please sign in with your new account.');
  } catch (error) {
    setAuthMessage('register', error.message, true);
  }
}

async function handleLogout() {
  await api('/api/auth/logout', { method: 'POST' });
  state.auth = { authenticated: false, username: null, role: null, customer_id: null, permissions: [] };
  syncAuthUi();
  setAuthMessage('login', 'Sign in as the administrator or an existing registered user to continue.');
  showToast('Logged out');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderAgentStatusBanner() {
  if (!els.agentStatusBanner) return;
  const s = state.agentLlm;
  if (!s || !s.enabled) {
    els.agentStatusBanner.textContent =
      'LLM is disabled. Set SMARTEATS_OPENAI_API_KEY (and optionally SMARTEATS_OPENAI_BASE_URL / SMARTEATS_LLM_MODEL) in webapp/backend/.env, then restart the backend.';
    els.agentStatusBanner.className = 'notice-box agent-status error';
    return;
  }
  els.agentStatusBanner.textContent = `LLM ready · model ${s.model}`;
  els.agentStatusBanner.className = 'notice-box agent-status ok';
}

function renderAgentThread() {
  if (!els.agentThread) return;
  if (!state.agent.messages.length) {
    els.agentThread.innerHTML = `
      <div class="agent-empty">
        <span class="agent-empty__icon" aria-hidden="true">💬</span>
        <p>Ask about orders, riders, stores, dishes, or customers. The assistant runs <strong>read-only SQL</strong> on the server and never writes to the database.</p>
      </div>`;
    return;
  }
  els.agentThread.innerHTML = state.agent.messages.map((m) => {
    if (m.role === 'user') {
      return `<div class="agent-bubble user"><span class="bubble-label">You</span>${escapeHtml(m.content)}</div>`;
    }
    const steps = m.steps && m.steps.length
      ? `<div class="agent-steps">Tool trace${m.steps.map((st) => {
        const sql = st.sql_preview ? `<code>${escapeHtml(st.sql_preview)}</code>` : '';
        const ok = st.ok ? 'ok' : 'failed';
        return `<div>${escapeHtml(st.tool)} · ${ok}${sql}</div>`;
      }).join('')}</div>`
      : '';
    return `<div class="agent-bubble assistant"><span class="bubble-label">Assistant</span>${escapeHtml(m.reply || '')}${steps}</div>`;
  }).join('');
  els.agentThread.scrollTop = els.agentThread.scrollHeight;
}

async function loadAgentStatus() {
  try {
    state.agentLlm = await api('/api/agent/status');
  } catch {
    state.agentLlm = { enabled: false, model: '', base_url: '' };
  }
  renderAgentStatusBanner();
}

async function handleAgentSend() {
  const text = els.agentInput.value.trim();
  if (!text) {
    showToast('Enter a message first', true);
    return;
  }
  if (!state.agentLlm?.enabled) {
    showToast('LLM is not configured on the server', true);
    return;
  }
  state.agent.messages.push({ role: 'user', content: text });
  els.agentInput.value = '';
  renderAgentThread();
  els.agentSendBtn.disabled = true;
  const history = [];
  for (const m of state.agent.messages.slice(0, -1)) {
    if (m.role === 'user') history.push({ role: 'user', content: m.content });
    if (m.role === 'assistant') history.push({ role: 'assistant', content: m.reply || '' });
  }
  try {
    const data = await api('/api/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text, history }),
    });
    state.agent.messages.push({
      role: 'assistant',
      reply: data.reply || '',
      steps: data.steps || [],
    });
    renderAgentThread();
  } catch (error) {
    state.agent.messages.pop();
    showToast(error.message, true);
    renderAgentThread();
  } finally {
    els.agentSendBtn.disabled = false;
  }
}

function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.style.background = isError ? 'rgba(185, 28, 28, 0.95)' : 'rgba(34, 34, 34, 0.94)';
  els.toast.classList.add('show');
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => els.toast.classList.remove('show'), 2600);
}

function numberFormat(value) {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
  }
  return value;
}

function renderKpis(summary) {
  const cards = [
    ['Customers', summary.customers],
    ['Orders', summary.orders],
    ['Stores', summary.stores],
    ['Riders', summary.riders],
    ['GMV', summary.gmv],
    ['Avg Order Value', summary.avg_order_value],
    ['Active Deliveries', summary.active_deliveries],
    ['Completed Orders', summary.completed_orders],
  ];
  els.kpiGrid.innerHTML = cards.map(([label, value]) => `
    <div class="kpi-card">
      <span class="muted small">${label}</span>
      <strong>${numberFormat(value)}</strong>
    </div>
  `).join('');
}

function renderBarChart(container, rows, valueField = 'value', labelField = 'label') {
  if (!rows?.length) {
    container.innerHTML = '<p class="muted">No chart data available.</p>';
    return;
  }
  const max = Math.max(...rows.map((row) => Number(row[valueField]) || 0), 1);
  container.innerHTML = rows.map((row) => {
    const value = Number(row[valueField]) || 0;
    const width = Math.max(6, (value / max) * 100);
    return `
      <div class="chart-row">
        <div class="chart-meta"><span>${row[labelField]}</span><strong>${numberFormat(value)}</strong></div>
        <div class="chart-bar"><span style="width:${width}%"></span></div>
      </div>
    `;
  }).join('');
}

function renderTable(container, rows) {
  if (!rows?.length) {
    container.innerHTML = '<p class="muted">No rows returned.</p>';
    return;
  }
  const columns = Object.keys(rows[0]);
  const header = columns.map((column) => `<th>${column}</th>`).join('');
  const body = rows.map((row) => `<tr>${columns.map((column) => `<td>${row[column] ?? ''}</td>`).join('')}</tr>`).join('');
  container.innerHTML = `<table class="data-table"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
}

function populateTableSelect(selectEl, selected) {
  selectEl.innerHTML = state.tables.map((table) => `<option value="${table.name}">${table.label}</option>`).join('');
  if (selected) selectEl.value = selected;
}

function tableSchema(tableName) {
  return state.tables.find((table) => table.name === tableName);
}

function refreshQueryControls() {
  const schema = tableSchema(state.query.table);
  if (!schema) return;
  els.querySort.innerHTML = schema.columns.map((column) => `<option value="${column.name}">${column.name}</option>`).join('');
  els.filterField.innerHTML = schema.columns.map((column) => `<option value="${column.name}">${column.name}</option>`).join('');
  els.querySort.value = state.query.sortBy || schema.primary_keys[0] || schema.columns[0].name;
}

function renderActiveFilters() {
  if (!state.query.filters.length) {
    els.activeFilters.innerHTML = '<span class="muted small">No active filters</span>';
    return;
  }
  els.activeFilters.innerHTML = state.query.filters.map((filter, index) => `
    <div class="chip">
      <span>${filter.field} ${filter.operator} ${filter.value}</span>
      <button data-index="${index}" aria-label="Remove filter">×</button>
    </div>
  `).join('');
  [...els.activeFilters.querySelectorAll('button')].forEach((button) => {
    button.addEventListener('click', () => {
      state.query.filters.splice(Number(button.dataset.index), 1);
      renderActiveFilters();
    });
  });
}

async function loadQueryResults() {
  const payload = {
    page: state.query.page,
    page_size: state.query.pageSize,
    search: state.query.search,
    sort_by: state.query.sortBy,
    sort_direction: state.query.sortDirection,
    filters: state.query.filters,
  };
  const result = await api(`/api/query/${state.query.table}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  state.query.lastResult = result;
  els.queryMeta.textContent = `Showing page ${result.page} of ${result.total_pages} · ${result.total} rows total`;
  renderTable(els.queryResults, result.rows);
}

function buildFieldInputs(container, schema, primaryOnly, action) {
  const columns = primaryOnly ? schema.columns.filter((column) => schema.primary_keys.includes(column.name)) : schema.columns;
  container.innerHTML = columns.map((column) => {
    const disabled = action === 'delete' && !primaryOnly;
    const inputType = column.sensitive ? 'password' : 'text';
    return `
      <label>
        <span>${column.name}${column.primary_key ? ' · PK' : ''}</span>
        <input data-field="${column.name}" type="${inputType}" ${disabled ? 'disabled' : ''} placeholder="${column.type}">
      </label>
    `;
  }).join('');
}

function collectFields(container) {
  const values = {};
  [...container.querySelectorAll('input')].forEach((input) => {
    const value = input.value.trim();
    if (value !== '') values[input.dataset.field] = value;
  });
  return values;
}

function refreshCrudForm() {
  const schema = tableSchema(state.crud.table);
  if (!schema) return;
  buildFieldInputs(els.crudKeyFields, schema, true, state.crud.action);
  buildFieldInputs(els.crudValueFields, schema, false, state.crud.action);
  if (state.crud.action === 'delete') {
    els.crudValueFields.innerHTML = '<p class="muted small">Delete only needs the primary key fields above.</p>';
  }
}

function renderSchemaExplorer() {
  els.schemaGrid.innerHTML = state.tables.map((table) => `
    <article class="schema-card">
      <div>
        <p class="eyebrow">${table.name}</p>
        <h4>${table.label}</h4>
      </div>
      <p class="muted small">Primary keys: ${table.primary_keys.join(', ')}</p>
      <p class="muted small">Searchable columns: ${table.searchable_columns.join(', ')}</p>
      <div class="schema-columns">
        ${table.columns.map((column) => `
          <div class="schema-column">
            <strong>${column.name}</strong><br>
            <span class="muted small">${column.type} · ${column.nullable ? 'nullable' : 'required'}${column.primary_key ? ' · primary key' : ''}</span>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('');
}

function renderManual() {
  const staticFeatures = [
    'Animated dashboard with floating visual style and responsive layout',
    'Live connection status indicator for the backend service',
    'Global refresh to reload dashboard, metadata, and query state',
    'No-code search, filtering, sorting, and pagination across exposed tables',
    'CRUD form generation from live database schema metadata',
    'Schema explorer for presentation and database teaching use',
    'Optional AI assistant with read-only SQL tool calls (OpenAI-compatible API)',
    'Mobile-friendly interface suitable for demos and internet deployment',
    'Chart-ready analytics sections for order, delivery, dish, and rider performance',
    'Dedicated Page Guide screen explaining the purpose of every major page',
    'Administrator-only CRUD permissions with customer self-registration and sign-in',
  ];
  const dynamicFeatures = state.overview?.feature_manual || [];
  els.manualList.innerHTML = [...staticFeatures, ...dynamicFeatures]
    .map((item) => `<div class="schema-column">${item}</div>`)
    .join('');
}

function renderPageGuide() {
  els.pageGuide.innerHTML = state.pageGuide.map((page) => `
    <article class="guide-card">
      <div>
        <p class="eyebrow">${page.audience}</p>
        <h4>${page.name}</h4>
      </div>
      <p class="muted small">${page.purpose}</p>
      <div class="guide-points">
        ${page.points.map((point) => `<div class="guide-point">${point}</div>`).join('')}
      </div>
    </article>
  `).join('');
}

async function loadDashboard() {
  const [summary, analytics] = await Promise.all([
    api('/api/dashboard/summary'),
    api('/api/dashboard/analytics'),
  ]);
  state.dashboard = summary;
  state.analytics = analytics;
  renderKpis(summary);
  renderBarChart(els.orderStatusChart, analytics.order_status);
  renderBarChart(els.deliveryStatusChart, analytics.delivery_status);
  renderTable(els.topDishesTable, analytics.top_dishes);
  renderTable(els.riderPerformanceTable, analytics.rider_performance);
}

async function loadMeta() {
  const [tables, overview, health] = await Promise.all([
    api('/api/meta/tables'),
    api('/api/meta/overview'),
    api('/api/health'),
  ]);
  state.tables = tables;
  state.overview = overview;
  els.healthPill.textContent = `Backend OK · ${health.database}`;
  els.healthPill.className = 'status-pill status-pill--ok';
  if (!state.query.table) state.query.table = tables[0]?.name;
  if (!state.crud.table) state.crud.table = tables[0]?.name;
  populateTableSelect(els.queryTable, state.query.table);
  populateTableSelect(els.crudTable, state.crud.table);
  refreshQueryControls();
  renderActiveFilters();
  refreshCrudForm();
  renderSchemaExplorer();
  await loadAgentStatus();
  renderAgentThread();
  renderManual();
  renderPageGuide();
}

function attachNav() {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      showView(button.dataset.view);
    });
  });
}

function attachEvents() {
  els.loginBtn.addEventListener('click', handleLogin);
  els.registerBtn.addEventListener('click', handleRegister);
  els.showRegisterBtn.addEventListener('click', () => {
    showAuthScreen('register');
    setAuthMessage('register', 'Fill in all fields to create a new account.');
  });
  els.showLoginBtn.addEventListener('click', () => {
    showAuthScreen('login');
    setAuthMessage('login', 'Please sign in to continue.');
  });
  els.loginPassword.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  });
  els.registerPassword.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleRegister();
    }
  });
  els.logoutBtn.addEventListener('click', handleLogout);

  els.refreshAllBtn.addEventListener('click', async () => {
    await bootstrap();
    showToast('All data reloaded');
  });

  els.queryTable.addEventListener('change', () => {
    state.query.table = els.queryTable.value;
    state.query.page = 1;
    state.query.sortBy = null;
    refreshQueryControls();
  });

  els.querySearch.addEventListener('input', () => { state.query.search = els.querySearch.value; });
  els.querySort.addEventListener('change', () => { state.query.sortBy = els.querySort.value; });
  els.queryDirection.addEventListener('change', () => { state.query.sortDirection = els.queryDirection.value; });
  els.queryPageSize.addEventListener('change', () => { state.query.pageSize = Number(els.queryPageSize.value); state.query.page = 1; });

  els.addFilterBtn.addEventListener('click', () => {
    const field = els.filterField.value;
    const operator = els.filterOperator.value;
    const value = els.filterValue.value.trim();
    if (!field || value === '') {
      showToast('Filter needs both field and value', true);
      return;
    }
    state.query.filters.push({ field, operator, value });
    els.filterValue.value = '';
    renderActiveFilters();
  });

  els.clearFiltersBtn.addEventListener('click', () => {
    state.query.filters = [];
    renderActiveFilters();
  });

  els.runQueryBtn.addEventListener('click', async () => {
    state.query.page = 1;
    try {
      await loadQueryResults();
      showToast('Query executed');
    } catch (error) {
      showToast(error.message, true);
    }
  });

  els.prevPageBtn.addEventListener('click', async () => {
    if (state.query.page <= 1) return;
    state.query.page -= 1;
    try { await loadQueryResults(); } catch (error) { showToast(error.message, true); }
  });

  els.nextPageBtn.addEventListener('click', async () => {
    if (state.query.lastResult && state.query.page >= state.query.lastResult.total_pages) return;
    state.query.page += 1;
    try { await loadQueryResults(); } catch (error) { showToast(error.message, true); }
  });

  els.crudTable.addEventListener('change', () => {
    state.crud.table = els.crudTable.value;
    refreshCrudForm();
  });

  els.crudAction.addEventListener('change', () => {
    state.crud.action = els.crudAction.value;
    refreshCrudForm();
  });

  if (els.agentSendBtn) {
    els.agentSendBtn.addEventListener('click', () => handleAgentSend().catch(() => {}));
  }
  if (els.agentInput) {
    els.agentInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleAgentSend().catch(() => {});
      }
    });
  }
  if (els.agentClearBtn) {
    els.agentClearBtn.addEventListener('click', () => {
      state.agent.messages = [];
      renderAgentThread();
    });
  }

  els.runMutationBtn.addEventListener('click', async () => {
    if (state.auth.role !== 'admin') {
      showToast('Only admin accounts can modify data', true);
      return;
    }
    const keys = collectFields(els.crudKeyFields);
    const values = state.crud.action === 'delete' ? {} : collectFields(els.crudValueFields);
    const endpoint = `/api/admin/${state.crud.table}/${state.crud.action}`;
    try {
      const result = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify({ keys, values }),
      });
      els.mutationResult.textContent = result.message;
      showToast(result.message);
      if (state.query.table === state.crud.table) await loadQueryResults().catch(() => {});
      await loadDashboard();
    } catch (error) {
      els.mutationResult.textContent = error.message;
      showToast(error.message, true);
    }
  });
}

async function bootstrapData() {
  try {
    await loadMeta();
    await loadDashboard();
    await loadQueryResults();
  } catch (error) {
    if (String(error.message).includes('Authentication required') || String(error.message).includes('Insufficient permissions')) {
      state.auth = { authenticated: false, username: null, role: null, customer_id: null, permissions: [] };
      syncAuthUi();
      setAuthMessage('login', 'Your session expired. Please sign in again.', true);
      return;
    }
    els.healthPill.textContent = 'Backend error';
    els.healthPill.className = 'status-pill status-pill--err';
    showToast(error.message, true);
  }
}

async function bootstrap() {
  const auth = await loadAuthState();
  if (!auth.authenticated) {
    showAuthScreen('login');
    setAuthMessage('login', 'Sign in as the administrator or an existing registered user to continue.');
    return;
  }
  await bootstrapData();
}

attachNav();
attachEvents();
bootstrap();
