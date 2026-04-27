import 'package:flutter/material.dart';
import '../theme/app_typography.dart';

class AppCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final VoidCallback? onTap;
  final Widget? trailing;

  const AppCard({
    super.key,
    required this.title,
    this.subtitle,
    this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(
          title,
          style: AppTypography.body.copyWith(fontWeight: FontWeight.w600),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle!,
                style: AppTypography.bodySmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              )
            : null,
        trailing: trailing ?? const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
