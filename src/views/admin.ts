import { layout } from './layout';

export function adminPage(users: any[], roles: any[], user?: any): string {
  const content = `
    <div class="card">
        <div class="card-header">
            <h2>Admin Dashboard</h2>
        </div>
        <div class="card-body">
            <p>Welcome to the admin dashboard. Here you can manage users and their roles.</p>
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