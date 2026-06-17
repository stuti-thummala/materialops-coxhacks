import 'package:flutter/material.dart';

/// Ops design-system palette, ported 1:1 from the Next.js web app
/// (`tailwind.config.ts` `colors.ops.*`). Warm off-white surfaces, navy
/// chrome, and an operational accent set.
class OpsColors {
  OpsColors._();

  // Surfaces
  static const Color bg = Color(0xFFF4F1EA); // warm off-white app background
  static const Color surface = Color(0xFFFFFDF7); // cards / panels
  static const Color navy = Color(0xFF0D2533); // header / chrome
  static const Color deepNavy = Color(0xFF081923); // header gradient base

  // Text
  static const Color ink = Color(0xFF182026); // primary text
  static const Color muted = Color(0xFF6D747C); // secondary text
  static const Color border = Color(0xFFD8D2C6); // hairlines / dividers

  // Accents (status + data)
  static const Color green = Color(0xFF1F9D66); // success / recovery / primary
  static const Color amber = Color(0xFFC9831A); // warning / staging
  static const Color red = Color(0xFFC34A36); // overdue / error
  static const Color blue = Color(0xFF2F6FDB); // info / in-transit
  static const Color purple = Color(0xFF7251B5); // batches / categories

  // Soft tinted backgrounds (status chips / icon tiles)
  static const Color softGreen = Color(0xFFE8F6EF);
  static const Color softAmber = Color(0xFFFFF1D9);
  static const Color softRed = Color(0xFFFBE7E3);
  static const Color softBlue = Color(0xFFE8F0FF);
  static const Color softPurple = Color(0xFFEFEAF7);
}

class AppTheme {
  AppTheme._();

  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: OpsColors.bg,
      colorScheme: ColorScheme.fromSeed(
        seedColor: OpsColors.green,
        brightness: Brightness.light,
        surface: OpsColors.surface,
        primary: OpsColors.green,
      ),
      splashFactory: InkRipple.splashFactory,
    );

    return base.copyWith(
      textTheme: AppText.textTheme(base.textTheme),
    );
  }
}

/// Typography helpers. Body copy uses IBM Plex Sans; display/headers use
/// Space Grotesk — matching the web app. Fonts are pulled at runtime by the
/// google_fonts package, so no font binaries need bundling.
class AppText {
  AppText._();

  static const String _bodyFamily = 'IBM Plex Sans';
  static const String _displayFamily = 'Space Grotesk';

  static TextTheme textTheme(TextTheme base) {
    // Applied via GoogleFonts in app_fonts.dart at startup; here we just set
    // the default ink color so text reads on the warm background.
    return base.apply(
      bodyColor: OpsColors.ink,
      displayColor: OpsColors.ink,
    );
  }

  static String get bodyFamily => _bodyFamily;
  static String get displayFamily => _displayFamily;
}
