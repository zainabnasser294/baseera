// ---------- Password show/hide toggles ----------
const EYE_OPEN_SVG = '<svg viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>';
const EYE_CLOSED_SVG = '<svg viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

document.querySelectorAll('.toggle-password').forEach((btn) => {
  btn.innerHTML = EYE_CLOSED_SVG;
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = isHidden ? EYE_OPEN_SVG : EYE_CLOSED_SVG;
  });
});

// ---------- Loading overlay with connectivity check ----------
// Used only at real "connecting to the next page" moments (sign in,
// create account) — not on every click. If the browser reports no
// internet connection, we stop and show an error instead of
// navigating, so the user isn't dropped onto a broken next screen.
function ensureLoadingOverlay() {
  let overlay = document.getElementById('app-loading-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'app-loading-overlay';
  overlay.className = 'loading-overlay';
  overlay.innerHTML =
    '<div class="loading-spinner">' +
    '  <img src="images/logo-cropped.png" alt="Baseera Logo" class="loading-logo-img">' +
    '</div>';

  const shell = document.querySelector('.app-shell, .page, .entry-shell') || document.body;
  shell.appendChild(overlay);
  return overlay;
}

function showLoadingOverlay() {
  hideConnectionErrorOverlay();
  const overlay = ensureLoadingOverlay();
  overlay.classList.add('show');
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('app-loading-overlay');
  if (overlay) overlay.classList.remove('show');
}

function ensureConnectionErrorOverlay() {
  let overlay = document.getElementById('app-connection-error-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'app-connection-error-overlay';
  overlay.className = 'connection-error-overlay';
  
  const isAr = (document.documentElement.getAttribute('lang') || 'en') === 'ar';
  
  overlay.innerHTML =
    '<div class="broken-logo-wrapper">' +
    '  <img src="images/logo-cropped.png" class="broken-logo-half broken-logo-top" alt="Baseera">' +
    '  <img src="images/logo-cropped.png" class="broken-logo-half broken-logo-bottom" alt="Baseera">' +
    '  <div class="broken-logo-sad-face">' +
    '    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">' +
    '      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
    '      <circle cx="9" cy="9.5" r="1" fill="currentColor"/>' +
    '      <circle cx="15" cy="9.5" r="1" fill="currentColor"/>' +
    '      <path d="M9 16c.8-1 2.2-1.5 3-1.5s2.2.5 3 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '    </svg>' +
    '  </div>' +
    '</div>' +
    '<div class="connection-error-title" id="connection-error-title">' + (isAr ? 'هناك مشكلة في الاتصال' : 'Connection Error') + '</div>' +
    '<div class="connection-error-subtitle" id="connection-error-subtitle">' + (isAr ? 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى' : 'Check your internet connection and try again.') + '</div>' +
    '<button class="connection-retry-btn" id="connection-retry-btn">' + (isAr ? 'إعادة المحاولة' : 'Retry') + '</button>';

  const shell = document.querySelector('.app-shell, .page, .entry-shell') || document.body;
  shell.appendChild(overlay);

  document.getElementById('connection-retry-btn').addEventListener('click', () => {
    hideConnectionErrorOverlay();
    if (window._connectionRetryCallback) {
      window._connectionRetryCallback();
    } else {
      location.reload();
    }
  });

  return overlay;
}

function showConnectionErrorOverlay(retryCallback) {
  hideLoadingOverlay();
  window._connectionRetryCallback = retryCallback || null;
  const overlay = ensureConnectionErrorOverlay();
  const isAr = (document.documentElement.getAttribute('lang') || 'en') === 'ar';
  document.getElementById('connection-error-title').textContent = isAr ? 'هناك مشكلة في الاتصال' : 'Connection Error';
  document.getElementById('connection-error-subtitle').textContent = isAr ? 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى' : 'Check your internet connection and try again.';
  document.getElementById('connection-retry-btn').textContent = isAr ? 'إعادة المحاولة' : 'Retry';
  overlay.classList.add('show');
}

function hideConnectionErrorOverlay() {
  const overlay = document.getElementById('app-connection-error-overlay');
  if (overlay) overlay.classList.remove('show');
}

function navigateWithConnectivityCheck(url) {
  const isAr = (document.documentElement.getAttribute('lang') || 'en') === 'ar';
  if (!navigator.onLine) {
    showConnectionErrorOverlay(() => navigateWithConnectivityCheck(url));
    return;
  }
  showLoadingOverlay(isAr ? 'جاري التحميل...' : 'Connecting...');
  setTimeout(() => {
    window.location.href = url;
  }, 400);
}

// ---------- Form validation ----------
const form = document.getElementById('signup-form');

const REG_ERRORS = {
  en: {
    ownerName: 'Please enter the owner name.',
    businessName: 'Please enter the business name.',
    crName: 'Please enter the CR name.',
    emailRequired: 'Please enter an email address.',
    emailInvalid: 'Please enter a valid email address.',
    phone: 'Please enter a phone number.',
    passwordRequired: 'Please enter a password.',
    passwordLength: 'Password must be at least 8 characters.',
    confirmRequired: 'Please confirm your password.',
    confirmMismatch: 'Passwords do not match.',
    terms: 'You must agree to the terms and privacy policy.'
  },
  ar: {
    ownerName: 'الرجاء إدخال اسم المالك.',
    businessName: 'الرجاء إدخال اسم النشاط التجاري.',
    crName: 'الرجاء إدخال اسم السجل التجاري.',
    emailRequired: 'الرجاء إدخال البريد الإلكتروني.',
    emailInvalid: 'الرجاء إدخال بريد إلكتروني صحيح.',
    phone: 'الرجاء إدخال رقم الهاتف.',
    passwordRequired: 'الرجاء إدخال كلمة المرور.',
    passwordLength: 'يجب ألا تقل كلمة المرور عن 8 أحرف.',
    confirmRequired: 'الرجاء تأكيد كلمة المرور.',
    confirmMismatch: 'كلمتا المرور غير متطابقتين.',
    terms: 'يجب الموافقة على الشروط وسياسة الخصوصية.'
  }
};

function regErr(key) {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  return (REG_ERRORS[lang] || REG_ERRORS.en)[key];
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let isValid = true;

    const ownerName = document.getElementById('owner-name');
    const businessName = document.getElementById('business-name');
    const crName = document.getElementById('cr-name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const terms = document.getElementById('terms');

    if (!ownerName.value.trim()) {
      showError('owner-name', regErr('ownerName'));
      isValid = false;
    }

    if (!businessName.value.trim()) {
      showError('business-name', regErr('businessName'));
      isValid = false;
    }

    if (!crName.value.trim()) {
      showError('cr-name', regErr('crName'));
      isValid = false;
    }

    if (!email.value.trim()) {
      showError('email', regErr('emailRequired'));
      isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError('email', regErr('emailInvalid'));
      isValid = false;
    }

    if (!phone.value.trim()) {
      showError('phone', regErr('phone'));
      isValid = false;
    }

    if (!password.value) {
      showError('password', regErr('passwordRequired'));
      isValid = false;
    } else if (password.value.length < 8) {
      showError('password', regErr('passwordLength'));
      isValid = false;
    }

    if (!confirmPassword.value) {
      showError('confirm-password', regErr('confirmRequired'));
      isValid = false;
    } else if (confirmPassword.value !== password.value) {
      showError('confirm-password', regErr('confirmMismatch'));
      isValid = false;
    }

    if (!terms.checked) {
      showError('terms', regErr('terms'));
      isValid = false;
    }

    if (isValid) {
      const isAr = (localStorage.getItem('baseera-lang') || document.documentElement.getAttribute('lang') || 'en') === 'ar';
      
      const payload = {
        username: ownerName.value.trim(),
        email: email.value.trim(),
        password: password.value,
        business_name: businessName ? businessName.value.trim() : '',
        cr_name: crName ? crName.value.trim() : '',
        phone: phone ? phone.value.trim() : ''
      };

      // Save locally immediately
      localStorage.setItem('basira_username', payload.username);
      localStorage.setItem('basira_email', payload.email);
      localStorage.setItem('basira_password', payload.password);
      localStorage.setItem('basira_business_name', payload.business_name);
      localStorage.setItem('basira_cr_number', payload.cr_name);
      localStorage.setItem('basira_phone_number', payload.phone);
      localStorage.setItem('baseera_registration_date', new Date().toISOString());

      // Attempt backend API call asynchronously
      fetch('http://127.0.0.1:8000/api/mobile/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' || data.status === 'ok') {
          navigateWithConnectivityCheck('account-created.html');
        } else if (data.message && data.message.includes('exists')) {
          showError('email', isAr ? 'البريد الإلكتروني مسجل بالفعل' : 'Email address or username is already registered');
        } else {
          // Proceed using local registration fallback
          navigateWithConnectivityCheck('account-created.html');
        }
      })
      .catch(err => {
        // Network offline or CORS blocked -> Proceed with local account creation fallback
        console.log('Registration proceeding with local storage session:', err);
        navigateWithConnectivityCheck('account-created.html');
      });
    }
  });
}

function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + '-error');
  if (input && input.tagName === 'INPUT') {
    input.classList.add('field-error');
  }
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach((el) => el.classList.remove('field-error'));
  document.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
