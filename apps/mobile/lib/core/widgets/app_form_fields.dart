import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

class AppTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final int? maxLength;
  final int maxLines;
  final String? hint;

  const AppTextField({
    super.key,
    required this.controller,
    required this.label,
    this.maxLength,
    this.maxLines = 1,
    this.hint,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(
            color: AppColors.primaryBlue,
            width: AppSizes.borderWidthFocused,
          ),
        ),
      ),
      maxLength: maxLength,
      maxLines: maxLines,
    );
  }
}
