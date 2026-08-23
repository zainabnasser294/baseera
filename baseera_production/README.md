# Baseera (بصيرة) - Smart Business Analytics Platform

بصيرة هو منصة ذكية لتحليل بيانات المبيعات، وتوليد التقارير التفاعلية والتحليلات التلقائية لمساعدة الشركات في اتخاذ قرارات مدروسة وتحديد الهدر والفرص الواعدة.

---

##  هيكل المشروع (Project Structure)

```text
baseera/
├── backend
│   ├── BaseeraAPI.csproj
│   ├── BaseeraAPI.http
│   ├── Controllers
│   │   ├── B2BAdminController.cs
│   │   ├── InsightController.cs
│   │   └── MobileDashboardController.cs
│   ├── Data
│   │   └── BaseeraDbContext.cs
│   ├── Domain
│   │   └── Entities.cs
│   ├── Migrations
│   │   ├── 20260717144834_InitialCreate.Designer.cs
│   │   ├── 20260717144834_InitialCreate.cs
│   │   ├── 20260718121816_AddB2BEntities.Designer.cs
│   │   ├── 20260718121816_AddB2BEntities.cs
│   │   └── BaseeraDbContextModelSnapshot.cs
│   ├── Program.cs
│   ├── Properties
│   │   └── launchSettings.json
│   ├── Services
│   │   └── TenantService.cs
│   ├── analyze.py
│   ├── appsettings.Development.json
│   ├── appsettings.json
│   └── uploads
├── baseera_web
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── dashboard
│   ├── __init__.py
│   ├── context_processors.py
│   ├── migrations
│   │   ├── 0001_initial.py
│   │   └── __init__.py
│   ├── models.py
│   ├── static
│   │   └── dashboard
│   │       └── img
│   │           └── logo.jpg
│   ├── templates
│   │   └── dashboard
│   │       ├── _temp_ask.html
│   │       ├── about.html
│   │       ├── ask_basira.html
│   │       ├── base.html
│   │       ├── contact.html
│   │       ├── dashboard.html
│   │       ├── datasets.html
│   │       ├── footer.html
│   │       ├── login.html
│   │       ├── navbar.html
│   │       ├── password_reset.html
│   │       ├── portal.html
│   │       ├── register.html
│   │       ├── reports.html
│   │       ├── settings.html
│   │       ├── sidebar.html
│   │       ├── topbar.html
│   │       └── welcome.html
│   ├── urls.py
│   └── views.py
├── database
│   └── init.sql
├── db.sqlite3
├── docker-compose.yml
├── manage.py
├── media
│   └── excel_files
│       └── sales_report.csv
├── sales_report.csv
└── sandbox
    ├── Dockerfile
    ├── main.py
    └── requirements.txt
```

---

##  المكونات الرئيسية للمشروع

1. **`backend/`**: مشروع Web API مبني باستخدام ASP.NET Core (C#) لإدارة البيانات والتحليلات والـ B2B Admin والـ Mobile Dashboards.
2. **`baseera_web/`**: مشروع Django الرئيسي الذي يحتوي على إعدادات الويب ومسارات المشروع.
3. **`dashboard/`**: تطبيق Django للوحة التحكم (Dashboard)، ويشمل:
   - **`templates/dashboard/`**: قوالب HTML للواجهة الرسومية المصممة بـ Tailwind CSS ومكتبة Lucide Icons.
   - **`views.py` & `models.py`**: منطق التحكم وقواعد البيانات للتطبيق.
4. **`database/`**: ملفات إعداد قاعدة البيانات الأولى (`init.sql`).
5. **`sandbox/`**: بيئة معزولة لتشغيل الأكواد البرمجية وتحليل البيانات بأمان.
6. **`docker-compose.yml`**: ملف إعداد الحاويات لتشغيل النظام بسهولة في بيئة Docker.
