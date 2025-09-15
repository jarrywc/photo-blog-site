import { layout } from './layout';

export function feedPage(posts: any[], standalonePhotos: any[], user?: any, userPhotos: any[] = []): string {
  const content = `
    <div class="card">
        <div class="card-header">
            <h2>Feed</h2>
            ${user ? `
                <div style="float: right; margin-top: -0.25rem;">
                    <a href="/upload" class="btn">Upload Photo</a>
                </div>
            ` : ''}
        </div>
        <div class="card-body">
            ${user ? `
                <div class="create-post-section" style="margin-bottom: 2rem; padding: 1.5rem; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">Create a Post</h3>
                    <form method="POST" action="/create-post" id="createPostForm">
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <input type="text" name="title" placeholder="What's on your mind?"
                                   style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem;"
                                   required>
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <textarea name="content" placeholder="Tell us more about it..." rows="3"
                                      style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem; resize: vertical;"></textarea>
                        </div>
                        ${userPhotos.length > 0 ? `
                            <div class="form-group" style="margin-bottom: 1rem;">
                                <details style="border: 1px solid #d1d5db; border-radius: 6px; padding: 0.5rem;">
                                    <summary style="cursor: pointer; font-weight: 500; padding: 0.5rem;">
                                        📷 Add Photos (${userPhotos.length} available)
                                    </summary>
                                    <div style="max-height: 200px; overflow-y: auto; margin-top: 0.5rem;">
                                        ${userPhotos.map(photo => `
                                            <label style="display: flex; align-items: center; margin-bottom: 0.5rem; cursor: pointer; padding: 0.25rem; border-radius: 4px; transition: background-color 0.2s;">
                                                <input type="checkbox" name="photos" value="${photo.id}"
                                                       style="width: auto; margin-right: 0.75rem;"
                                                       onchange="this.parentElement.style.backgroundColor = this.checked ? '#e0f2fe' : 'transparent'">
                                                <img src="${photo.url}" alt="${photo.title}"
                                                     style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 0.75rem;">
                                                <span style="font-size: 0.9rem;">${photo.title}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                </details>
                            </div>
                        ` : ''}
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <button type="submit" class="btn" style="padding: 0.5rem 1.5rem;">Post</button>
                            <span style="color: #6b7280; font-size: 0.9rem;">
                                ${userPhotos.length === 0 ? '<a href="/upload" style="color: #2563eb;">Upload photos</a> to include them in posts' : ''}
                            </span>
                        </div>
                    </form>
                </div>
            ` : ''}

            ${posts.length === 0 && standalonePhotos.length === 0 ? `
                <p style="text-align: center; color: #666; margin: 2rem 0;">
                    No posts or photos have been shared yet.
                    ${user ? '<br><a href="/upload">Be the first to share!</a>' : '<br><a href="/register">Join us to start sharing!</a>'}
                </p>
            ` : `
                <div class="feed-content">
                    ${posts.map(post => `
                        <div class="card post-card" style="margin-bottom: 2rem;">
                            <div class="card-body">
                                <div class="post-header" style="margin-bottom: 1rem;">
                                    <h3 style="margin: 0 0 0.5rem 0;">${post.title}</h3>
                                    <p style="color: #666; font-size: 0.9rem; margin: 0;">
                                        by ${post.user_name} • ${new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                ${post.content ? `<p style="margin: 1rem 0;">${post.content}</p>` : ''}

                                ${post.photos && post.photos.length > 0 ? `
                                    <div class="post-photos" style="margin: 1rem 0;">
                                        ${post.photos.length === 1 ? `
                                            <img src="${post.photos[0].url}" alt="${post.photos[0].title || post.title}"
                                                 style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;">
                                        ` : `
                                            <div class="photo-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                                ${post.photos.map((photo: any) => `
                                                    <img src="${photo.url}" alt="${photo.title || post.title}"
                                                         style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                                                `).join('')}
                                            </div>
                                        `}
                                    </div>
                                ` : ''}

                                <div class="post-actions" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                                    <div class="comments-section">
                                        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">Comments (${post.comments?.length || 0})</h4>
                                        ${post.comments && post.comments.length > 0 ? `
                                            <div class="comments-list" style="margin: 0.5rem 0;">
                                                ${post.comments.map((comment: any) => `
                                                    <div class="comment" style="margin: 0.5rem 0; padding: 0.5rem; background: #f9fafb; border-radius: 4px;">
                                                        <div style="font-weight: 500; font-size: 0.9rem; color: #374151;">${comment.user_name}</div>
                                                        <div style="font-size: 0.9rem; margin-top: 0.25rem;">${comment.content}</div>
                                                        <div style="font-size: 0.8rem; color: #6b7280; margin-top: 0.25rem;">
                                                            ${new Date(comment.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        ` : '<p style="color: #666; font-style: italic; margin: 0.5rem 0;">No comments yet.</p>'}

                                        ${user ? `
                                            <form method="POST" action="/posts/${post.id}/comment" style="margin-top: 1rem;">
                                                <div style="display: flex; gap: 0.5rem;">
                                                    <input type="text" name="content" placeholder="Add a comment..."
                                                           style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 4px;" required>
                                                    <button type="submit" class="btn" style="padding: 0.5rem 1rem;">Post</button>
                                                </div>
                                            </form>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}

                    ${standalonePhotos.length > 0 ? `
                        <div class="standalone-photos" style="margin-top: 2rem;">
                            <h3 style="margin-bottom: 1rem;">Individual Photos</h3>
                            <div class="photo-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                                ${standalonePhotos.map(photo => `
                                    <div class="card photo-card">
                                        <img src="${photo.url}" alt="${photo.title}" loading="lazy"
                                             style="width: 100%; height: 250px; object-fit: cover;">
                                        <div class="card-body">
                                            <h4 style="margin: 0 0 0.5rem 0;">${photo.title}</h4>
                                            <p style="color: #666; font-size: 0.9rem; margin: 0 0 0.5rem 0;">
                                                by ${photo.user_name} • ${new Date(photo.created_at).toLocaleDateString()}
                                            </p>
                                            ${photo.description ? `<p style="margin-top: 0.5rem;">${photo.description}</p>` : ''}
                                            ${user && (user.id === photo.user_id || user.roles?.some((r: any) => r.name === 'admin')) ? `
                                                <div style="margin-top: 1rem;">
                                                    <form method="POST" action="/photos/${photo.id}/delete" style="display: inline;"
                                                          onsubmit="return confirm('Are you sure you want to delete this photo?')">
                                                        <button type="submit" class="btn btn-danger" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">
                                                            Delete
                                                        </button>
                                                    </form>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `}
        </div>
    </div>
  `;

  return layout('Feed', content, user);
}