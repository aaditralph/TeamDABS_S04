class AuthResponse {
  final String token;
  final User user;
  final Society society;

  AuthResponse({
    required this.token,
    required this.user,
    required this.society,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token'],
      user: User.fromJson(json['user']),
      society: Society.fromJson(json['society']),
    );
  }
}

class User {
  final String id;
  final String name;
  final String email;
  final int role;
  final String societyId;
  final String societyName;
  final bool isVerified;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.societyId,
    required this.societyName,
    required this.isVerified,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 0,
      societyId: json['societyId'] ?? '',
      societyName: json['societyName'] ?? '',
      isVerified: json['isVerified'] ?? false,
    );
  }
}

class Society {
  final String id;
  final String societyName;
  final String? email;
  final String? phone;
  final Address? address;
  final double? walletBalance;
  final double? totalRebatesEarned;
  final int? complianceStreak;
  final double? dailyCompostWeight;
  final bool? isVerified;

  Society({
    required this.id,
    required this.societyName,
    this.email,
    this.phone,
    this.address,
    this.walletBalance,
    this.totalRebatesEarned,
    this.complianceStreak,
    this.dailyCompostWeight,
    this.isVerified,
  });

  factory Society.fromJson(Map<String, dynamic> json) {
    return Society(
      id: json['id'] ?? json['_id'] ?? '',
      societyName: json['societyName'] ?? '',
      email: json['email'],
      phone: json['phone'],
      address: json['address'] != null
          ? Address.fromJson(json['address'])
          : null,
      walletBalance: json['walletBalance']?.toDouble(),
      totalRebatesEarned: json['totalRebatesEarned']?.toDouble(),
      complianceStreak: json['complianceStreak'],
      dailyCompostWeight: json['dailyCompostWeight']?.toDouble(),
      isVerified: json['isVerified'],
    );
  }
}

class Address {
  final String street;
  final String city;
  final String state;
  final String pincode;

  Address({
    required this.street,
    required this.city,
    required this.state,
    required this.pincode,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
    );
  }

  String toDisplayString() {
    return '$street, $city, $state - $pincode';
  }
}

class SocietySummary {
  final String societyName;
  final String email;
  final String phone;
  final Address address;
  final double dailyCompostWeight;
  final double totalRebatesEarned;
  final int complianceStreak;

  SocietySummary({
    required this.societyName,
    required this.email,
    required this.phone,
    required this.address,
    required this.dailyCompostWeight,
    required this.totalRebatesEarned,
    required this.complianceStreak,
  });

  factory SocietySummary.fromJson(Map<String, dynamic> json) {
    return SocietySummary(
      societyName: json['societyName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      address: Address.fromJson(json['address'] ?? {}),
      dailyCompostWeight: (json['dailyCompostWeight'] ?? 0).toDouble(),
      totalRebatesEarned: (json['totalRebatesEarned'] ?? 0).toDouble(),
      complianceStreak: json['complianceStreak'] ?? 0,
    );
  }
}

class LeaderboardEntry {
  final String societyId;
  final String societyName;
  final int totalReports;
  final int approvedReports;
  final double consistencyScore;
  final double averageVerificationScore;
  final int complianceStreak;
  final double totalRebatesEarned;
  final double overallScore;
  final int rank;

  LeaderboardEntry({
    required this.societyId,
    required this.societyName,
    required this.totalReports,
    required this.approvedReports,
    required this.consistencyScore,
    required this.averageVerificationScore,
    required this.complianceStreak,
    required this.totalRebatesEarned,
    required this.overallScore,
    required this.rank,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      societyId: json['societyId'] ?? '',
      societyName: json['societyName'] ?? '',
      totalReports: json['totalReports'] ?? 0,
      approvedReports: json['approvedReports'] ?? 0,
      consistencyScore: (json['consistencyScore'] ?? 0).toDouble(),
      averageVerificationScore: (json['averageVerificationScore'] ?? 0)
          .toDouble(),
      complianceStreak: json['complianceStreak'] ?? 0,
      totalRebatesEarned: (json['totalRebatesEarned'] ?? 0).toDouble(),
      overallScore: (json['overallScore'] ?? 0).toDouble(),
      rank: json['rank'] ?? 0,
    );
  }
}

class Report {
  final String id;
  final DateTime submissionDate;
  final String verificationStatus;
  final double? aiTrustScore;
  final double? verificationProbability;
  final double? rebateAmount;
  final int? approvedDays;

  Report({
    required this.id,
    required this.submissionDate,
    required this.verificationStatus,
    this.aiTrustScore,
    this.verificationProbability,
    this.rebateAmount,
    this.approvedDays,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      id: json['_id'] ?? json['id'] ?? '',
      submissionDate: json['submissionDate'] != null
          ? DateTime.parse(json['submissionDate'])
          : DateTime.now(),
      verificationStatus: json['verificationStatus'] ?? 'PENDING',
      aiTrustScore: json['aiTrustScore']?.toDouble(),
      verificationProbability: json['verificationProbability']?.toDouble(),
      rebateAmount: json['rebateAmount']?.toDouble(),
      approvedDays: json['approvedDays'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'submissionDate': submissionDate.toIso8601String(),
      'verificationStatus': verificationStatus,
      'aiTrustScore': aiTrustScore,
      'verificationProbability': verificationProbability,
      'rebateAmount': rebateAmount,
      'approvedDays': approvedDays,
    };
  }
}

class MyReportsResponse {
  final int count;
  final List<Report> reports;

  MyReportsResponse({required this.count, required this.reports});

  factory MyReportsResponse.fromJson(Map<String, dynamic> json) {
    return MyReportsResponse(
      count: json['count'] ?? 0,
      reports:
          (json['reports'] as List<dynamic>?)
              ?.map((e) => Report.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class CompostWeightResponse {
  final double dailyCompostWeight;

  CompostWeightResponse({required this.dailyCompostWeight});

  factory CompostWeightResponse.fromJson(Map<String, dynamic> json) {
    return CompostWeightResponse(
      dailyCompostWeight: (json['data']?['dailyCompostWeight'] ?? 0).toDouble(),
    );
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() =>
      'ApiException: $message${statusCode != null ? ' (Status: $statusCode)' : ''}';
}
