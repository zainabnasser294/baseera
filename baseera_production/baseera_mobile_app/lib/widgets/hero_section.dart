import 'package:flutter/material.dart';
import '../responsive.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    bool isMobile = Responsive.isMobile(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 16.0 : 40.0,
        vertical: isMobile ? 24.0 : 48.0,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment:
            isMobile ? CrossAxisAlignment.center : CrossAxisAlignment.start,
        children: [
          Text(
            'لا داعي لتعيين محاسبين مكلفين\nدع بصيرة تفهم أرقام مشروعك',
            textAlign: isMobile ? TextAlign.center : TextAlign.right,
            style: TextStyle(
              fontSize: isMobile ? 24 : 36,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF4A148C), // Primary Indigo/Purple
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'بصيرة هي منصة ذكاء محاسبي متكاملة ومستقلة، مصممة خصيصاً لمساعدة رواد الأعمال والمؤسسات.\nارفع ملفات المبيعات وسيجلب لك الوكيل تحليلاً فورياً شاملاً.',
            textAlign: isMobile ? TextAlign.center : TextAlign.right,
            style: TextStyle(
              fontSize: isMobile ? 14 : 16,
              color: Colors.grey.shade700,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4A148C),
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 32 : 48,
                vertical: isMobile ? 16 : 20,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(50), // Pill shape
              ),
              elevation: 4,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.arrow_back, size: 20),
                const SizedBox(width: 8),
                Text(
                  'سجل مؤسستك اليوم مجاناً',
                  style: TextStyle(
                    fontSize: isMobile ? 16 : 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
