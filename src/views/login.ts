import { layout } from './layout';

export function loginPage(error?: string, email?: string): string {
  const content = `
    <div class="card" style="max-width: 400px; margin: 2rem auto;">
        <div class="card-header">
            <h2>Login</h2>
        </div>
        <div class="card-body">
            ${error ? `<div class="alert alert-error" id="error-alert">${error}</div>` : ''}
            <form method="POST" action="/login" id="login-form" novalidate>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" value="${email || ''}"
                           required autocomplete="email" aria-describedby="email-error"
                           placeholder="Enter your email address">
                    <div id="email-error" class="field-error" style="display: none;"></div>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password"
                           required autocomplete="current-password" aria-describedby="password-error"
                           placeholder="Enter your password">
                    <div id="password-error" class="field-error" style="display: none;"></div>
                </div>
                <button type="submit" class="btn" style="width: 100%;" id="login-btn">
                    <span id="login-text">Login</span>
                    <span id="login-spinner" style="display: none;">Logging in...</span>
                </button>
            </form>
            <p style="margin-top: 1rem; text-align: center;">
                Don't have an account? <a href="/register">Register here</a>
            </p>
        </div>
    </div>

    <style>
        .field-error {
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .input-error {
            border-color: #dc2626 !important;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
    </style>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('login-form');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const loginBtn = document.getElementById('login-btn');
            const loginText = document.getElementById('login-text');
            const loginSpinner = document.getElementById('login-spinner');

            // Clear previous errors on input
            function clearFieldError(field) {
                const errorDiv = document.getElementById(field + '-error');
                const input = document.getElementById(field);
                errorDiv.style.display = 'none';
                input.classList.remove('input-error');
            }

            function showFieldError(field, message) {
                const errorDiv = document.getElementById(field + '-error');
                const input = document.getElementById(field);
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                input.classList.add('input-error');
            }

            emailInput.addEventListener('input', () => clearFieldError('email'));
            passwordInput.addEventListener('input', () => clearFieldError('password'));

            form.addEventListener('submit', function(e) {
                let hasErrors = false;

                // Clear all errors
                clearFieldError('email');
                clearFieldError('password');

                // Validate email
                if (!emailInput.value.trim()) {
                    showFieldError('email', 'Email is required');
                    hasErrors = true;
                } else if (!isValidEmail(emailInput.value)) {
                    showFieldError('email', 'Please enter a valid email address');
                    hasErrors = true;
                }

                // Validate password
                if (!passwordInput.value.trim()) {
                    showFieldError('password', 'Password is required');
                    hasErrors = true;
                }

                if (hasErrors) {
                    e.preventDefault();
                    return false;
                }

                // Show loading state
                loginBtn.classList.add('loading');
                loginText.style.display = 'none';
                loginSpinner.style.display = 'inline';
            });

            function isValidEmail(email) {
                const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                return emailRegex.test(email);
            }

            // Auto-focus email field
            emailInput.focus();

            // Hide error alert after 5 seconds
            const errorAlert = document.getElementById('error-alert');
            if (errorAlert) {
                setTimeout(() => {
                    errorAlert.style.display = 'none';
                }, 5000);
            }
        });
    </script>
  `;

  return layout('Login', content);
}

export function registerPage(error?: string, name?: string, email?: string): string {
  const content = `
    <div class="card" style="max-width: 400px; margin: 2rem auto;">
        <div class="card-header">
            <h2>Create Account</h2>
        </div>
        <div class="card-body">
            ${error ? `<div class="alert alert-error" id="error-alert">${error}</div>` : ''}
            <form method="POST" action="/register" id="register-form" novalidate>
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" value="${name || ''}"
                           required autocomplete="name" aria-describedby="name-error"
                           placeholder="Enter your full name">
                    <div id="name-error" class="field-error" style="display: none;"></div>
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" value="${email || ''}"
                           required autocomplete="email" aria-describedby="email-error"
                           placeholder="Enter your email address">
                    <div id="email-error" class="field-error" style="display: none;"></div>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password"
                           required autocomplete="new-password" aria-describedby="password-error"
                           minlength="6" placeholder="Choose a secure password">
                    <div id="password-error" class="field-error" style="display: none;"></div>
                    <div class="password-strength" id="password-strength" style="margin-top: 0.5rem;">
                        <div class="strength-meter" style="height: 4px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
                            <div id="strength-bar" style="height: 100%; width: 0%; transition: width 0.3s, background-color 0.3s;"></div>
                        </div>
                        <div class="strength-text" id="strength-text" style="font-size: 0.8rem; margin-top: 0.25rem; color: #6b7280;">
                            Password must be at least 6 characters
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn" style="width: 100%;" id="register-btn">
                    <span id="register-text">Create Account</span>
                    <span id="register-spinner" style="display: none;">Creating account...</span>
                </button>
            </form>
            <p style="margin-top: 1rem; text-align: center;">
                Already have an account? <a href="/login">Login here</a>
            </p>
        </div>
    </div>

    <style>
        .field-error {
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        .input-error {
            border-color: #dc2626 !important;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
    </style>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('register-form');
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const registerBtn = document.getElementById('register-btn');
            const registerText = document.getElementById('register-text');
            const registerSpinner = document.getElementById('register-spinner');
            const strengthBar = document.getElementById('strength-bar');
            const strengthText = document.getElementById('strength-text');

            // Clear previous errors on input
            function clearFieldError(field) {
                const errorDiv = document.getElementById(field + '-error');
                const input = document.getElementById(field);
                if (errorDiv) errorDiv.style.display = 'none';
                if (input) input.classList.remove('input-error');
            }

            function showFieldError(field, message) {
                const errorDiv = document.getElementById(field + '-error');
                const input = document.getElementById(field);
                if (errorDiv) {
                    errorDiv.textContent = message;
                    errorDiv.style.display = 'block';
                }
                if (input) input.classList.add('input-error');
            }

            nameInput.addEventListener('input', () => clearFieldError('name'));
            emailInput.addEventListener('input', () => clearFieldError('email'));
            passwordInput.addEventListener('input', () => {
                clearFieldError('password');
                updatePasswordStrength();
            });

            function updatePasswordStrength() {
                const password = passwordInput.value;
                let strength = 0;
                let text = '';
                let color = '#ef4444';

                if (password.length >= 6) strength += 1;
                if (password.match(/[a-z]/)) strength += 1;
                if (password.match(/[A-Z]/)) strength += 1;
                if (password.match(/[0-9]/)) strength += 1;
                if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

                const percentage = (strength / 5) * 100;

                if (password.length === 0) {
                    text = 'Password must be at least 6 characters';
                    color = '#6b7280';
                } else if (strength <= 2) {
                    text = 'Weak password';
                    color = '#ef4444';
                } else if (strength <= 3) {
                    text = 'Fair password';
                    color = '#f59e0b';
                } else if (strength <= 4) {
                    text = 'Good password';
                    color = '#10b981';
                } else {
                    text = 'Strong password';
                    color = '#059669';
                }

                strengthBar.style.width = percentage + '%';
                strengthBar.style.backgroundColor = color;
                strengthText.textContent = text;
                strengthText.style.color = color;
            }

            form.addEventListener('submit', function(e) {
                let hasErrors = false;

                // Clear all errors
                clearFieldError('name');
                clearFieldError('email');
                clearFieldError('password');

                // Validate name
                if (!nameInput.value.trim()) {
                    showFieldError('name', 'Name is required');
                    hasErrors = true;
                } else if (nameInput.value.trim().length < 2) {
                    showFieldError('name', 'Name must be at least 2 characters');
                    hasErrors = true;
                }

                // Validate email
                if (!emailInput.value.trim()) {
                    showFieldError('email', 'Email is required');
                    hasErrors = true;
                } else if (!isValidEmail(emailInput.value)) {
                    showFieldError('email', 'Please enter a valid email address');
                    hasErrors = true;
                }

                // Validate password
                if (!passwordInput.value.trim()) {
                    showFieldError('password', 'Password is required');
                    hasErrors = true;
                } else if (passwordInput.value.length < 6) {
                    showFieldError('password', 'Password must be at least 6 characters');
                    hasErrors = true;
                }

                if (hasErrors) {
                    e.preventDefault();
                    return false;
                }

                // Show loading state
                registerBtn.classList.add('loading');
                registerText.style.display = 'none';
                registerSpinner.style.display = 'inline';
            });

            function isValidEmail(email) {
                const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                return emailRegex.test(email);
            }

            // Auto-focus name field
            nameInput.focus();

            // Hide error alert after 5 seconds
            const errorAlert = document.getElementById('error-alert');
            if (errorAlert) {
                setTimeout(() => {
                    errorAlert.style.display = 'none';
                }, 5000);
            }
        });
    </script>
  `;

  return layout('Register', content);
}