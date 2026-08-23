import 'package:flutter/material.dart';

class ResponsiveNavBar extends StatelessWidget implements PreferredSizeWidget {
  const ResponsiveNavBar({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 800) {
          // Web / Desktop Layout (Row)
          return Container(
            height: 70,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                )
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildLogo(),
                Row(
                  children: [
                    _buildThemeToggle(),
                    const SizedBox(width: 16),
                    _buildLanguageToggle(),
                    const SizedBox(width: 16),
                    _buildRegisterButton(),
                  ],
                ),
              ],
            ),
          );
        } else {
          // Mobile Layout (AppBar)
          return AppBar(
            backgroundColor: Colors.white,
            elevation: 2,
            shadowColor: Colors.black.withOpacity(0.2),
            iconTheme: const IconThemeData(color: Color(0xFF4A148C)),
            centerTitle: true,
            title: _buildLogo(),
            // The Hamburger menu is automatically added if Scaffold has a drawer.
            // We ensure it acts as the leading icon by default in RTL.
          );
        }
      },
    );
  }

  Widget _buildLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.pie_chart, color: const Color(0xFF4A148C), size: 28),
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
    );
  }

  Widget _buildThemeToggle() {
    return IconButton(
      icon: const Icon(Icons.dark_mode_outlined, color: Colors.grey),
      onPressed: () {},
    );
  }

  Widget _buildLanguageToggle() {
    return TextButton(
      onPressed: () {},
      child: const Text('English', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildRegisterButton() {
    return ElevatedButton(
      onPressed: () {},
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF4A148C),
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
      child: const Text('تسجيل مؤسسة'),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(70);
}
