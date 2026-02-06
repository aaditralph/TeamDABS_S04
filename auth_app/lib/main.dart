import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'api_service.dart';
import 'models/auth_models.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'DABS_Project',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        useMaterial3: true,
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: Colors.blue.shade50,
        ),
      ),
      home: const RoleSelectionPage(),
    );
  }
}

class RoleSelectionPage extends StatelessWidget {
  const RoleSelectionPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.apartment, size: 80, color: Colors.indigo),
              const SizedBox(height: 40),
              const Text(
                'DABS Project',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.indigo,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Compost Marketplace',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 60),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const MarketView()),
                  );
                },
                icon: const Icon(Icons.store),
                label: const Text("Browse Marketplace"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SecretaryAuthWrapper(),
                    ),
                  );
                },
                icon: const Icon(Icons.admin_panel_settings),
                label: const Text("Society Login / Register"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SecretaryAuthWrapper extends StatefulWidget {
  const SecretaryAuthWrapper({super.key});

  @override
  State<SecretaryAuthWrapper> createState() => _SecretaryAuthWrapperState();
}

class _SecretaryAuthWrapperState extends State<SecretaryAuthWrapper> {
  bool showRegister = false;

  void toggleView() => setState(() => showRegister = !showRegister);

  @override
  Widget build(BuildContext context) {
    if (showRegister) {
      return RegisterPage(onTapLogin: toggleView);
    } else {
      return LoginPage(onTapRegister: toggleView);
    }
  }
}

class LoginPage extends StatelessWidget {
  final VoidCallback onTapRegister;
  const LoginPage({super.key, required this.onTapRegister});

  @override
  Widget build(BuildContext context) {
    final emailController = TextEditingController();
    final passwordController = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text("Society Login")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock),
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  if (emailController.text.isEmpty ||
                      passwordController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Please fill all fields")),
                    );
                    return;
                  }

                  final response = await ApiService.loginSociety(
                    emailController.text,
                    passwordController.text,
                  );

                  if (response != null) {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const SecretaryDashboardPage(),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          "Login failed. Check credentials or account approval.",
                        ),
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Login'),
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: onTapRegister,
                child: const Text('New Society? Register'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class RegisterPage extends StatelessWidget {
  final VoidCallback onTapLogin;
  const RegisterPage({super.key, required this.onTapLogin});

  @override
  Widget build(BuildContext context) {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    final phoneController = TextEditingController();
    final societyNameController = TextEditingController();
    final streetController = TextEditingController();
    final cityController = TextEditingController();
    final stateController = TextEditingController();
    final pincodeController = TextEditingController();
    final meterController = TextEditingController();
    final taxController = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text("Society Registration")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Your Name',
                  prefixIcon: Icon(Icons.person),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone',
                  prefixIcon: Icon(Icons.phone),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: societyNameController,
                decoration: const InputDecoration(
                  labelText: 'Society Name',
                  prefixIcon: Icon(Icons.apartment),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: streetController,
                decoration: const InputDecoration(
                  labelText: 'Street Address',
                  prefixIcon: Icon(Icons.location_on),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: cityController,
                      decoration: const InputDecoration(labelText: 'City'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      controller: stateController,
                      decoration: const InputDecoration(labelText: 'State'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: pincodeController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Pincode',
                  prefixIcon: Icon(Icons.local_post_office),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: meterController,
                decoration: const InputDecoration(
                  labelText: 'Electric Meter Serial Number',
                  prefixIcon: Icon(Icons.electric_meter),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: taxController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Property Tax Estimate',
                  prefixText: 'Rs. ',
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () async {
                  if (nameController.text.isEmpty ||
                      emailController.text.isEmpty ||
                      passwordController.text.isEmpty ||
                      societyNameController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Please fill required fields"),
                      ),
                    );
                    return;
                  }

                  final response = await ApiService.registerSociety(
                    name: nameController.text,
                    email: emailController.text,
                    password: passwordController.text,
                    phone: phoneController.text,
                    societyName: societyNameController.text,
                    street: streetController.text,
                    city: cityController.text,
                    state: stateController.text,
                    pincode: pincodeController.text,
                    latitude: 19.0760,
                    longitude: 72.8777,
                    propertyTaxEstimate:
                        double.tryParse(taxController.text) ?? 0,
                    electricMeterSerialNumber: meterController.text,
                  );

                  if (response != null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          "Registration successful! Waiting for admin approval.",
                        ),
                      ),
                    );
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const SecretaryAuthWrapper(),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text("Registration failed. Try again."),
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Register'),
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: onTapLogin,
                child: const Text('Already registered? Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SecretaryDashboardPage extends StatefulWidget {
  const SecretaryDashboardPage({super.key});

  @override
  State<SecretaryDashboardPage> createState() => _SecretaryDashboardPageState();
}

class _SecretaryDashboardPageState extends State<SecretaryDashboardPage> {
  String _currentView = 'Upload Report';

  void _logout() async {
    await ApiService.clearToken();
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const RoleSelectionPage()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_currentView),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Colors.indigo),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  const Icon(
                    Icons.admin_panel_settings,
                    color: Colors.white,
                    size: 40,
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Society Dashboard",
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  const Text(
                    "Secretary Mode",
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Upload Report'),
              onTap: () {
                setState(() => _currentView = 'Upload Report');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.history),
              title: const Text('My Reports'),
              onTap: () {
                setState(() => _currentView = 'My Reports');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.store),
              title: const Text('Marketplace'),
              onTap: () {
                setState(() => _currentView = 'Marketplace');
                Navigator.pop(context);
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Logout'),
              onTap: _logout,
            ),
          ],
        ),
      ),
      body: _getBodyWidget(),
    );
  }

  Widget _getBodyWidget() {
    switch (_currentView) {
      case 'Upload Report':
        return const UploadReportView();
      case 'My Reports':
        return const MyReportsView();
      case 'Marketplace':
        return const MarketView();
      default:
        return const UploadReportView();
    }
  }
}

class TaggedPhoto {
  final File file;
  final String? address;
  final double? latitude;
  final double? longitude;
  final double? accuracy;

  TaggedPhoto(
    this.file,
    this.address,
    this.latitude,
    this.longitude,
    this.accuracy,
  );
}

class UploadReportView extends StatefulWidget {
  const UploadReportView({super.key});

  @override
  State<UploadReportView> createState() => _UploadReportViewState();
}

class _UploadReportViewState extends State<UploadReportView> {
  final List<TaggedPhoto> _composterPhotos = [];
  final List<TaggedPhoto> _meterPhotos = [];
  final ImagePicker _picker = ImagePicker();
  bool _isLoading = false;
  bool _isSubmitting = false;

  Future<void> _takePhoto(bool isComposter) async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    setState(() => _isLoading = true);

    try {
      final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
      if (photo != null) {
        Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );
        List<Placemark> placemarks = await placemarkFromCoordinates(
          position.latitude,
          position.longitude,
        );
        String readableAddress = placemarks.isNotEmpty
            ? "${placemarks[0].name}, ${placemarks[0].subLocality}, ${placemarks[0].locality}"
            : "Lat: ${position.latitude.toStringAsFixed(4)}";

        setState(() {
          final tagged = TaggedPhoto(
            File(photo.path),
            readableAddress,
            position.latitude,
            position.longitude,
            position.accuracy,
          );
          if (isComposter) {
            _composterPhotos.add(tagged);
          } else {
            _meterPhotos.add(tagged);
          }
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Location Error: $e")));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitReport() async {
    if (_composterPhotos.isEmpty && _meterPhotos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please take at least one photo")),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final token = await ApiService.getToken();
      if (token == null) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text("Please login first")));
        return;
      }

      final composterFile = _composterPhotos.isNotEmpty
          ? _composterPhotos.last
          : null;
      final meterFile = _meterPhotos.isNotEmpty ? _meterPhotos.last : null;

      final response = await ApiService.submitReport(
        token: token,
        meterImage: meterFile?.file ?? composterFile!.file,
        composterImage: composterFile?.file ?? meterFile!.file,
        latitude: (meterFile ?? composterFile)!.latitude!,
        longitude: (meterFile ?? composterFile)!.longitude!,
        accuracy: (meterFile ?? composterFile)!.accuracy!,
      );

      if (response != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Report submitted! ID: ${response.reportId}")),
        );
        setState(() {
          _composterPhotos.clear();
          _meterPhotos.clear();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Failed to submit report")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_isLoading || _isSubmitting) const LinearProgressIndicator(),
          const Text(
            "Take photos with automatic GPS tagging",
            style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => _takePhoto(true),
            icon: const Icon(Icons.camera_alt),
            label: const Text("Composter Photo"),
          ),
          _buildPhotoGrid(_composterPhotos, "Composter"),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: () => _takePhoto(false),
            icon: const Icon(Icons.electric_meter),
            label: const Text("Meter Photo"),
          ),
          _buildPhotoGrid(_meterPhotos, "Meter"),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submitReport,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.indigo,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            child: _isSubmitting
                ? const Text("Submitting...")
                : const Text("SUBMIT REPORT"),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoGrid(List<TaggedPhoto> photos, String label) {
    if (photos.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 10),
        Text(
          "$label Photos:",
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        Container(
          height: 160,
          margin: const EdgeInsets.only(top: 10),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: photos.length,
            itemBuilder: (context, index) {
              return Container(
                width: 140,
                margin: const EdgeInsets.only(right: 8.0),
                child: Column(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(
                          photos[index].file,
                          width: 140,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Text(
                      photos[index].address ?? "",
                      style: const TextStyle(fontSize: 10),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class MyReportsView extends StatefulWidget {
  const MyReportsView({super.key});

  @override
  State<MyReportsView> createState() => _MyReportsViewState();
}

class _MyReportsViewState extends State<MyReportsView> {
  List<Report> _reports = [];
  bool _isLoading = true;
  String _error = "";

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() => _isLoading = true);

    try {
      final token = await ApiService.getToken();
      if (token == null) {
        setState(() {
          _error = "Please login first";
          _isLoading = false;
        });
        return;
      }

      final response = await ApiService.getMyReports(token);
      if (response != null) {
        setState(() => _reports = response.reports);
      } else {
        setState(() => _error = "Failed to load reports");
      }
    } catch (e) {
      setState(() => _error = "Error: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error.isNotEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: _loadReports, child: const Text("Retry")),
          ],
        ),
      );
    }

    if (_reports.isEmpty) {
      return const Center(child: Text("No reports submitted yet"));
    }

    return RefreshIndicator(
      onRefresh: _loadReports,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _reports.length,
        itemBuilder: (context, index) {
          final report = _reports[index];
          final date = report.submissionDate.toString().split(' ')[0];
          final status = report.verificationStatus;
          Color statusColor;
          switch (status) {
            case 'AUTO_APPROVED':
            case 'OFFICER_APPROVED':
              statusColor = Colors.green;
              break;
            case 'REJECTED':
              statusColor = Colors.red;
              break;
            default:
              statusColor = Colors.orange;
          }

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: ListTile(
              leading: Icon(
                status == 'PENDING' ? Icons.pending : Icons.check_circle,
                color: statusColor,
                size: 32,
              ),
              title: Text("Report #$date"),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Status: $status"),
                  if (report.rebateAmount != null)
                    Text("Rebate: Rs. ${report.rebateAmount}"),
                ],
              ),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }
}

class MarketView extends StatefulWidget {
  const MarketView({super.key});

  @override
  State<MarketView> createState() => _MarketViewState();
}

class _MarketViewState extends State<MarketView> {
  List<SocietySummary> _societies = [];
  bool _isLoading = true;
  String _error = "";

  @override
  void initState() {
    super.initState();
    _loadSocieties();
  }

  Future<void> _loadSocieties() async {
    setState(() => _isLoading = true);

    try {
      final response = await ApiService.getSocieties(compostAvailable: true);
      setState(() => _societies = response);
    } catch (e) {
      setState(() => _error = "Failed to load societies: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error.isNotEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loadSocieties,
              child: const Text("Retry"),
            ),
          ],
        ),
      );
    }

    if (_societies.isEmpty) {
      return const Center(child: Text("No societies with compost available"));
    }

    return RefreshIndicator(
      onRefresh: _loadSocieties,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _societies.length,
        itemBuilder: (context, index) {
          final society = _societies[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: ListTile(
              leading: const Icon(
                Icons.apartment,
                color: Colors.green,
                size: 32,
              ),
              title: Text(society.societyName),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(society.address.toDisplayString()),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.eco, size: 14, color: Colors.green),
                      Text(
                        " ${society.dailyCompostWeight}kg compost available",
                      ),
                    ],
                  ),
                  if (society.complianceStreak > 0)
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: Colors.amber),
                        Text(" ${society.complianceStreak} day streak"),
                      ],
                    ),
                ],
              ),
              isThreeLine: true,
              trailing: IconButton(
                icon: const Icon(Icons.phone),
                onPressed: () {},
              ),
            ),
          );
        },
      ),
    );
  }
}
