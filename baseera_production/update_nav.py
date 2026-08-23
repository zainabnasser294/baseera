import os
import re

new_nav = '''  <nav class="bottom-nav">
    <a href="dashboard.html" title="Home">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z"/></svg>
    </a>
    <a href="agents_hub.html" title="Agents">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    </a>
    <a href="chat.html" title="Ask Baseera" style="position: relative; top: -10px; background: linear-gradient(135deg, #2b2470 0%, #7c6cf0 100%); color: white; border-radius: 50%; padding: 12px; box-shadow: 0 4px 10px rgba(124,108,240,0.4);">
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H8l-4 4V5a1 1 0 011-1z"/></svg>
    </a>
    <a href="datasets.html" title="Data">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
    </a>
    <a href="menu.html" title="Menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </a>
  </nav>'''

files = ['boardroom.html', 'workspace.html', 'reports.html', 'templates_feedback.html', 'insights.html', 'pricing.html', 'upload.html']
base_dir = 'baseera_mobile_app/assets/www'

for f in files:
    path = os.path.join(base_dir, f)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Use regex to replace the <nav class="bottom-nav"> block
    content = re.sub(r'<nav class="bottom-nav">.*?</nav>', new_nav, content, flags=re.DOTALL)
    
    with open(path, 'w', encoding='utf-8') as file:
        file.write(content)
    print('Updated ' + f)
