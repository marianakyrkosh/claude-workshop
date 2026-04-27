import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../env/env.dart';
import 'api_exception.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onError: (error, handler) {
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;
        final message =
            data is Map<String, dynamic>
                ? (data['message'] as String? ?? 'Something went wrong')
                : 'Something went wrong';

        final AppException exception;
        if (statusCode == 400) {
          exception = BadRequestException(message);
        } else if (statusCode == 404) {
          exception = NotFoundException(message);
        } else if (statusCode != null && statusCode >= 500) {
          exception = ServerException(message);
        } else if (error.type == DioExceptionType.connectionError ||
            error.type == DioExceptionType.connectionTimeout ||
            error.type == DioExceptionType.receiveTimeout ||
            error.type == DioExceptionType.sendTimeout) {
          exception = const NetworkException('Unable to connect to server');
        } else {
          exception = ServerException(message);
        }
        handler.reject(
          DioException(
            requestOptions: error.requestOptions,
            error: exception,
            response: error.response,
            type: error.type,
          ),
        );
      },
    ),
  );

  return dio;
});
