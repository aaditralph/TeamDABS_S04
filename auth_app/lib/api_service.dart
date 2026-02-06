import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // IMPORTANT: 
  // If using Emulator -> Use "http://10.0.2.2:3000"
  // If using Real Phone -> Use "http://192.168.x.x:3000" (Check your laptop IP)
  static const String baseUrl = "http://192.168.0.103:3000"; 

  // --- 1. LOGIN (The Gateway) ---
  static Future<String?> loginAndGetToken() async {
    final url = Uri.parse("$baseUrl/admin/login");
    
    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "email": "DABS",      // Credentials from your api.md
          "password": "123"
        }),
      );

      print("Login Status: ${response.statusCode}");
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // The token is inside data -> token
        return data["data"]["token"]; 
      } else {
        print("Login Failed: ${response.body}");
        return null;
      }
    } catch (e) {
      print("Error during login: $e");
      return null;
    }
  }

  // --- 2. GET DATA (Protected Route) ---
  static Future<List<dynamic>> getPendingOfficers(String token) async {
    final url = Uri.parse("$baseUrl/admin/pending-officers");

    try {
      final response = await http.get(
        url,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $token", // <--- THIS IS THE KEY!
        },
      );

      print("Officers API Status: ${response.statusCode}");

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data["data"]["officers"];
      } else {
        print("Failed to fetch officers: ${response.body}");
        return [];
      }
    } catch (e) {
      print("Error fetching officers: $e");
      return [];
    }
  }
}
