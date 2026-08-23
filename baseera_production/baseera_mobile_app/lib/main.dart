import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter/services.dart';
import 'screens/admin_dashboard.dart'; // <--- Import the new screen

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BaseeraApp());
}

class BaseeraApp extends StatelessWidget {
  const BaseeraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Baseera',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF2F2F5), // --color-bg
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5), // --color-accent
          primary: const Color(0xFF4F46E5),
          secondary: const Color(0xFF10B981), // --color-success (emerald)
          background: const Color(0xFFF2F2F5),
          onBackground: const Color(0xFF181C80), // --color-navy
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF181C80), // --color-navy
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: Colors.grey.withOpacity(0.15), width: 1),
          ),
          margin: EdgeInsets.zero,
        ),
        fontFamily: 'Inter', // Or Poppins, fallback to standard sans
      ),
      home: const WebViewScreen(), // <--- Set as home for preview
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..loadFlutterAsset('assets/www/welcome.html'); // This is the modern way to load local assets in webview_flutter 4.x
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}
