import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
  final _descriptionController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
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
            description: _descriptionController.text.trim().isNotEmpty
                ? _descriptionController.text.trim()
                : null,
          );
      ref.invalidate(itemsProvider);
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Create Item', style: AppTypography.h3)),
      body: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            AppTextField(
              controller: _titleController,
              label: 'Title',
              maxLength: ItemConstraints.titleMaxLength,
            ),
            const SizedBox(height: AppSpacing.lg),
            AppTextField(
              controller: _descriptionController,
              label: 'Description (optional)',
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
                    : const Text('Create'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
