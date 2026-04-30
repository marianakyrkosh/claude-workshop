import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/l10n/generated/app_localizations.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_form_fields.dart';
import '../../../models/constants.dart';
import '../providers/items_provider.dart';

class CreateItemScreen extends ConsumerStatefulWidget {
  const CreateItemScreen({super.key});

  @override
  ConsumerState<CreateItemScreen> createState() => _CreateItemScreenState();
}

class _CreateItemScreenState extends ConsumerState<CreateItemScreen> {
  final _titleController = TextEditingController();
  final _subtitleController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    _subtitleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(itemsRepositoryProvider).createItem(
            title: title,
            subtitle: _subtitleController.text.trim().isNotEmpty
                ? _subtitleController.text.trim()
                : null,
            description: _descriptionController.text.trim().isNotEmpty
                ? _descriptionController.text.trim()
                : null,
          );
      ref.invalidate(itemsProvider);
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.errorGeneric('$e'))),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.createItemTitle, style: AppTypography.h3),
      ),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            AppTextField(
              controller: _titleController,
              label: l10n.fieldTitle,
              maxLength: ItemConstraints.titleMaxLength,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _subtitleController,
              label: l10n.itemSubtitleLabel,
              hint: l10n.itemSubtitleHint,
              maxLength: ItemConstraints.subtitleMaxLength,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _descriptionController,
              label: l10n.fieldDescriptionOptional,
              maxLength: ItemConstraints.descriptionMaxLength,
              maxLines: 4,
            ),
            const SizedBox(height: AppSpacing.xl),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const SizedBox(
                        height: AppSizes.iconSm,
                        width: AppSizes.iconSm,
                        child: CircularProgressIndicator(
                          strokeWidth: AppSizes.borderWidthFocused,
                          color: Colors.white,
                        ),
                      )
                    : Text(l10n.createButton),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
