import 'package:flutter/material.dart';

class AdminMobileDashboard extends StatefulWidget {
  const AdminMobileDashboard({Key? key}) : super(key: key);

  @override
  State<AdminMobileDashboard> createState() => _AdminMobileDashboardState();
}

class _AdminMobileDashboardState extends State<AdminMobileDashboard>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: const Text("لوحة الإشراف (Super Admin)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          actions: [
            IconButton(
              icon: const Icon(Icons.notifications_none),
              onPressed: () {},
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: CircleAvatar(
                backgroundColor: theme.colorScheme.primary.withOpacity(0.15),
                child: Text(
                  "A",
                  style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
          bottom: TabBar(
            controller: _tabController,
            labelColor: theme.colorScheme.primary,
            unselectedLabelColor: Colors.grey,
            indicatorColor: theme.colorScheme.primary,
            indicatorWeight: 3,
            tabs: const [
              Tab(text: "إدارة المستخدمين", icon: Icon(Icons.people_outline)),
              Tab(text: "التقييمات والملاحظات", icon: Icon(Icons.star_outline)),
            ],
          ),
        ),
        drawer: _buildAppDrawer(context),
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildUsersSection(context),
            _buildFeedbackSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildUsersSection(BuildContext context) {
    final theme = Theme.of(context);
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // شبكة الإحصائيات (KPIs Grid)
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.25,
            children: const [
              _KpiCard(
                title: "إجمالي الحسابات",
                value: "13",
                subtitle: "مشتركين ومستخدمين",
                icon: Icons.group_outlined,
              ),
              _KpiCard(
                title: "الحسابات النشطة",
                value: "13",
                subtitle: "حسابات مفعلة",
                icon: Icons.check_circle_outline,
              ),
              _KpiCard(
                title: "الحسابات المجمدة",
                value: "0",
                subtitle: "تطلب التفعيل",
                icon: Icons.block,
              ),
              _KpiCard(
                title: "الملفات واللوحات",
                value: "46",
                subtitle: "مشاريع مرفوعة",
                icon: Icons.folder_open,
              ),
            ],
          ),
          const SizedBox(height: 24),
          // شريط البحث
          TextField(
            decoration: InputDecoration(
              hintText: "ابحث بالاسم، البريد، أو السجل...",
              prefixIcon: Icon(Icons.search, color: theme.colorScheme.primary),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: Colors.grey.withOpacity(0.2)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: theme.colorScheme.primary, width: 2),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            "قائمة المشتركين",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: theme.colorScheme.onBackground),
          ),
          const SizedBox(height: 12),
          // قائمة بطاقات المشتركين
          ListView(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: const [
              _UserMobileCard(
                name: "هاجر",
                email: "raalharbi0031000@gmail.com",
                company: "بقالة",
                cr: "CR: 124",
                role: "مستخدم",
                date: "2026-07-28 13:24",
                status: "نشط",
              ),
              _UserMobileCard(
                name: "ساره",
                email: "saraa111harbi0031@gmail.com",
                company: "عقارات",
                cr: "CR: 123",
                role: "مستخدم",
                date: "2026-07-28 12:05",
                status: "نشط",
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeedbackSection(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: const [
        _FeedbackCard(
          type: "اقتراح ميزة",
          email: "meeraalmadilwi@gmail.com",
          user: "admin",
          rating: 5,
          date: "2026-07-28 18:13",
          message: "لا يوجد محتوى إضافي",
        ),
      ],
    );
  }

  Widget _buildAppDrawer(BuildContext context) {
    final theme = Theme.of(context);
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [theme.colorScheme.primary, theme.colorScheme.secondary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: const Align(
              alignment: Alignment.bottomRight,
              child: Text(
                "بصيرة - مساحة العمل",
                style: TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          ListTile(
            leading: Icon(Icons.dashboard, color: theme.colorScheme.primary),
            title: const Text("لوحة التحكم", style: TextStyle(fontWeight: FontWeight.w600)),
            onTap: () {},
          ),
          ListTile(
            leading: Icon(Icons.admin_panel_settings, color: theme.colorScheme.primary),
            title: const Text("لوحة الإشراف (Super Admin)", style: TextStyle(fontWeight: FontWeight.w600)),
            selected: true,
            selectedColor: theme.colorScheme.primary,
            selectedTileColor: theme.colorScheme.primary.withOpacity(0.08),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title, value, subtitle;
  final IconData icon;

  const _KpiCard({required this.title, required this.value, required this.subtitle, required this.icon});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.withOpacity(0.15), width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, size: 16, color: theme.colorScheme.primary),
                ),
              ],
            ),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: theme.colorScheme.onBackground)),
            Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
      ),
    );
  }
}

class _UserMobileCard extends StatelessWidget {
  final String name, email, company, role, date, status;
  final String? cr;

  const _UserMobileCard({
    required this.name,
    required this.email,
    required this.company,
    this.cr,
    required this.role,
    required this.date,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isStausActive = status.contains("نشط");

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.withOpacity(0.15), width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: theme.colorScheme.secondary.withOpacity(0.15),
                  radius: 20,
                  child: Text(
                    name[0],
                    style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: theme.colorScheme.onBackground)),
                      Text(email, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isStausActive ? const Color(0xFF22C55E).withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(
                      color: isStausActive ? const Color(0xFF22C55E) : Colors.orange,
                      fontWeight: FontWeight.bold,
                      fontSize: 11,
                    ),
                  ),
                ),
              ],
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0),
              child: Divider(),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.business, size: 14, color: Colors.grey),
                    const SizedBox(width: 6),
                    Text(company, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                  ],
                ),
                if (cr != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(cr!, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FeedbackCard extends StatelessWidget {
  final String type, email, user, date, message;
  final int rating;

  const _FeedbackCard({
    required this.type,
    required this.email,
    required this.user,
    required this.date,
    required this.message,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.withOpacity(0.15), width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(type, style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 11)),
                ),
                Text(date, style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.account_circle, size: 16, color: Colors.grey[400]),
                const SizedBox(width: 8),
                Text(email, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: List.generate(5, (index) {
                return Icon(
                  index < rating ? Icons.star : Icons.star_border,
                  color: Colors.amber,
                  size: 16,
                );
              }),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0),
              child: Divider(),
            ),
            Text(message, style: const TextStyle(fontSize: 13, height: 1.5)),
          ],
        ),
      ),
    );
  }
}
