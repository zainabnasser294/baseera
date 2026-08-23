import 'package:flutter/material.dart';
import '../responsive.dart';
import 'dashboard_card.dart';

class DashboardGrid extends StatelessWidget {
  const DashboardGrid({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    bool isMobile = Responsive.isMobile(context);

    return GridView.count(
      crossAxisCount: isMobile ? 1 : 3,
      crossAxisSpacing: 24,
      mainAxisSpacing: 24,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: isMobile ? 2 : 1.5,
      children: const [
        DashboardCard(
          title: 'إجمالي الإيرادات',
          value: 'ر.ع. ٤٨,٣٢٠',
          percentage: '٢٤.٦٪',
          isPositive: true,
          icon: Icons.account_balance_wallet_outlined,
        ),
        DashboardCard(
          title: 'العملاء',
          value: '١,٢٨٤',
          percentage: '١٢.٥٪',
          isPositive: true,
          icon: Icons.people_outline,
        ),
        DashboardCard(
          title: 'معدل الفقد',
          value: '٣.١٪',
          percentage: '٠.٦٪',
          isPositive: false,
          icon: Icons.trending_down,
        ),
      ],
    );
  }
}
