import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config.dart';
import '../models/auth_models.dart';

class ApiService {
  static const String baseUrl = Config.baseUrl;
  static const String tokenKey = 'jwt_token';

  static Future<SharedPreferences> _getPrefs() async {
    return await SharedPreferences.getInstance();
  }

  static Future<void> saveToken(String token) async {
    final prefs = await _getPrefs();
    await prefs.setString(tokenKey, token);
  }

  static Future<String?> getToken() async {
    final prefs = await _getPrefs();
    return prefs.getString(tokenKey);
  }

  static Future<void> clearToken() async {
    final prefs = await _getPrefs();
    await prefs.remove(tokenKey);
  }

  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  static Map<String, String> _getHeaders() {
    return {'Content-Type': 'application/json'};
  }

  static Map<String, String> _getAuthHeaders(String token) {
    final headers = _getHeaders();
    headers['Authorization'] = 'Bearer $token';
    return headers;
  }

  static dynamic _handleResponse(http.Response response) {
    try {
      final data = jsonDecode(response.body);
      if (!data['success']) {
        throw ApiException(
          data['message'] ?? 'Unknown error',
          response.statusCode,
        );
      }
      return data['data'] ?? data;
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to parse response: $e');
    }
  }

  static String _getAddressDisplay(Map<String, dynamic> address) {
    final street = address['street'] ?? '';
    final city = address['city'] ?? '';
    final state = address['state'] ?? '';
    final pincode = address['pincode'] ?? '';
    return '$street, $city, $state - $pincode';
  }

  static Future<AuthResponse?> loginSociety(
    String email,
    String password,
  ) async {
    final url = Uri.parse('$baseUrl/api/society/login');

    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = _handleResponse(response);

      final authResponse = AuthResponse(
        token: data['token'],
        user: User.fromJson(data['user']),
        society: Society.fromJson(data['society']),
      );

      await saveToken(authResponse.token);
      return authResponse;
    } catch (e) {
      print('Login error: $e');
      return null;
    }
  }

  static Future<AuthResponse?> registerSociety({
    required String name,
    required String email,
    required String password,
    required String phone,
    required String societyName,
    required String street,
    required String city,
    required String state,
    required String pincode,
    required double latitude,
    required double longitude,
    required double propertyTaxEstimate,
    required String electricMeterSerialNumber,
    double? dailyCompostWeight,
  }) async {
    final url = Uri.parse('$baseUrl/api/society/register');

    try {
      final response = await http.post(
        url,
        headers: _getHeaders(),
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'phone': phone,
          'societyName': societyName,
          'address': {
            'street': street,
            'city': city,
            'state': state,
            'pincode': pincode,
          },
          'geoLockCoordinates': {'latitude': latitude, 'longitude': longitude},
          'propertyTaxEstimate': propertyTaxEstimate,
          'electricMeterSerialNumber': electricMeterSerialNumber,
          if (dailyCompostWeight != null)
            'dailyCompostWeight': dailyCompostWeight,
        }),
      );

      final data = _handleResponse(response);

      final authResponse = AuthResponse(
        token: data['token'],
        user: User.fromJson(data['user']),
        society: Society.fromJson(data['society']),
      );

      await saveToken(authResponse.token);
      return authResponse;
    } catch (e) {
      print('Registration error: $e');
      return null;
    }
  }

  static Future<Society?> getSocietyInfo(String token) async {
    final url = Uri.parse('$baseUrl/api/society/society');

    try {
      final response = await http.get(url, headers: _getAuthHeaders(token));

      final data = _handleResponse(response);
      return Society.fromJson(data['society']);
    } catch (e) {
      print('Get society info error: $e');
      return null;
    }
  }

  static Future<bool> updateCompostWeight(String token, double weight) async {
    final url = Uri.parse('$baseUrl/api/society/society/compost-weight');

    try {
      final response = await http.patch(
        url,
        headers: _getAuthHeaders(token),
        body: jsonEncode({'dailyCompostWeight': weight}),
      );

      _handleResponse(response);
      return true;
    } catch (e) {
      print('Update compost weight error: $e');
      return false;
    }
  }

  static Future<MyReportsResponse?> getMyReports(String token) async {
    final url = Uri.parse('$baseUrl/api/verification/reports/my');

    try {
      final response = await http.get(url, headers: _getAuthHeaders(token));

      final data = _handleResponse(response);
      return MyReportsResponse.fromJson(data);
    } catch (e) {
      print('Get my reports error: $e');
      return null;
    }
  }

  static Future<List<SocietySummary>> getSocieties({
    bool compostAvailable = false,
  }) async {
    final url = Uri.parse(
      '$baseUrl/api/resident/societies${compostAvailable ? '?compostAvailable=true' : ''}',
    );

    try {
      final response = await http.get(url);
      final data = _handleResponse(response);

      final List<dynamic> societiesList = data['societies'] ?? [];
      return societiesList.map((e) => SocietySummary.fromJson(e)).toList();
    } catch (e) {
      print('Get societies error: $e');
      return [];
    }
  }

  static Future<LeaderboardResponse?> getLeaderboard({
    int limit = 50,
    int offset = 0,
  }) async {
    final url = Uri.parse(
      '$baseUrl/api/resident/leaderboard?limit=$limit&offset=$offset',
    );

    try {
      final response = await http.get(url);
      final data = _handleResponse(response);

      return LeaderboardResponse.fromJson(data);
    } catch (e) {
      print('Get leaderboard error: $e');
      return null;
    }
  }

  static Future<List<LeaderboardEntry>> getTopSocieties(int n) async {
    final url = Uri.parse('$baseUrl/api/resident/leaderboard/top/$n');

    try {
      final response = await http.get(url);
      final data = _handleResponse(response);

      final List<dynamic> list = data['leaderboard'] ?? [];
      return list.map((e) => LeaderboardEntry.fromJson(e)).toList();
    } catch (e) {
      print('Get top societies error: $e');
      return [];
    }
  }

  static Future<ReportSubmissionResponse?> submitReport({
    required String token,
    required File meterImage,
    required File composterImage,
    required double latitude,
    required double longitude,
    required double accuracy,
  }) async {
    final url = Uri.parse('$baseUrl/api/verification/report/upload');

    try {
      final request = http.MultipartRequest('POST', url);
      request.headers['Authorization'] = 'Bearer $token';

      request.files.add(
        await http.MultipartFile.fromPath('meter_image', meterImage.path),
      );
      request.files.add(
        await http.MultipartFile.fromPath(
          'composter_image',
          composterImage.path,
        ),
      );

      final geoData = {
        'latitude': latitude,
        'longitude': longitude,
        'accuracy': accuracy,
        'timestamp': DateTime.now().toIso8601String(),
      };
      request.fields['geoLocationData'] = jsonEncode(geoData);

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      final data = _handleResponse(response);
      return ReportSubmissionResponse.fromJson(data);
    } catch (e) {
      print('Submit report error: $e');
      return null;
    }
  }
}

class LeaderboardResponse {
  final int count;
  final int total;
  final List<LeaderboardEntry> leaderboard;

  LeaderboardResponse({
    required this.count,
    required this.total,
    required this.leaderboard,
  });

  factory LeaderboardResponse.fromJson(Map<String, dynamic> json) {
    final List<dynamic> list = json['leaderboard'] ?? [];
    return LeaderboardResponse(
      count: json['count'] ?? 0,
      total: json['total'] ?? 0,
      leaderboard: list.map((e) => LeaderboardEntry.fromJson(e)).toList(),
    );
  }
}

class ReportSubmissionResponse {
  final String reportId;
  final DateTime submissionDate;
  final String verificationStatus;
  final DateTime expiresAt;
  final bool n8nTriggered;
  final int imagesUploaded;

  ReportSubmissionResponse({
    required this.reportId,
    required this.submissionDate,
    required this.verificationStatus,
    required this.expiresAt,
    required this.n8nTriggered,
    required this.imagesUploaded,
  });

  factory ReportSubmissionResponse.fromJson(Map<String, dynamic> json) {
    return ReportSubmissionResponse(
      reportId: json['reportId'] ?? '',
      submissionDate: json['submissionDate'] != null
          ? DateTime.parse(json['submissionDate'])
          : DateTime.now(),
      verificationStatus: json['verificationStatus'] ?? 'PENDING',
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : DateTime.now().add(const Duration(days: 7)),
      n8nTriggered: json['n8nTriggered'] ?? false,
      imagesUploaded: json['imagesUploaded'] ?? 0,
    );
  }
}
