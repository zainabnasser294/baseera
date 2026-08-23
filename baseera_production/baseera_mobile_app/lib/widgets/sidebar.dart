import 'package:flutter/material.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 250,
      color: Colors.white,
      child: Column(
        children: [
          const SizedBox(height: 32),
          // Logo
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.pie_chart, color: const Color(0xFF4A148C), size: 32),
              const SizedBox(width: 8),
              const Text(
                'بصيرة',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF4A148C),
                ),
              ),
            ],
          ),
          const SizedBox(height: 48),
          _SidebarItem(icon: Icons.dashboard, title: 'الرئيسية', isActive: true),
          _SidebarItem(icon: Icons.analytics_outlined, title: 'التحليلات'),
          _SidebarItem(icon: Icons.account_balance_wallet_outlined, title: 'المالية'),
          _SidebarItem(icon: Icons.people_outline, title: 'العملاء'),
          const Spacer(),
          _SidebarItem(icon: Icons.settings_outlined, title: 'الإعدادات'),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final bool isActive;

  const _SidebarItem({
    Key? key,
    required this.icon,
    required this.title,
    this.isActive = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF4A148C).withOpacity(0.1) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isActive ? const Color(0xFF4A148C) : Colors.grey.shade600,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isActive ? const Color(0xFF4A148C) : Colors.grey.shade600,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        onTap: () {},
      ),
    );
  }
}
