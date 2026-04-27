import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_spacing.dart';

class AppTheme {
  static ThemeData get light => ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primaryBlue),
        scaffoldBackgroundColor: AppColors.surfaceWhite,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.surfaceWhite,
          foregroundColor: AppColors.textBlack,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryBlue,
            foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, AppSizes.buttonHeight),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          ),
        ),
      );
}
