import { layout } from './layout';

export function homePage(user?: any, photos?: any[]): string {
  const content = `
    <div class="card">
        <div class="card-header">
            <h2>Welcome to Photo Blog</h2>
        </div>
        <div class="card-body">
            ${user ? `
                <p>Hello, <strong>${user.name}</strong>! Welcome back to your photo blog.</p>
                <div style="margin-top: 1rem;">
                    <a href="/upload" class="btn">Upload New Photo</a>
                    <a href="/feed" class="btn btn-secondary" style="margin-left: 0.5rem;">View All Photos</a>
                </div>
            ` : `
                <p>Share your amazing photos with the world! Join our community of photographers.</p>
                <div style="margin-top: 1rem;">
                    <a href="/register" class="btn">Get Started</a>
                    <a href="/login" class="btn btn-secondary" style="margin-left: 0.5rem;">Login</a>
                </div>
            `}
        </div>
    </div>

    ${photos && photos.length > 0 ? `
        <div class="card" style="margin-top: 2rem;">
            <div class="card-header">
                <h3>Recent Photos</h3>
            </div>
            <div class="card-body">
                <div class="photo-grid">
                    ${photos.slice(0, 6).map(photo => `
                        <div class="card photo-card">
                            <img src="${photo.url}" alt="${photo.title}">
                            <div class="card-body">
                                <h4>${photo.title}</h4>
                                <p style="color: #666; font-size: 0.9rem;">by ${photo.user_name}</p>
                                ${photo.description ? `<p style="margin-top: 0.5rem;">${photo.description}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${photos.length > 6 ? `
                    <div style="text-align: center; margin-top: 1rem;">
                        <a href="/feed" class="btn">View All Photos</a>
                    </div>
                ` : ''}
            </div>
        </div>
    ` : ''}
  `;

  return layout('Home', content, user);
}