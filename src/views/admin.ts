import { layout } from './layout';

export function codesPage(codes: any[], user?: any): string {
  const content = `
    <div class="card">
        <div class="card-header">
            <h2>Signup Codes Management</h2>
        </div>
        <div class="card-body">
            <p>Manage signup codes for user registration.</p>
            <p><a href="/admin" style="color: #2563eb; text-decoration: none;">← Back to Admin Dashboard</a></p>
        </div>
    </div>

    <div class="card" style="margin-top: 2rem;">
        <div class="card-header">
            <h3>Create New Code</h3>
        </div>
        <div class="card-body">
            <form method="POST" action="/admin/codes" style="max-width: 600px;">
                <div class="form-group">
                    <label for="code">Code</label>
                    <input type="text" id="code" name="code" required
                           placeholder="e.g., BETA2024" maxlength="50">
                    <small style="color: #6b7280;">Unique code that users will enter during registration</small>
                </div>
                <div class="form-group">
                    <label for="startDatetime">Start Date & Time</label>
                    <input type="datetime-local" id="startDatetime" name="startDatetime" required>
                    <small style="color: #6b7280;">When the code becomes active</small>
                </div>
                <div class="form-group">
                    <label for="endDatetime">End Date & Time</label>
                    <input type="datetime-local" id="endDatetime" name="endDatetime" required>
                    <small style="color: #6b7280;">When the code expires</small>
                </div>
                <div class="form-group">
                    <label for="type">Type</label>
                    <select id="type" name="type" required>
                        <option value="signup">Signup</option>
                    </select>
                    <small style="color: #6b7280;">Type of code - currently only signup is supported</small>
                </div>
                <div class="form-group">
                    <label for="target">Target Role</label>
                    <input type="text" id="target" name="target" required
                           placeholder="user" value="user">
                    <small style="color: #6b7280;">Role to assign to users who register with this code</small>
                </div>
                <button type="submit" class="btn">Create Code</button>
            </form>
        </div>
    </div>

    <div class="card" style="margin-top: 2rem;">
        <div class="card-header">
            <h3>Existing Codes</h3>
        </div>
        <div class="card-body">
            ${codes.length === 0 ? `
                <p>No codes found.</p>
            ` : `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Target</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Used By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${codes.map(code => {
                            const now = new Date();
                            const start = new Date(code.start_datetime);
                            const end = new Date(code.end_datetime);

                            let status = 'Active';
                            let statusColor = '#10b981';

                            if (code.used_at) {
                                status = 'Used';
                                statusColor = '#6b7280';
                            } else if (now < start) {
                                status = 'Pending';
                                statusColor = '#f59e0b';
                            } else if (now > end) {
                                status = 'Expired';
                                statusColor = '#ef4444';
                            }

                            return `
                                <tr>
                                    <td><code style="background: #f3f4f6; padding: 0.25rem; border-radius: 0.25rem;">${code.code}</code></td>
                                    <td>${code.type}</td>
                                    <td>${code.target}</td>
                                    <td>${start.toLocaleString()}</td>
                                    <td>${end.toLocaleString()}</td>
                                    <td>
                                        <span style="color: ${statusColor}; font-weight: 600;">
                                            ${status}
                                        </span>
                                    </td>
                                    <td>${code.used_at ? `Used on ${new Date(code.used_at).toLocaleString()}` : '-'}</td>
                                    <td>
                                        ${!code.used_at ? `
                                            <form method="POST" action="/admin/codes/${encodeURIComponent(code.code)}/delete"
                                                  style="display: inline;"
                                                  onsubmit="return confirm('Are you sure you want to delete this code?');">
                                                <button type="submit" class="btn btn-secondary"
                                                        style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">
                                                    Delete
                                                </button>
                                            </form>
                                        ` : '<span style="color: #6b7280;">-</span>'}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `}
        </div>
    </div>

    <style>
        small {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.875rem;
        }
        code {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        }
        .btn-secondary {
            background-color: #6b7280;
            color: white;
        }
        .btn-secondary:hover {
            background-color: #4b5563;
        }
    </style>

    <script>
        // Set default start time to now
        const now = new Date();
        const startInput = document.getElementById('startDatetime');
        const endInput = document.getElementById('endDatetime');

        // Format datetime for input
        const formatDateTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return \`\${year}-\${month}-\${day}T\${hours}:\${minutes}\`;
        };

        startInput.value = formatDateTime(now);

        // Set default end time to 30 days from now
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30);
        endInput.value = formatDateTime(endDate);
    </script>
  `;

  return layout('Codes Management', content, user);
}

export function adminPage(users: any[], roles: any[], user?: any): string {
  const content = `
    <div class="card">
        <div class="card-header">
            <h2>Admin Dashboard</h2>
        </div>
        <div class="card-body">
            <p>Welcome to the admin dashboard. Here you can manage users and their roles.</p>
            <div style="margin-top: 1rem;">
                <a href="/admin/codes" class="btn" style="display: inline-block; text-decoration: none;">
                    Manage Signup Codes
                </a>
            </div>
        </div>
    </div>

    <div class="card" style="margin-top: 2rem;">
        <div class="card-header">
            <h3>Add New User</h3>
        </div>
        <div class="card-body">
            <form method="POST" action="/admin/users" style="max-width: 500px;">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required minlength="6">
                </div>
                <div class="form-group">
                    <label for="role">Initial Role</label>
                    <select id="role" name="role" required>
                        ${roles.map(role => `
                            <option value="${role.id}">${role.name}</option>
                        `).join('')}
                    </select>
                </div>
                <button type="submit" class="btn">Add User</button>
            </form>
        </div>
    </div>

    <div class="card" style="margin-top: 2rem;">
        <div class="card-header">
            <h3>User Management</h3>
        </div>
        <div class="card-body">
            ${users.length === 0 ? `
                <p>No users found.</p>
            ` : `
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td>${u.id}</td>
                                <td>${u.name}</td>
                                <td>${u.email}</td>
                                <td>
                                    ${u.roles?.map((role: any) => `
                                        <span style="background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem; margin-right: 0.25rem;">
                                            ${role.name}
                                        </span>
                                    `).join('') || 'No roles'}
                                </td>
                                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                                        <form method="POST" action="/admin/users/${u.id}/toggle-role" style="display: inline;">
                                            <select name="role_id" required style="font-size: 0.8rem; padding: 0.25rem;">
                                                ${roles.map(role => `
                                                    <option value="${role.id}">${role.name}</option>
                                                `).join('')}
                                            </select>
                                            <button type="submit" name="action" value="add" class="btn" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">
                                                Add Role
                                            </button>
                                            <button type="submit" name="action" value="remove" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">
                                                Remove Role
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    </div>
  `;

  return layout('Admin Dashboard', content, user);
}