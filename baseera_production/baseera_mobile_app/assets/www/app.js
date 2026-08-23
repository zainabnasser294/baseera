// ---------- Shared UI helpers used across the app ----------

function showToast(message, duration = 2500) {
  let toastEl = document.getElementById('app-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'app-toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastEl._hideTimer);
  toastEl._hideTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) dropdown.classList.toggle('open');
}

function closeDropdownOnOutsideClick(dropdownId, triggerId) {
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById(dropdownId);
    const trigger = document.getElementById(triggerId);
    if (!dropdown || !dropdown.classList.contains('open')) return;
    if (dropdown.contains(e.target) || (trigger && trigger.contains(e.target))) return;
    dropdown.classList.remove('open');
  });
}

// Shared logout confirmation wiring.
// Call setupLogout() on any page that includes the logout modal markup
// with id="logout-modal" and a trigger element with id="logout-trigger".
function setupLogout(triggerId, redirectUrl) {
  const trigger = document.getElementById(triggerId);
  const modal = document.getElementById('logout-modal');
  const cancelBtn = document.getElementById('logout-cancel');
  const confirmBtn = document.getElementById('logout-confirm');

  if (trigger) {
    trigger.addEventListener('click', () => {
      const hamburgerOverlay = document.getElementById('hamburger-overlay');
      const hamburgerDrawer = document.getElementById('hamburger-drawer');
      if (hamburgerOverlay) hamburgerOverlay.classList.remove('active');
      if (hamburgerDrawer) hamburgerDrawer.classList.remove('active');
      openModal('logout-modal');
    });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => closeModal('logout-modal'));
  }
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      localStorage.removeItem('basira_username');
      localStorage.removeItem('basira_email');
      localStorage.removeItem('basira_dataset');
      window.location.href = redirectUrl || 'logout-thankyou.html';
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal('logout-modal');
    });
  }
}


function toggleAgentsMenu(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  var container = document.getElementById('agents-sub-container');
  var arrow = document.getElementById('agents-menu-arrow');
  if (container) {
    var isHidden = (container.style.display === 'none' || !container.style.display);
    container.style.display = isHidden ? 'flex' : 'none';
    if (arrow) {
      arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }
}
window.toggleAgentsMenu = toggleAgentsMenu;
