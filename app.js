/**
 * 夯の專業桶仔雞 永和店 官方網站
 * Interactive JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  initMenuFilter();
  initOrderEstimator();
  initFaqAccordion();
  initBackToTop();
  initYear();
});

/* ==========================================================================
   1. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const closeBtn = document.getElementById('drawer-close');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('backdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   2. MENU FILTERING
   ========================================================================== */
function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCategory = btn.getAttribute('data-filter');

      menuCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (targetCategory === 'all' || cardCategory === targetCategory) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });
}

/* ==========================================================================
   3. ORDER ESTIMATOR & RESERVATION ENGINE
   ========================================================================== */
const PRICING_MAP = {
  original: {
    '小': 500,
    '中': 600,
    '大': 700,
    '特大': 750
  },
  special: {
    '小': 600,
    '中': 700,
    '大': 800,
    '特大': 850
  }
};

let currentOrderState = {
  flavor: '招牌甘蔗桶仔雞',
  size: '大',
  qty: 1,
  unitPrice: 800,
  addons: [],
  name: '',
  phone: '',
  date: '今日',
  time: '儘快現烤 (約30~45分後)',
  note: ''
};

function initOrderEstimator() {
  const flavorSelect = document.getElementById('order-flavor');
  const sizeRadios = document.querySelectorAll('input[name="order-size"]');
  const sizePills = document.querySelectorAll('.size-pill');
  const qtyInput = document.getElementById('order-qty');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const addonCheckboxes = document.querySelectorAll('.addon-checkbox-item input[type="checkbox"]');

  // Handle flavor change
  if (flavorSelect) {
    flavorSelect.addEventListener('change', (e) => {
      currentOrderState.flavor = e.target.value;
      updateSizePricesDisplay();
      calculateOrder();
    });
  }

  // Handle size change
  sizeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      currentOrderState.size = e.target.value;
      sizePills.forEach(p => p.classList.remove('active'));
      e.target.closest('.size-pill').classList.add('active');
      calculateOrder();
    });
  });

  // Handle Qty Stepper
  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) {
        val -= 1;
        qtyInput.value = val;
        currentOrderState.qty = val;
        calculateOrder();
      }
    });

    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val < 20) {
        val += 1;
        qtyInput.value = val;
        currentOrderState.qty = val;
        calculateOrder();
      }
    });
  }

  // Handle Addons Checkbox
  addonCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      calculateOrder();
    });
  });

  // Update pill prices initially
  updateSizePricesDisplay();
  calculateOrder();
}

function updateSizePricesDisplay() {
  const isOriginal = currentOrderState.flavor.includes('原味');
  const priceCategory = isOriginal ? PRICING_MAP.original : PRICING_MAP.special;

  const sizePills = document.querySelectorAll('.size-pill');
  sizePills.forEach(pill => {
    const input = pill.querySelector('input');
    const sizeVal = input.value;
    const priceDisplay = pill.querySelector('.pill-price');
    if (priceDisplay && priceCategory[sizeVal]) {
      priceDisplay.textContent = `$${priceCategory[sizeVal]}`;
    }
  });
}

function calculateOrder() {
  const isOriginal = currentOrderState.flavor.includes('原味');
  const priceCategory = isOriginal ? PRICING_MAP.original : PRICING_MAP.special;
  
  const unitPrice = priceCategory[currentOrderState.size] || 800;
  currentOrderState.unitPrice = unitPrice;

  const chickenSubtotal = unitPrice * currentOrderState.qty;

  // Calculate Addons
  const activeAddons = [];
  let addonsSubtotal = 0;
  const addonCheckboxes = document.querySelectorAll('.addon-checkbox-item input[type="checkbox"]');
  
  addonCheckboxes.forEach(cb => {
    if (cb.checked) {
      const name = cb.getAttribute('data-name');
      const price = parseInt(cb.getAttribute('data-price')) || 0;
      activeAddons.push({ name, price });
      addonsSubtotal += price;
    }
  });

  currentOrderState.addons = activeAddons;
  const grandTotal = chickenSubtotal + addonsSubtotal;

  // Update UI Elements
  const sumItemName = document.getElementById('sum-item-name');
  const sumItemPrice = document.getElementById('sum-item-price');
  const sumAddonsBox = document.getElementById('sum-addons-box');
  const sumTotalAmount = document.getElementById('sum-total-amount');

  if (sumItemName) {
    sumItemName.textContent = `${currentOrderState.flavor} (${currentOrderState.size}隻) × ${currentOrderState.qty}`;
  }
  if (sumItemPrice) {
    sumItemPrice.textContent = `$${chickenSubtotal}`;
  }

  if (sumAddonsBox) {
    sumAddonsBox.innerHTML = '';
    if (activeAddons.length > 0) {
      activeAddons.forEach(item => {
        const row = document.createElement('div');
        row.className = 'summary-addon-row';
        row.innerHTML = `<span>+ ${item.name}</span><span>$${item.price}</span>`;
        sumAddonsBox.appendChild(row);
      });
    }
  }

  if (sumTotalAmount) {
    sumTotalAmount.textContent = `$${grandTotal}`;
  }
}

// Global function called when user clicks "+ 試算點餐" on a menu card
window.addToOrder = function(flavorName, price, sizeName) {
  const flavorSelect = document.getElementById('order-flavor');
  if (flavorSelect) {
    // If it's a chicken flavor, set the select
    let matched = false;
    for (let opt of flavorSelect.options) {
      if (opt.value.includes(flavorName) || flavorName.includes(opt.value)) {
        flavorSelect.value = opt.value;
        currentOrderState.flavor = opt.value;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // It's a side like pork or tea
      if (flavorName.includes('鹹豬肉')) {
        const porkCb = document.getElementById('addon-pork');
        if (porkCb) porkCb.checked = true;
      } else if (flavorName.includes('雞油')) {
        const oilCb = document.getElementById('addon-oil');
        if (oilCb) oilCb.checked = true;
      } else if (flavorName.includes('四季春')) {
        const teaCb = document.getElementById('addon-tea');
        if (teaCb) teaCb.checked = true;
      }
    } else {
      // It's a chicken, set size
      const targetRadio = document.querySelector(`input[name="order-size"][value="${sizeName}"]`);
      if (targetRadio) {
        targetRadio.checked = true;
        currentOrderState.size = sizeName;
        document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
        targetRadio.closest('.size-pill').classList.add('active');
      }
    }

    updateSizePricesDisplay();
    calculateOrder();

    // Smooth scroll to order section
    const orderSection = document.getElementById('order');
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: 'smooth' });
    }

    showToast(`已為您加入「${flavorName}」至預約試算表！`);
  }
};

/* ==========================================================================
   4. ORDER SUBMISSION & TEXT COPYING
   ========================================================================== */
function formatOrderSummaryText() {
  const nameInput = document.getElementById('customer-name');
  const phoneInput = document.getElementById('customer-phone');
  const dateSelect = document.getElementById('pickup-date');
  const timeSelect = document.getElementById('pickup-time');
  const noteInput = document.getElementById('order-note');
  const totalAmountElem = document.getElementById('sum-total-amount');

  const customerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : '顧客 (未填)';
  const customerPhone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : '未提供電話';
  const pickupDate = dateSelect ? dateSelect.value : '今日';
  const pickupTime = timeSelect ? timeSelect.value : '儘快現烤';
  const orderNote = noteInput && noteInput.value.trim() ? noteInput.value.trim() : '無特殊備註';
  const total = totalAmountElem ? totalAmountElem.textContent : '$800';

  let addonsText = '無';
  if (currentOrderState.addons.length > 0) {
    addonsText = currentOrderState.addons.map(a => `${a.name} ($${a.price})`).join('、');
  }

  return `【夯の專業桶仔雞 永和店 - 預約自取單】
-----------------------------
📍 門市：新北市永和區中正路66號
📞 電話：(02) 2943-6686
👤 訂購人：${customerName}
📱 聯絡電話：${customerPhone}
⏰ 取餐時間：${pickupDate} ${pickupTime}
-----------------------------
🍗 訂購餐點：${currentOrderState.flavor} (${currentOrderState.size}隻) × ${currentOrderState.qty}
🍢 私房加購：${addonsText}
🎁 附贈配件：精華原汁雞油1碗、特製胡椒鹽1包、辣椒粉1包、防燙隔熱雙層手套
💰 預估總金額：${total}
📝 特別備註：${orderNote}
-----------------------------
※ 溫馨提醒：現烤需時約30-40分鐘，門市現場付款取餐！`;
}

window.copyOrderDetails = function() {
  const text = formatOrderSummaryText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 預約單內容已成功複製！可直接貼至 LINE 或備忘錄！');
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
};

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('📋 預約單內容已成功複製！');
  } catch (err) {
    showToast('請手動選取文字進行複製。');
  }
  document.body.removeChild(textArea);
}

window.submitReservation = function() {
  const nameInput = document.getElementById('customer-name');
  const phoneInput = document.getElementById('customer-phone');

  const nameVal = nameInput ? nameInput.value.trim() : '';
  const phoneVal = phoneInput ? phoneInput.value.trim() : '';

  if (!nameVal || !phoneVal) {
    showToast('💡 貼心提醒：請先填寫「訂購人姓名」與「聯絡電話」，方便店家為您登記現烤！');
    if (!nameVal && nameInput) nameInput.focus();
    else if (!phoneVal && phoneInput) phoneInput.focus();
    return;
  }

  const orderText = formatOrderSummaryText();
  // Copy to clipboard first so they have it ready
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(orderText);
  }

  showToast('準備直撥永和店專線：(02) 2943-6686，預約單文字已同步複製！');
  setTimeout(() => {
    window.location.href = 'tel:0229436686';
  }, 900);
};

/* ==========================================================================
   5. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close all other items
        faqItems.forEach(i => i.classList.remove('active'));

        // Toggle clicked
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   6. BACK TO TOP & SCROLL LISTENERS
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('btn-back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      if (backToTopBtn) backToTopBtn.style.opacity = '1';
    } else {
      if (backToTopBtn) backToTopBtn.style.opacity = '0.5';
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ==========================================================================
   7. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message, duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="font-size: 1.2rem;">🍗</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/* ==========================================================================
   8. CURRENT YEAR
   ========================================================================== */
function initYear() {
  const yearElem = document.getElementById('current-year');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }
}
