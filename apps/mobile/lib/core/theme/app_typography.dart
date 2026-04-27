import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTypography {
  static TextStyle get h1 => GoogleFonts.nunitoSans(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        color: AppColors.textBlack,
      );
  static TextStyle get h2 => GoogleFonts.nunitoSans(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: AppColors.textBlack,
      );
  static TextStyle get h3 => GoogleFonts.nunitoSans(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: AppColors.textBlack,
      );
  static TextStyle get body => GoogleFonts.nunitoSans(
        fontSize: 16,
        color: AppColors.textBlack,
      );
  static TextStyle get bodySmall => GoogleFonts.nunitoSans(
        fontSize: 14,
        color: AppColors.textGray,
      );
  static TextStyle get caption => GoogleFonts.nunitoSans(
        fontSize: 12,
        color: AppColors.textGrayLight,
      );
}
