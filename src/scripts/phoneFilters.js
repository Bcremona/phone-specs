const PHONES_PER_PAGE = 12;

// Read price bounds injected by the server via data-attributes
const filtersPanel = document.getElementById('filtersPanel');
const minPriceGlobal = Number(filtersPanel?.dataset.minPrice ?? 0);
const maxPriceGlobal = Number(filtersPanel?.dataset.maxPrice ?? 9999);

// State
const state = {
    search: '',
    brand: '',
    year: '',
    minPrice: minPriceGlobal,
    maxPrice: maxPriceGlobal,
    page: 1,
};

// Elements
const searchInput = document.getElementById('searchInput');
const filterBrand = document.getElementById('filterBrand');
const filterYear = document.getElementById('filterYear');
const priceMin = document.getElementById('priceMin');
const priceMax = document.getElementById('priceMax');
const priceFill = document.getElementById('priceFill');
const priceLabel = document.getElementById('priceLabel');
const phoneGrid = document.getElementById('phoneGrid');
const noResults = document.getElementById('noResults');
const paginationBar = document.getElementById('paginationBar');
const resultsCount = document.getElementById('resultsCount');
const activeBadges = document.getElementById('activeBadges');
const allCards = Array.from(document.querySelectorAll('.phone-card'));

// ── Core filter + paginate ──────────────────────────────────────────────────
function applyFilters() {
    const { search, brand, year, minPrice, maxPrice } = state;

    const visible = allCards.filter(card => {
        const name = card.getAttribute('data-phone-name') || '';
        const b = card.getAttribute('data-phone-brand') || '';
        const price = Number(card.getAttribute('data-phone-price'));
        const y = card.getAttribute('data-phone-year') || '';

        if (search && !name.includes(search) && !b.includes(search)) return false;
        if (brand && b !== brand.toLowerCase()) return false;
        if (year && y !== year) return false;
        if (!isNaN(price)) {
            if (price < minPrice || price > maxPrice) return false;
        }
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(visible.length / PHONES_PER_PAGE));
    if (state.page > totalPages) state.page = totalPages;
    const currentPage = state.page;

    const start = (currentPage - 1) * PHONES_PER_PAGE;
    const pageCards = new Set(visible.slice(start, start + PHONES_PER_PAGE));

    allCards.forEach(card => {
        card.style.display = pageCards.has(card) ? '' : 'none';
    });

    if (visible.length > 0) {
        phoneGrid.style.display = 'grid';
        noResults.style.display = 'none';
    } else {
        phoneGrid.style.display = 'none';
        noResults.style.display = 'block';
    }

    const from = visible.length ? start + 1 : 0;
    const to = Math.min(start + PHONES_PER_PAGE, visible.length);
    resultsCount.textContent = visible.length
        ? `Showing ${from}–${to} of ${visible.length} phone${visible.length !== 1 ? 's' : ''}`
        : '';

    renderPagination(totalPages, currentPage);
    updateBadges();
}

// ── Pagination UI ───────────────────────────────────────────────────────────
function renderPagination(totalPages, currentPage) {
    paginationBar.innerHTML = '';
    if (totalPages <= 1) return;

    const mkBtn = (label, page, disabled = false, active = false) => {
        const btn = document.createElement('button');
        btn.className = 'page-btn' + (active ? ' active' : '');
        btn.textContent = label;
        btn.disabled = disabled;
        btn.addEventListener('click', () => { state.page = page; applyFilters(); });
        return btn;
    };

    paginationBar.appendChild(mkBtn('← Prev', currentPage - 1, currentPage === 1));

    const pages = getPageNumbers(currentPage, totalPages);
    let lastEllipsis = false;
    pages.forEach(p => {
        if (p === '…') {
            if (!lastEllipsis) {
                const span = document.createElement('span');
                span.className = 'page-btn';
                span.style.cursor = 'default';
                span.textContent = '…';
                paginationBar.appendChild(span);
            }
            lastEllipsis = true;
        } else {
            lastEllipsis = false;
            paginationBar.appendChild(mkBtn(p, p, false, p === currentPage));
        }
    });

    paginationBar.appendChild(mkBtn('Next →', currentPage + 1, currentPage === totalPages));
}

function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
}

// ── Active filter badges ────────────────────────────────────────────────────
function updateBadges() {
    const badges = [];
    if (state.brand) badges.push(`Brand: ${state.brand}`);
    if (state.year) badges.push(`Year: ${state.year}`);
    if (state.minPrice > minPriceGlobal || state.maxPrice < maxPriceGlobal)
        badges.push(`Price: $${state.minPrice}–$${state.maxPrice}`);
    if (state.search) badges.push(`Search: "${state.search}"`);

    if (badges.length === 0) {
        activeBadges.classList.add('hidden');
        activeBadges.innerHTML = '';
        return;
    }
    activeBadges.classList.remove('hidden');
    activeBadges.innerHTML = badges.map(b =>
        `<span class="filter-badge">${b}</span>`
    ).join('');
}

// ── Price slider helpers ────────────────────────────────────────────────────
function updatePriceFill() {
    const min = Number(priceMin.value);
    const max = Number(priceMax.value);
    const range = maxPriceGlobal - minPriceGlobal;
    const leftPct = ((min - minPriceGlobal) / range) * 100;
    const rightPct = ((max - minPriceGlobal) / range) * 100;
    priceFill.style.marginLeft = leftPct + '%';
    priceFill.style.width = (rightPct - leftPct) + '%';
    priceLabel.textContent = `$${min} – $${max}`;
}

// ── Event listeners ─────────────────────────────────────────────────────────
searchInput?.addEventListener('input', e => {
    state.search = e.target.value.toLowerCase().trim();
    state.page = 1;
    applyFilters();
});

filterBrand?.addEventListener('change', e => {
    state.brand = e.target.value;
    state.page = 1;
    applyFilters();
});

filterYear?.addEventListener('change', e => {
    state.year = e.target.value;
    state.page = 1;
    applyFilters();
});

priceMin?.addEventListener('input', () => {
    if (Number(priceMin.value) > Number(priceMax.value)) priceMin.value = priceMax.value;
    state.minPrice = Number(priceMin.value);
    state.page = 1;
    updatePriceFill();
    applyFilters();
});

priceMax?.addEventListener('input', () => {
    if (Number(priceMax.value) < Number(priceMin.value)) priceMax.value = priceMin.value;
    state.maxPrice = Number(priceMax.value);
    state.page = 1;
    updatePriceFill();
    applyFilters();
});

// ── Clear all ───────────────────────────────────────────────────────────────
function clearAllFilters() {
    state.search = '';
    state.brand = '';
    state.year = '';
    state.minPrice = minPriceGlobal;
    state.maxPrice = maxPriceGlobal;
    state.page = 1;

    if (searchInput) searchInput.value = '';
    if (filterBrand) filterBrand.value = '';
    if (filterYear) filterYear.value = '';
    if (priceMin) priceMin.value = minPriceGlobal;
    if (priceMax) priceMax.value = maxPriceGlobal;

    updatePriceFill();
    applyFilters();
}

window.clearAllFilters = clearAllFilters;
window.clearSearch = clearAllFilters; // legacy alias

// ── Init ────────────────────────────────────────────────────────────────────
updatePriceFill();
applyFilters();
