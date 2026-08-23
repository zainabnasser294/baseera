with open('dashboard/urls.py', 'w', encoding='utf-8') as f:
    f.write('''from django.urls import path
from . import views
from . import api_views

urlpatterns = [
    path("", views.welcome, name="welcome"),
    path("login/", views.user_login, name="login"),
    path("password-reset/", views.password_reset, name="password_reset"),
    path("register/", views.user_register, name="register"),
    path("logout/", views.user_logout, name="logout"),
    path("portal/", views.portal, name="portal"),
    path("dashboard/", views.dashboard, name="dashboard"),
    path("contact/", views.contact, name="contact"),
    path("about/", views.about, name="about"),
    path("privacy/", views.privacy, name="privacy"),
    path("terms/", views.terms, name="terms"),
    path("agents/", views.ask_basira, name="agents_hub"),
    path("all-agents/", views.ask_basira, name="all_agents_gallery"),
    path("boardroom/", views.ask_basira, name="boardroom"),
    path("agents-workspace/", views.ask_basira, name="agents_workspace"),
    path("ask-basira/", views.ask_basira, name="ask_basira"),
    path("social-login/<str:provider>/", views.social_login_dummy, name="social_login"),

    path("api/save_file/", api_views.save_file_api, name="save_file_api"),
    path("api/live-sync/", api_views.live_sync_api, name="live_sync_api"),
    path("api/mobile/login", api_views.mobile_login, name="mobile_login"),
    path("api/mobile/register", api_views.mobile_register, name="mobile_register"),
    path("api/mobile/change-password", api_views.mobile_change_password, name="mobile_change_password"),
    path("api/mobile/forgot-password", api_views.mobile_forgot_password, name="mobile_forgot_password"),
    path("api/mobile/verify-otp", api_views.mobile_verify_otp, name="mobile_verify_otp"),
    path("api/mobile/upload", api_views.mobile_upload, name="mobile_upload"),
    path("api/mobile/connect-live", api_views.mobile_connect_live, name="mobile_connect_live"),
    path("api/mobile/toggle-user-status", api_views.mobile_toggle_user_status, name="mobile_toggle_user_status"),
    path("api/mobile/dashboard", api_views.mobile_dashboard_data, name="mobile_dashboard_data"),
    path("api/mobile/extract-receipt", api_views.extract_receipt_api, name="extract_receipt_api"),
    path("api/mobile/chat-history", api_views.api_mobile_chat_history, name="api_mobile_chat_history"),
    path("api/mobile/export-excel", api_views.api_mobile_export_excel, name="api_mobile_export_excel"),
    path("api/mobile/export-note", api_views.api_mobile_export_note, name="api_mobile_export_note"),
]
''')
