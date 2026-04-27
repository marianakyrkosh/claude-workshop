import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_form_fields.dart';
import '../../../models/constants.dart';
import '../providers/items_provider.dart';

class EditItemScreen extends ConsumerStatefulWidget {
  final String id;
  const EditItemScreen({super.key, required this.id});

  @override
  ConsumerState<EditItemScreen> createState() => _EditItemScreenState();
}

class _EditItemScreenState extends ConsumerState<EditItemScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  bool _isLoading = false;
  bool _initialized = false;

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
      await ref.read(itemsRepositoryProvider).updateItem(
            widget.id,
            title: title,
            description: _descriptionController.text.trim().isNotEmpty
                ? _descriptionController.text.trim()
                : null,
          );
      ref.invalidate(itemsProvider);
      ref.invalidate(itemProvider(widget.id));
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
    final itemAsync = ref.watch(itemProvider(widget.id));

    return Scaffold(
      appBar: AppBar(title: Text('Edit Item', style: AppTypography.h3)),
      body: itemAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (item) {
          if (!_initialized) {
            _titleController.text = item.title;
            _descriptionController.text = item.description ?? '';
            _initialized = true;
          }
          return Padding(
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
                        : const Text('Save'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
