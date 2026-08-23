// ---------- Theme (dark/light) + language (en/ar) ----------
// Applied on every page. Persisted in localStorage so the choice
// sticks as the user moves between pages.

function getTheme() {
  return localStorage.getItem('baseera-theme') || 'light';
}

function getLang() {
  return localStorage.getItem('baseera-lang') || 'en';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-toggle-icon').forEach((el) => {
    el.innerHTML = theme === 'dark'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display: block; margin: auto;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display: block; margin: auto;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
  });

  const themeDisplay = document.getElementById('theme-display');
  if (themeDisplay) {
    const isAr = getLang() === 'ar';
    themeDisplay.textContent = theme === 'dark' ? (isAr ? '\u062F\u0627\u0643\u0646' : 'Dark') : (isAr ? '\u0641\u0627\u062A\u062D' : 'Light');
  }

  // Swap any image that has light/dark variants defined via data attributes.
  // Example: <img src="logo.png" data-light-src="logo.png" data-dark-src="logo-dark.png">
  document.querySelectorAll('[data-dark-src]').forEach((img) => {
    const lightSrc = img.getAttribute('data-light-src') || img.getAttribute('src');
    const darkSrc = img.getAttribute('data-dark-src');
    img.setAttribute('src', theme === 'dark' ? darkSrc : lightSrc);
  });
}

function applyLang(lang) {
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

      document.querySelectorAll('.lang-toggle-label').forEach((el) => {
    el.textContent = lang === 'ar' ? 'Eng' : 'ع';
  });

  const langDisplay = document.getElementById('lang-display');
  if (langDisplay) {
    langDisplay.textContent = lang === 'ar' ? '\u0627\u0644\u0639\u0631\u0628\u064A\u0629' : 'English';
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const dict = window.BASEERA_TRANSLATIONS && window.BASEERA_TRANSLATIONS[key];
    if (dict && dict[lang]) {
      el.innerHTML = dict[lang];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const dict = window.BASEERA_TRANSLATIONS && window.BASEERA_TRANSLATIONS[key];
    if (dict && dict[lang]) {
      el.setAttribute('placeholder', dict[lang]);
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    const dict = window.BASEERA_TRANSLATIONS && window.BASEERA_TRANSLATIONS[key];
    if (dict && dict[lang]) {
      el.setAttribute('title', dict[lang]);
    }
  });
}

function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('baseera-theme', next);
  applyTheme(next);
}

function toggleLang() {
  const next = getLang() === 'ar' ? 'en' : 'ar';
  localStorage.setItem('baseera-lang', next);
  applyLang(next);
  document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: next } }));
}

function initThemeAndLang() {
  applyTheme(getTheme());
  applyLang(getLang());

  document.querySelectorAll('.theme-toggle-pill').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheme();
    });
  });

  document.querySelectorAll('.lang-toggle-pill').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLang();
    });
  });

  initNotificationSystem();
  initPrivacyToggleSystem();
}

document.addEventListener('DOMContentLoaded', initThemeAndLang);
document.addEventListener('langChanged', renderNotificationUI);

// ---------- Notification Dropdown & Red Badge System ----------
const DEFAULT_BASEERA_NOTIFICATIONS = [
  {
    id: 'n-danger-1',
    type: 'danger',
    titleAr: 'تنبيه هبوط الإيرادات ⚠️',
    titleEn: 'Revenue Drop Warning ⚠️',
    textAr: 'تم اكتشاف انخفاض في إجمالي الإيرادات بنسبة 14.2% هذا الأسبوع. ينصح بمراجعة تقرير المبيعات والهدر.',
    textEn: 'Detected a 14.2% drop in total revenue this week. Immediate review recommended.',
    timeAr: 'منذ 15 دقيقة',
    timeEn: '15 mins ago',
    unread: true
  },
  {
    id: 'n-success-2',
    type: 'success',
    titleAr: 'اكتمل التحليل الذكي 📊',
    titleEn: 'Data Analysis Completed 📊',
    textAr: 'تم تحليل وتطابق بيانات ملف المبيعات pest_control_dataset.csv بنجاح وتحديث لوحة المؤشرات.',
    textEn: 'Successfully analyzed pest_control_dataset.csv and updated dashboard KPIs.',
    timeAr: 'منذ ساعة',
    timeEn: '1 hour ago',
    unread: true
  },
  {
    id: 'n-warning-3',
    type: 'warning',
    titleAr: 'تنبيه مخزون الخدمات 📦',
    titleEn: 'Inventory Alert 📦',
    textAr: 'مخزون صنف مواد مكافحة الآفات قارب على النفاد (متبقي 5 شحنات فقط).',
    textEn: 'Pest control chemical stock running low (only 5 units remaining).',
    timeAr: 'منذ 3 ساعات',
    timeEn: '3 hours ago',
    unread: false
  }
];

function getStoredNotifications() {
  const stored = localStorage.getItem('baseera_notifications_list');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch(e) {}
  }
  localStorage.setItem('baseera_notifications_list', JSON.stringify(DEFAULT_BASEERA_NOTIFICATIONS));
  return DEFAULT_BASEERA_NOTIFICATIONS;
}

function saveStoredNotifications(list) {
  localStorage.setItem('baseera_notifications_list', JSON.stringify(list));
  renderNotificationUI();
}

function deleteNotificationItem(id, event) {
  if (event) event.stopPropagation();
  let list = getStoredNotifications();
  list = list.filter(n => n.id !== id);
  saveStoredNotifications(list);
}

function clearAllNotificationsList(event) {
  if (event) event.stopPropagation();
  saveStoredNotifications([]);
}

function renderNotificationUI() {
  const list = getStoredNotifications();
  const isAr = (localStorage.getItem('baseera-lang') || 'en') === 'ar';
  
  // Red Dot & Count Badge
  const unreadCount = list.filter(n => n.unread).length;
  const redDot = document.getElementById('notif-red-dot');
  if (redDot) {
    redDot.style.display = (unreadCount > 0 || list.length > 0) ? 'block' : 'none';
  }
  
  const badgeCount = document.getElementById('notif-badge-count');
  if (badgeCount) {
    badgeCount.textContent = list.length;
    badgeCount.style.display = list.length > 0 ? 'inline-block' : 'none';
  }

  // Clear All Button Translation
  const clearBtn = document.getElementById('notif-clear-btn');
  if (clearBtn) {
    clearBtn.textContent = isAr ? 'تفريغ الكل' : 'Clear all';
    clearBtn.style.display = list.length > 0 ? 'block' : 'none';
  }

  const notifTitleEl = document.getElementById('notif-header-title-text');
  if (notifTitleEl) {
    notifTitleEl.textContent = isAr ? 'التنبيهات والإشعارات' : 'Notifications';
  }

  // Render Items List
  const container = document.getElementById('notif-list-container');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="notif-empty-state">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span>${isAr ? 'لا توجد إشعارات حالياً' : 'No new notifications'}</span>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(n => {
    let iconBgClass = 'notif-icon-info';
    let iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    if (n.type === 'danger') {
      iconBgClass = 'notif-icon-danger';
      iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else if (n.type === 'success') {
      iconBgClass = 'notif-icon-success';
      iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (n.type === 'warning') {
      iconBgClass = 'notif-icon-warning';
      iconSvg = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
    }

    const title = isAr ? (n.titleAr || n.titleEn) : (n.titleEn || n.titleAr);
    const text = isAr ? (n.textAr || n.textEn) : (n.textEn || n.textAr);
    const time = isAr ? (n.timeAr || n.timeEn) : (n.timeEn || n.timeAr);

    return `
      <div class="notif-item">
        <div class="notif-icon-box ${iconBgClass}">${iconSvg}</div>
        <div class="notif-content-wrap">
          <div class="notif-title-row">
            <span class="notif-item-title">${title}</span>
            <button class="notif-delete-btn" onclick="deleteNotificationItem('${n.id}', event)" title="${isAr ? 'حذف الإشعار' : 'Delete'}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="notif-item-text">${text}</div>
          <div class="notif-item-time">${time}</div>
        </div>
      </div>
    `;
  }).join('');
}

function initNotificationSystem() {
  const path = window.location.pathname.toLowerCase();
  const isHomepage = (path.endsWith('dashboard.html') || path.endsWith('/')) && document.querySelector('.dash-topbar');
  
  if (!isHomepage) {
    const trigger = document.getElementById('notif-trigger');
    if (trigger) trigger.remove();
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) dropdown.remove();
    return;
  }

  const topbar = document.querySelector('.dash-topbar');
  if (!topbar) return;

  const rightNavGroup = topbar.querySelector('div[style*="display: flex"]') || topbar.children[1] || topbar;
  if (!rightNavGroup) return;

  // Insert notification button if not present
  if (!document.getElementById('notif-trigger')) {
    const themeBtn = rightNavGroup.querySelector('.theme-toggle-pill');
    const notifBtn = document.createElement('button');
    notifBtn.className = 'menu-pill-btn notif-trigger-btn';
    notifBtn.id = 'notif-trigger';
    notifBtn.title = 'Notifications / التنبيهات';
    notifBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#7c6cf0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display: block; margin: auto; stroke: #7c6cf0;">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span class="notif-red-dot" id="notif-red-dot"></span>
    `;

    if (themeBtn) {
      rightNavGroup.insertBefore(notifBtn, themeBtn);
    } else {
      rightNavGroup.prepend(notifBtn);
    }
  }

  // Insert dropdown drawer if not present
  if (!document.getElementById('notif-dropdown')) {
    const dropdown = document.createElement('div');
    dropdown.className = 'notif-dropdown';
    dropdown.id = 'notif-dropdown';
    dropdown.innerHTML = `
      <div class="notif-header">
        <div class="notif-header-title">
          <span id="notif-header-title-text">التنبيهات والإشعارات</span>
          <span class="notif-badge-count" id="notif-badge-count">0</span>
        </div>
        <button class="notif-clear-btn" id="notif-clear-btn" onclick="clearAllNotificationsList(event)">تفريغ الكل</button>
      </div>
      <div class="notif-body" id="notif-list-container"></div>
    `;
    topbar.appendChild(dropdown);
  }

  // Toggle Dropdown Event
  const triggerBtn = document.getElementById('notif-trigger');
  const dropdownEl = document.getElementById('notif-dropdown');

  if (triggerBtn && dropdownEl) {
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = dropdownEl.classList.contains('active');
      
      // Close hamburger drawer if open
      const hamDrawer = document.getElementById('hamburger-drawer');
      const hamOverlay = document.getElementById('hamburger-overlay');
      if (hamDrawer) hamDrawer.classList.remove('active');
      if (hamOverlay) hamOverlay.classList.remove('active');

      if (!isActive) {
        dropdownEl.classList.add('active');
        // Mark all as read when opening dropdown
        let list = getStoredNotifications();
        list.forEach(n => n.unread = false);
        localStorage.setItem('baseera_notifications_list', JSON.stringify(list));
        renderNotificationUI();
      } else {
        dropdownEl.classList.remove('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (!dropdownEl.contains(e.target) && e.target !== triggerBtn && !triggerBtn.contains(e.target)) {
        dropdownEl.classList.remove('active');
      }
    });
  }

  renderNotificationUI();
}

// ---------- 14-Day Free Trial Dynamic Countdown System ----------
function initFreeTrialCountdown() {
  const isSubscribed = localStorage.getItem('baseera_subscribed') === 'true';
  const subscribedPlan = localStorage.getItem('baseera_subscribed_plan');

  let regDateStr = localStorage.getItem('baseera_registration_date');
  if (!regDateStr) {
    regDateStr = new Date().toISOString();
    localStorage.setItem('baseera_registration_date', regDateStr);
  }

  const regDate = new Date(regDateStr);
  const now = new Date();
  const elapsedMs = now.getTime() - regDate.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const totalTrialDays = 14;
  const daysRemaining = Math.max(0, totalTrialDays - elapsedDays);
  const progressPercent = Math.min(100, Math.max(0, (daysRemaining / totalTrialDays) * 100));

  const isAr = (localStorage.getItem('baseera-lang') || 'en') === 'ar';

  const badgeEl = document.getElementById('trial-badge-text');
  const subTextEl = document.getElementById('trial-sub-text');
  const progressBarEl = document.getElementById('trial-progress-bar');
  const cardEl = document.getElementById('trial-countdown-card');
  const trialHeaderEl = document.querySelector('[data-i18n="trialHeader"]');

  if (isSubscribed && subscribedPlan) {
    if (badgeEl) {
      badgeEl.textContent = isAr ? 'نشط' : 'Active';
      badgeEl.style.background = 'rgba(16, 185, 129, 0.2)';
      badgeEl.style.color = '#059669';
    }
    if (subTextEl) {
      subTextEl.textContent = isAr ? `مشترك في باقة ${subscribedPlan}` : `Subscribed to ${subscribedPlan} Plan`;
    }
    if (progressBarEl) {
      progressBarEl.style.width = '100%';
      progressBarEl.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    }
    if (trialHeaderEl) {
      trialHeaderEl.textContent = isAr ? `باقة ${subscribedPlan}` : `${subscribedPlan} Plan`;
    }
    return;
  }

  if (daysRemaining > 0) {
    if (badgeEl) {
      badgeEl.textContent = isAr ? `${daysRemaining} يوماً` : `${daysRemaining} Days`;
      badgeEl.style.background = 'rgba(16, 185, 129, 0.15)';
      badgeEl.style.color = '#059669';
    }
    if (subTextEl) {
      subTextEl.textContent = isAr 
        ? `متبقي ${daysRemaining} يوماً في الفترة التجريبية` 
        : `${daysRemaining} days remaining on free trial`;
    }
    if (progressBarEl) {
      progressBarEl.style.width = `${progressPercent}%`;
      progressBarEl.style.background = 'linear-gradient(90deg, #2b2470 0%, #7c6cf0 100%)';
    }
  } else {
    if (badgeEl) {
      badgeEl.textContent = isAr ? 'انتهت التجربة' : 'Expired';
      badgeEl.style.background = 'rgba(239, 68, 68, 0.2)';
      badgeEl.style.color = '#dc2626';
    }
    if (subTextEl) {
      subTextEl.textContent = isAr 
        ? 'انتهت الفترة التجريبية (14 يوماً). اختر إحدى الباقتين للترقية!' 
        : 'Free trial ended (14 days). Choose a package to upgrade!';
      subTextEl.style.color = '#dc2626';
      subTextEl.style.fontWeight = '800';
    }
    if (progressBarEl) {
      progressBarEl.style.width = '0%';
      progressBarEl.style.background = '#ef4444';
    }
    if (cardEl) {
      cardEl.style.border = '1.5px solid #fecaca';
      cardEl.style.background = '#fef2f2';
      cardEl.style.cursor = 'pointer';
      cardEl.onclick = () => window.location.href = 'pricing.html';
    }

    // Show Expired Upgrade Prompt if on dashboard or main view
    showTrialExpiredModal();
  }
}

function showTrialExpiredModal() {
  if (document.getElementById('trial-expired-modal')) return;
  const path = window.location.pathname.toLowerCase();
  if (path.includes('pricing') || path.includes('login') || path.includes('register')) return;

  const isAr = (localStorage.getItem('baseera-lang') || 'en') === 'ar';
  const modal = document.createElement('div');
  modal.id = 'trial-expired-modal';
  modal.className = 'modal-overlay open';
  modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(8px); z-index: 99999; align-items: center; justify-content: center; padding: 20px;';

  modal.innerHTML = `
    <div style="background: #ffffff; border-radius: 1.5rem; max-width: 380px; width: 100%; padding: 24px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.3); border: 2px solid #6366f1;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <h3 style="font-size: 1.15rem; font-weight: 900; color: #1e293b; margin-bottom: 8px;">
        ${isAr ? 'انتهت الفترة التجريبية (14 يوماً)' : '14-Day Free Trial Expired'}
      </h3>
      <p style="font-size: 0.8rem; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
        ${isAr 
          ? 'لقد انتهت فترة التجربة المجانية لمشروعك. للمتابعة والوصول لكافة تحليلات الذكاء الاصطناعي، يرجى ترقية حسابك واختيار إحدى باقتي الاشتراك (البداية 7 ر.ع. أو النمو 20 ر.ع.).' 
          : 'Your 14-day free trial has expired. To continue using AI analytics and insights, please choose one of our 2 subscription packages (Starter or Growth).'}
      </p>
      <button onclick="window.location.href=\'pricing.html\'" style="width: 100%; padding: 12px; border-radius: 12px; border: none; background: linear-gradient(135deg, #2b2470 0%, #7c6cf0 100%); color: white; font-weight: 800; font-size: 0.88rem; cursor: pointer; box-shadow: 0 4px 15px rgba(124, 108, 240, 0.4);">
        ${isAr ? 'اختيار إحدى الباقتين والترقية 🚀' : 'Choose Package & Upgrade 🚀'}
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

// Dev helper to easily set trial days remaining
window.setTrialDaysLeft = function(days) {
  const d = new Date();
  d.setDate(d.getDate() - (14 - days));
  localStorage.setItem('baseera_registration_date', d.toISOString());
  localStorage.removeItem('baseera_subscribed');
  localStorage.removeItem('baseera_subscribed_plan');
  initFreeTrialCountdown();
};

document.addEventListener('DOMContentLoaded', initFreeTrialCountdown);
document.addEventListener('langChanged', initFreeTrialCountdown);

// ---------- Privacy Mode (Masking Sensitive Numbers) System ----------
const EYE_VISIBLE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#7c6cf0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="display: block; margin: auto; width: 18px; height: 18px;"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

const EYE_INVISIBLE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="display: block; margin: auto; width: 18px; height: 18px;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

function getPrivacyMode() {
  const val = localStorage.getItem('baseera_privacy_mode');
  if (val === null) return true; // Default state on every page is HIDDEN/MASKED
  return val === 'true';
}

function updatePrivacyToggleUI(isPrivate) {
  document.querySelectorAll('.privacy-toggle-btn').forEach((btn) => {
    btn.innerHTML = isPrivate ? EYE_INVISIBLE_SVG : EYE_VISIBLE_SVG;
    btn.title = isPrivate ? 'Privacy Mode Active (Numbers Hidden)' : 'Privacy Mode Inactive (Numbers Visible)';
  });
  if (isPrivate) {
    document.documentElement.classList.add('privacy-mode-active');
  } else {
    document.documentElement.classList.remove('privacy-mode-active');
  }
}

function togglePrivacyMode() {
  const current = getPrivacyMode();
  const next = !current;
  localStorage.setItem('baseera_privacy_mode', next ? 'true' : 'false');
  updatePrivacyToggleUI(next);
}

function initPrivacyToggleSystem() {
  const isPrivate = getPrivacyMode();
  const currentPath = window.location.pathname.toLowerCase();
  
  // Show Privacy Eye toggle ONLY on Dashboard and Insights pages
  const isTargetPage = currentPath.includes('dashboard.html') || 
                       currentPath.includes('insights.html') || 
                       currentPath === '/' || 
                       currentPath.endsWith('/');

  if (!isTargetPage) {
    // Remove any privacy toggle buttons on datasets, reports, etc.
    document.querySelectorAll('.privacy-toggle-btn').forEach((btn) => btn.remove());
    if (isPrivate) {
      document.documentElement.classList.add('privacy-mode-active');
    }
    return;
  }

  const topbars = document.querySelectorAll('.dash-header, .dash-topbar, .insights-topbar');

  topbars.forEach((topbar) => {
    let targetGroup = topbar.querySelector('.topbar-right-group') || topbar.querySelector('.right-actions');
    if (!targetGroup) return;

    if (!topbar.querySelector('.privacy-toggle-btn')) {
      const notifBtn = targetGroup.querySelector('.notif-trigger-btn');
      const themeBtn = targetGroup.querySelector('.theme-toggle-pill');
      const privacyBtn = document.createElement('button');
      privacyBtn.className = 'menu-pill-btn privacy-toggle-btn';
      privacyBtn.id = 'privacy-toggle';
      privacyBtn.style.position = 'relative';
      privacyBtn.style.cursor = 'pointer';
      privacyBtn.innerHTML = isPrivate ? EYE_INVISIBLE_SVG : EYE_VISIBLE_SVG;
      privacyBtn.title = isPrivate ? 'Privacy Mode Active (Numbers Hidden)' : 'Privacy Mode Inactive (Numbers Visible)';

      if (notifBtn) {
        targetGroup.insertBefore(privacyBtn, notifBtn);
      } else if (themeBtn) {
        targetGroup.insertBefore(privacyBtn, themeBtn);
      } else {
        targetGroup.appendChild(privacyBtn);
      }
    }
  });

  document.querySelectorAll('.privacy-toggle-btn').forEach((btn) => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePrivacyMode();
      });
    }
  });

  updatePrivacyToggleUI(isPrivate);
}
