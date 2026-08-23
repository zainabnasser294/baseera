import os
import re

www_dir = r"c:\Users\saraa\Downloads\baseera - Copy (6)\baseera - Copy (6)\baseera - Copy\baseera_mobile_app\assets\www"

def inject_script():
    for filename in os.listdir(www_dir):
        if filename.endswith(".html"):
            filepath = os.path.join(www_dir, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            # Ensure translations.js is not already there
            if 'src="translations.js"' not in content:
                # Add it before theme.js or app.js if theme.js is not present
                if 'src="theme.js"' in content:
                    content = content.replace('<script src="theme.js"></script>', '<script src="translations.js"></script>\n<script src="theme.js"></script>')
                elif 'src="app.js"' in content:
                    content = content.replace('<script src="app.js"></script>', '<script src="translations.js"></script>\n<script src="app.js"></script>')

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)

def update_admin_dashboard():
    filepath = os.path.join(www_dir, "admin_dashboard.html")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace hardcoded Arabic with data-i18n tags
    content = content.replace('لوحة الإدارة', '<span data-i18n="adminDashTitle">لوحة الإدارة</span>')
    content = content.replace('لوحة الإشراف وإدارة النظام', '<span data-i18n="adminHeaderTitle">لوحة الإشراف وإدارة النظام</span>')
    content = content.replace('صلاحيات كاملة', '<span data-i18n="adminHeaderBadge">صلاحيات كاملة</span>')
    content = content.replace('إدارة المستخدمين والتراخيص، وتجميد/تفعيل الحسابات', '<span data-i18n="adminHeaderDesc">إدارة المستخدمين والتراخيص، وتجميد/تفعيل الحسابات</span>')
    content = content.replace('أنت مسجل كـ:', '<span data-i18n="adminLoggedAs">أنت مسجل كـ:</span>')
    content = content.replace('إجمالي الحسابات', '<span data-i18n="totalAccounts">إجمالي الحسابات</span>')
    content = content.replace('مشتركين ومستخدمين', '<span data-i18n="subAndUsers">مشتركين ومستخدمين</span>')
    content = content.replace('الحسابات النشطة', '<span data-i18n="activeAccounts">الحسابات النشطة</span>')
    content = content.replace('نشط حالياً', '<span data-i18n="activeNow">نشط حالياً</span>')
    content = content.replace('الحسابات المجمدة', '<span data-i18n="frozenAccounts">الحسابات المجمدة</span>')
    content = content.replace('موقوف مؤقتاً', '<span data-i18n="suspendedTemp">موقوف مؤقتاً</span>')
    content = content.replace('إجمالي الإيرادات', '<span data-i18n="totalRevenue">إجمالي الإيرادات</span>')
    content = content.replace('الاشتراكات الشهرية', '<span data-i18n="monthlySub">الاشتراكات الشهرية</span>')
    content = content.replace('إجراءات سريعة', '<span data-i18n="quickActions">إجراءات سريعة</span>')
    content = content.replace('إدارة المستخدمين', '<span data-i18n="userManagement">إدارة المستخدمين</span>')
    content = content.replace('إدارة التراخيص والفواتير', '<span data-i18n="manageLicenses">إدارة التراخيص والفواتير</span>')
    content = content.replace('عرض السجلات المالية وترقية المستخدمين', '<span data-i18n="manageLicensesSub">عرض السجلات المالية وترقية المستخدمين</span>')
    content = content.replace('سجلات النظام', '<span data-i18n="systemLogs">سجلات النظام</span>')
    content = content.replace('مراقبة الأنشطة والأخطاء', '<span data-i18n="systemLogsSub">مراقبة الأنشطة والأخطاء</span>')
    content = content.replace('الإعدادات', '<span data-i18n="settings">الإعدادات</span>')
    content = content.replace('إعدادات النظام', '<span data-i18n="settingsSub">إعدادات النظام</span>')
    content = content.replace('أحدث المستخدمين', '<span data-i18n="recentUsers">أحدث المستخدمين</span>')

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

inject_script()
update_admin_dashboard()
print("Injected translations.js and updated admin_dashboard.html")
