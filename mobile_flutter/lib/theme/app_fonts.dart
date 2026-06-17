import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_theme.dart';

/// Centralized text styles using the ops font pairing:
/// - Space Grotesk for display/headings/numeric values
/// - IBM Plex Sans for body/UI text
class AppFonts {
  AppFonts._();

  static TextStyle display({
    double size = 24,
    FontWeight weight = FontWeight.w600,
    Color color = OpsColors.ink,
    double? height,
    double? letterSpacing,
  }) {
    return GoogleFonts.spaceGrotesk(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
    );
  }

  static TextStyle body({
    double size = 14,
    FontWeight weight = FontWeight.w400,
    Color color = OpsColors.ink,
    double? height,
    double? letterSpacing,
  }) {
    return GoogleFonts.ibmPlexSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
    );
  }

  /// Small uppercase label (used for metric captions / eyebrow text).
  static TextStyle eyebrow({Color color = OpsColors.muted}) {
    return GoogleFonts.ibmPlexSans(
      fontSize: 11,
      fontWeight: FontWeight.w600,
      color: color,
      letterSpacing: 0.6,
    );
  }
}
