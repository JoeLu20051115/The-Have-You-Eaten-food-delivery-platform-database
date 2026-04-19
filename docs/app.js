const demoData = {
  summary: {
    customers: 300,
    orders: 50,
    stores: 45,
    riders: 200,
    gmv: 2259.65,
    avg_order_value: 45.19,
    active_deliveries: 61,
    completed_orders: 32,
  },
  analytics: {
    order_status: [
      { label: 'Completed', value: 32 },
      { label: 'Preparing', value: 9 },
      { label: 'Pending', value: 9 },
    ],
    delivery_status: [
      { label: 'assigned', value: 108 },
      { label: 'completed', value: 93 },
      { label: 'picked_up', value: 85 },
      { label: 'delivering', value: 61 },
    ],
    top_dishes: [
      { dish_name: 'Chicken Taco', revenue: 17.5, units: 10 },
      { dish_name: 'Fried Calamari', revenue: 25.3, units: 5 },
      { dish_name: 'Egg Sandwich', revenue: 12.5, units: 5 },
      { dish_name: 'Garlic Bread', revenue: 35.0, units: 4 },
      { dish_name: 'Fruit Punch', revenue: 14.62, units: 4 },
    ],
    rider_performance: [
      { rider_name: 'Zhou Shuo', total_tasks: 5, completed_tasks: 3, rating: 3.6 },
      { rider_name: 'Chen Zihan', total_tasks: 8, completed_tasks: 3, rating: 3.6 },
      { rider_name: 'Xu Xin', total_tasks: 5, completed_tasks: 2, rating: 5.0 },
      { rider_name: 'Sun Xin', total_tasks: 6, completed_tasks: 2, rating: 4.6 },
    ],
  },
  tables: [
    {
      name: 'customer',
      label: 'Customers',
      primary_keys: ['customer_id'],
      searchable_columns: ['customer_id', 'user_name', 'phone'],
      columns: [
        { name: 'customer_id', type: 'VARCHAR(50)', nullable: false, primary_key: true },
        { name: 'user_name', type: 'VARCHAR(100)', nullable: false, primary_key: false },
        { name: 'phone', type: 'VARCHAR(20)', nullable: false, primary_key: false },
      ],
      rows: [
        { customer_id: 'C001', user_name: 'User_1', phone: '13848893998' },
        { customer_id: 'C002', user_name: 'User_2', phone: '13825549227' },
        { customer_id: 'C003', user_name: 'User_3', phone: '13823800371' },
        { customer_id: 'C004', user_name: 'User_4', phone: '13814200773' },
        { customer_id: 'C005', user_name: 'User_5', phone: '13893452029' },
      ],
    },
    {
      name: 'store',
      label: 'Stores',
      primary_keys: ['store_id'],
      searchable_columns: ['store_name', 'merchant_id'],
      columns: [
        { name: 'store_id', type: 'INTEGER', nullable: false, primary_key: true },
        { name: 'merchant_id', type: 'INTEGER', nullable: false, primary_key: false },
        { name: 'store_name', type: 'VARCHAR(150)', nullable: false, primary_key: false },
      ],
      rows: [
        { store_id: 1, merchant_id: 101, store_name: 'Downtown Grill' },
        { store_id: 2, merchant_id: 102, store_name: 'Morning Bowl' },
        { store_id: 3, merchant_id: 103, store_name: 'Seaside Sushi' },
      ],
    },
    {
      name: 'orders',
      label: 'Orders',
      primary_keys: ['order_id'],
      searchable_columns: ['customer_id', 'store_id', 'order_status', 'payment_status'],
      columns: [
        { name: 'order_id', type: 'INTEGER', nullable: false, primary_key: true },
        { name: 'customer_id', type: 'VARCHAR(50)', nullable: false, primary_key: false },
        { name: 'store_id', type: 'INTEGER', nullable: false, primary_key: false },
        { name: 'order_status', type: 'ENUM', nullable: false, primary_key: false },
        { name: 'payment_status', type: 'ENUM', nullable: false, primary_key: false },
        { name: 'total_amount', type: 'DECIMAL(10,2)', nullable: false, primary_key: false },
      ],
      rows: [
        { order_id: 1, customer_id: 'C001', store_id: 1, order_status: 'Completed', payment_status: 'Paid', total_amount: 18.43 },
        { order_id: 2, customer_id: 'C002', store_id: 2, order_status: 'Preparing', payment_status: 'Paid', total_amount: 57.20 },
        { order_id: 3, customer_id: 'C003', store_id: 3, order_status: 'Pending', payment_status: 'Pending', total_amount: 32.00 },
        { order_id: 4, customer_id: 'C004', store_id: 1, order_status: 'Completed', payment_status: 'Paid', total_amount: 44.44 },
      ],
    },
    {
      name: 'rider',
      label: 'Riders',
      primary_keys: ['rider_id'],
      searchable_columns: ['real_name', 'phone', 'status'],
      columns: [
        { name: 'rider_id', type: 'CHAR(5)', nullable: false, primary_key: true },
        { name: 'real_name', type: 'VARCHAR(100)', nullable: false, primary_key: false },
        { name: 'phone', type: 'VARCHAR(20)', nullable: false, primary_key: false },
        { name: 'status', type: 'ENUM', nullable: false, primary_key: false },
      ],
      rows: [
        { rider_id: 'R001', real_name: 'Zhou Shuo', phone: '13900010001', status: 'online' },
        { rider_id: 'R002', real_name: 'Chen Zihan', phone: '13900010002', status: 'busy' },
        { rider_id: 'R003', real_name: 'Xu Xin', phone: '13900010003', status: 'online' },
      ],
    },
  ],
  featureManual: [
    'GitHub Pages 纯静态展示版本，不依赖常驻后端服务',
    '保留 Dashboard、查询器、CRUD Studio、Schema Explorer 和功能说明页面',
    '可在课程答辩、同学访问、作品展示时直接通过 github.io 打开',
    '无代码查询器基于内置样例数据实现筛选、排序、分页演示',
    '专门增加 Page Guide 页面解释每个页面的用途和可展示内容',
    '如需真实数据库写入和实时数据，需要切换到 FastAPI 后端版本',
  ],
  pageGuide: [
    {
      name: 'Dashboard',
      audience: '老师、评审、运营展示',
      purpose: '快速展示系统核心指标、订单状态和配送状态，适合首页演示。',
      points: ['展示 KPI 总览', '展示订单和配送分布图', '展示高价值菜品和骑手表现'],
    },
    {
      name: 'No-Code Query',
      audience: '非技术用户、课程展示',
      purpose: '不写 SQL 也能查看样例数据，展示系统的人机交互能力。',
      points: ['支持选择表', '支持搜索、筛选、排序、分页', '适合展示“无代码查询”能力'],
    },
    {
      name: 'CRUD Studio',
      audience: '系统设计讲解、功能说明',
      purpose: '展示真实系统中增删改页面长什么样，在静态版中做交互模拟。',
      points: ['动态显示字段', '模拟 create/update/delete 流程', '清楚区分静态演示和真实写库版'],
    },
    {
      name: 'Schema Explorer',
      audience: '数据库课程答辩、结构说明',
      purpose: '展示数据库表结构、主键和字段类型，帮助讲解 ER 设计和关系模式。',
      points: ['展示主要业务表', '展示字段与类型', '适合配合 ER 图和 SQL 文件一起讲解'],
    },
    {
      name: 'Feature Manual',
      audience: '使用者、评审、项目说明',
      purpose: '统一列出系统支持的功能、演示边界和技术特点。',
      points: ['总结核心能力', '说明 GitHub Pages 版本定位', '帮助读者快速理解项目范围'],
    },
    {
      name: 'Page Guide',
      audience: '所有访问者',
      purpose: '专门解释每个页面是干什么的，避免老师或用户看不懂页面分工。',
      points: ['逐页说明用途', '说明适合谁看', '说明页面可以展示什么'],
    },
  ],
};

const state = {
  tables: demoData.tables,
  overview: { feature_manual: demoData.featureManual },
  dashboard: demoData.summary,
  analytics: demoData.analytics,
  query: {
    table: demoData.tables[0].name,
    page: 1,
    pageSize: 10,
    search: '',
    sortBy: null,
    sortDirection: 'asc',
    filters: [],
    lastResult: null,
  },
  crud: {
    table: demoData.tables[0].name,
    action: 'create',
  },
};

const els = {
  healthPill: document.getElementById('health-pill'),
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
  toast: document.getElementById('toast'),
};

function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.style.background = isError ? 'rgba(127, 29, 29, 0.92)' : 'rgba(26, 32, 22, 0.92)';
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
  if (!rows.length) {
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
  selectEl.value = selected;
}

function tableSchema(tableName) {
  return state.tables.find((table) => table.name === tableName);
}

function refreshQueryControls() {
  const schema = tableSchema(state.query.table);
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

function applyFilters(rows) {
  return rows.filter((row) => state.query.filters.every((filter) => {
    const value = row[filter.field];
    const target = filter.value;
    switch (filter.operator) {
      case 'eq': return String(value) === target;
      case 'ne': return String(value) !== target;
      case 'lt': return Number(value) < Number(target);
      case 'lte': return Number(value) <= Number(target);
      case 'gt': return Number(value) > Number(target);
      case 'gte': return Number(value) >= Number(target);
      case 'like': return String(value).toLowerCase().includes(String(target).toLowerCase());
      default: return true;
    }
  }));
}

function loadQueryResults() {
  const schema = tableSchema(state.query.table);
  let rows = [...schema.rows];

  if (state.query.search.trim()) {
    const keyword = state.query.search.trim().toLowerCase();
    rows = rows.filter((row) => schema.searchable_columns.some((column) => String(row[column] ?? '').toLowerCase().includes(keyword)));
  }

  rows = applyFilters(rows);

  const sortField = state.query.sortBy || schema.primary_keys[0] || schema.columns[0].name;
  rows.sort((left, right) => {
    const a = left[sortField];
    const b = right[sortField];
    const result = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
    return state.query.sortDirection === 'desc' ? -result : result;
  });

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / state.query.pageSize));
  state.query.page = Math.min(state.query.page, totalPages);
  const start = (state.query.page - 1) * state.query.pageSize;
  const pagedRows = rows.slice(start, start + state.query.pageSize);

  state.query.lastResult = { total_pages: totalPages };
  els.queryMeta.textContent = `Showing page ${state.query.page} of ${totalPages} · ${total} demo rows total`;
  renderTable(els.queryResults, pagedRows);
}

function buildFieldInputs(container, schema, primaryOnly, action) {
  const columns = primaryOnly ? schema.columns.filter((column) => schema.primary_keys.includes(column.name)) : schema.columns;
  container.innerHTML = columns.map((column) => {
    const disabled = action === 'delete' && !primaryOnly;
    return `
      <label>
        <span>${column.name}${column.primary_key ? ' · PK' : ''}</span>
        <input data-field="${column.name}" ${disabled ? 'disabled' : ''} placeholder="${column.type}">
      </label>
    `;
  }).join('');
}

function refreshCrudForm() {
  const schema = tableSchema(state.crud.table);
  buildFieldInputs(els.crudKeyFields, schema, true, state.crud.action);
  buildFieldInputs(els.crudValueFields, schema, false, state.crud.action);
  if (state.crud.action === 'delete') {
    els.crudValueFields.innerHTML = '<p class="muted small">Delete only needs the primary key fields above.</p>';
  }
}

function renderSchemaExplorer() {
  els.schemaGrid.innerHTML = state.tables.map((table) => `
    <article class="card schema-card">
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
  els.manualList.innerHTML = demoData.featureManual.map((item) => `<div class="schema-column">${item}</div>`).join('');
}

function renderPageGuide() {
  els.pageGuide.innerHTML = demoData.pageGuide.map((page) => `
    <article class="guide-card">
      <p class="eyebrow">${page.audience}</p>
      <h4>${page.name}</h4>
      <p class="muted">${page.purpose}</p>
      <div class="guide-points">
        ${page.points.map((point) => `<div class="guide-point">${point}</div>`).join('')}
      </div>
    </article>
  `).join('');
}

function loadDashboard() {
  renderKpis(demoData.summary);
  renderBarChart(els.orderStatusChart, demoData.analytics.order_status);
  renderBarChart(els.deliveryStatusChart, demoData.analytics.delivery_status);
  renderTable(els.topDishesTable, demoData.analytics.top_dishes);
  renderTable(els.riderPerformanceTable, demoData.analytics.rider_performance);
}

function attachNav() {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
      document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`view-${button.dataset.view}`).classList.add('active');
    });
  });
}

function attachEvents() {
  els.refreshAllBtn.addEventListener('click', () => {
    bootstrap();
    showToast('Demo data reloaded');
  });

  els.queryTable.addEventListener('change', () => {
    state.query.table = els.queryTable.value;
    state.query.page = 1;
    state.query.sortBy = null;
    refreshQueryControls();
    loadQueryResults();
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

  els.runQueryBtn.addEventListener('click', () => {
    state.query.page = 1;
    loadQueryResults();
    showToast('Demo query executed');
  });

  els.prevPageBtn.addEventListener('click', () => {
    if (state.query.page <= 1) return;
    state.query.page -= 1;
    loadQueryResults();
  });

  els.nextPageBtn.addEventListener('click', () => {
    if (state.query.lastResult && state.query.page >= state.query.lastResult.total_pages) return;
    state.query.page += 1;
    loadQueryResults();
  });

  els.crudTable.addEventListener('change', () => {
    state.crud.table = els.crudTable.value;
    refreshCrudForm();
  });

  els.crudAction.addEventListener('change', () => {
    state.crud.action = els.crudAction.value;
    refreshCrudForm();
  });

  els.runMutationBtn.addEventListener('click', () => {
    els.mutationResult.textContent = 'Static GitHub Pages mode: this action is simulated only and does not update the database.';
    showToast('Static demo mode does not write to the database');
  });
}

function bootstrap() {
  populateTableSelect(els.queryTable, state.query.table);
  populateTableSelect(els.crudTable, state.crud.table);
  refreshQueryControls();
  renderActiveFilters();
  refreshCrudForm();
  renderSchemaExplorer();
  renderManual();
  renderPageGuide();
  loadDashboard();
  loadQueryResults();
}

attachNav();
attachEvents();
bootstrap();