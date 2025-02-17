class PasswordGenerator {
  constructor() {

    this.domElements = {
      passwordInput: document.getElementById('password'),
      lengthInput: document.getElementById('length'),
      uppercaseToggle: document.getElementById('uppercase'),
      lowercaseToggle: document.getElementById('lowercase'),
      numbersToggle: document.getElementById('numbers'),
      symbolsToggle: document.getElementById('symbols'),
      generateBtn: document.getElementById('generate'),
      copyBtn: document.getElementById('copy'),
      strengthBars: document.getElementById('strength-bars').children,
      passwordHistory: document.getElementById('password-history'),
      themeToggle: document.querySelector('.input')
    };


    this.initializeEventListeners();
    

    this.passwordHistory = [];
    

    this.initializeTheme();
    

    this.generatePassword();
  }

  initializeEventListeners() {
    this.domElements.generateBtn.addEventListener('click', () => {
      this.addButtonRipple(this.domElements.generateBtn);
      this.generatePassword();
    });
    this.domElements.copyBtn.addEventListener('click', () => this.copyToClipboard());
    this.domElements.passwordInput.addEventListener('click', () => this.copyToClipboard());
    this.domElements.themeToggle.addEventListener('change', () => this.toggleTheme());
  }

  addButtonRipple(button) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');

    // Ensure button stays same size and prevents overflow issues
    button.style.position = 'relative';
    button.style.overflow = 'hidden';

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    // Set ripple size and position
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.position = 'absolute';
    ripple.style.top = '50%';
    ripple.style.left = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.pointerEvents = 'none'; // Ensure it doesn't interfere with button clicks

    // Apply animation
    ripple.style.animation = 'ripple-animation 0.6s linear';

    button.appendChild(ripple);

    // Ensure ripple disappears after animation
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }


  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.domElements.themeToggle.checked = savedTheme === 'dark';
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  generatePassword() {
    const length = parseInt(this.domElements.lengthInput.value);
    const hasUpper = this.domElements.uppercaseToggle.checked;
    const hasLower = this.domElements.lowercaseToggle.checked;
    const hasNumbers = this.domElements.numbersToggle.checked;
    const hasSymbols = this.domElements.symbolsToggle.checked;

    if (!hasUpper && !hasLower && !hasNumbers && !hasSymbols) {
      this.showNotification('Please select at least one option!', 'error');
      return;
    }

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    let password = '';

    if (hasUpper) {
      chars += uppercase;
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
    }
    if (hasLower) {
      chars += lowercase;
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
    }
    if (hasNumbers) {
      chars += numbers;
      password += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (hasSymbols) {
      chars += symbols;
      password += symbols[Math.floor(Math.random() * symbols.length)];
    }


    while (password.length < length) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    this.domElements.passwordInput.value = password;
    this.addToHistory(password);
    this.checkPasswordStrength(password);

    this.domElements.passwordInput.classList.remove('fade-in');
    void this.domElements.passwordInput.offsetWidth; // Trigger reflow
    this.domElements.passwordInput.classList.add('fade-in');
  }

  async copyToClipboard() {
    const password = this.domElements.passwordInput.value;
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      this.showNotification('Password copied to clipboard!', 'success');
      

      this.domElements.copyBtn.classList.add('copied');
      setTimeout(() => {
        this.domElements.copyBtn.classList.remove('copied');
      }, 1000);
    } catch (err) {
      this.showNotification('Failed to copy password!', 'error');
    }
  }

  addToHistory(password) {
    this.passwordHistory.unshift(password);
    if (this.passwordHistory.length > 5) {
      this.passwordHistory.pop();
    }
    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    this.domElements.passwordHistory.innerHTML = '';
    this.passwordHistory.forEach((pass, index) => {
      const li = document.createElement('li');
      li.textContent = pass;
      li.style.animationDelay = `${index * 0.1}s`;
      li.classList.add('fade-in');
      
      li.addEventListener('click', () => {
        this.domElements.passwordInput.value = pass;
        this.copyToClipboard();
      });
      
      this.domElements.passwordHistory.appendChild(li);
    });
  }

  // Check password strength with animated feedback
  checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    // Reset bars
    Array.from(this.domElements.strengthBars).forEach(bar => {
      bar.className = 'bar';
    });

    // Animate bars with delay
    setTimeout(() => {
      Array.from(this.domElements.strengthBars).forEach((bar, index) => {
        if (index < strength) {
          setTimeout(() => {
            bar.classList.add(strength <= 2 ? 'weak' : strength <= 3 ? 'medium' : 'strong');
          }, index * 100);
        }
      });
    }, 100);
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'notification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem';
    notification.style.backgroundColor = type === 'success' ? '#198754' : '#dc3545';
    notification.style.color = 'white';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2700);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PasswordGenerator();
});