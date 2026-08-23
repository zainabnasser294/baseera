with open('dashboard/urls.py', 'r', encoding='utf-8') as f:
    content = f.read()

missing_paths = '''
    # Add newly discovered missing links
    path("templates-feedback/", views.templates_feedback, name="templates_feedback"),
    path("pricing/", views.pricing, name="pricing"),
    path("process-payment/", views.process_payment, name="process_payment"),
    path("connect-live-web/", views.connect_live_web, name="connect_live_web"),
    path("save-manual-note/", views.save_manual_note, name="save_manual_note"),
    
    # Admin links
    path("admin-dashboard/", views.admin_dashboard, name="admin_dashboard"),
    path("admin-settings/", views.admin_settings, name="admin_settings"),
    path("admin-logs/", views.admin_logs, name="admin_logs"),
    path("admin-finance/", views.admin_finance, name="admin_finance"),
'''

if 'templates_feedback' not in content:
    content = content.replace('path("settings/", views.dashboard, name="settings"),', 'path("settings/", views.dashboard, name="settings"),' + missing_paths)
    
with open('dashboard/urls.py', 'w', encoding='utf-8') as f:
    f.write(content)
