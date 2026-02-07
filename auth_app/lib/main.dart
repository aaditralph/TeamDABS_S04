import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart'; 
import 'package:geocoding/geocoding.dart'; 
import 'api_service.dart';

void main() {
  runApp(const MyApp());
}

// --- App Root ---
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Society Manager',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
        useMaterial3: true,
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: Colors.blue.shade50,
        ),
      ),
      // CHANGED: Direct access to Secretary Login (No Role Selection)
      home: const SecretaryAuthWrapper(),
    );
  }
}

// ==========================================
// SECRETARY / COMMITTEE FLOW
// ==========================================

class SecretaryAuthWrapper extends StatefulWidget {
  const SecretaryAuthWrapper({super.key});

  @override
  State<SecretaryAuthWrapper> createState() => _SecretaryAuthWrapperState();
}

class _SecretaryAuthWrapperState extends State<SecretaryAuthWrapper> {
  bool showRegister = false; // Default to Login screen first
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

class UserProfileData {
  String name; String address; String email; String ward;
  UserProfileData({required this.name, required this.address, required this.email, required this.ward});
}

class RegisterPage extends StatelessWidget {
  final VoidCallback onTapLogin;
  const RegisterPage({super.key, required this.onTapLogin});

  @override
  Widget build(BuildContext context) {
    final nameController = TextEditingController();
    final addressController = TextEditingController();
    final meterController = TextEditingController();
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    final wardController = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text("Secretary Registration")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Building Name', prefixIcon: Icon(Icons.apartment))),
              const SizedBox(height: 16),
              TextField(controller: addressController, decoration: const InputDecoration(labelText: 'Address', prefixIcon: Icon(Icons.location_on))),
              const SizedBox(height: 16),
              TextField(controller: meterController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Meter Number', prefixIcon: Icon(Icons.electric_meter))),
              const SizedBox(height: 16),
              TextField(controller: wardController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Ward Number', prefixIcon: Icon(Icons.map))),
              const SizedBox(height: 16),
              TextField(controller: emailController, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email of Society', prefixIcon: Icon(Icons.email))),
              const SizedBox(height: 16),
              TextField(controller: passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock))),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  final newUser = UserProfileData(
                    name: nameController.text.isNotEmpty ? nameController.text : "Unknown Building",
                    address: addressController.text.isNotEmpty ? addressController.text : "No Address",
                    email: emailController.text.isNotEmpty ? emailController.text : "No Email",
                    ward: wardController.text.isNotEmpty ? wardController.text : "No Ward",
                  );
                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => SecretaryDashboardPage(userProfile: newUser)));
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Register as Secretary'),
              ),
              const SizedBox(height: 20),
              TextButton(onPressed: onTapLogin, child: const Text('Already registered? Login')),
            ],
          ),
        ),
      ),
    );
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
      appBar: AppBar(title: const Text("Secretary Login")),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(controller: emailController, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email of Society', prefixIcon: Icon(Icons.email))),
              const SizedBox(height: 16),
              TextField(controller: passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock))),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  final dummyUser = UserProfileData(name: "Green Valley Co-op", address: "123 Main St", email: emailController.text, ward: "B-2");
                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => SecretaryDashboardPage(userProfile: dummyUser)));
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Login'),
              ),
              const SizedBox(height: 20),
              TextButton(onPressed: onTapRegister, child: const Text('New Society? Register')),
            ],
          ),
        ),
      ),
    );
  }
}

// --- Secretary Dashboard ---
class SecretaryDashboardPage extends StatefulWidget {
  final UserProfileData userProfile;
  const SecretaryDashboardPage({super.key, required this.userProfile});

  @override
  State<SecretaryDashboardPage> createState() => _SecretaryDashboardPageState();
}

class _SecretaryDashboardPageState extends State<SecretaryDashboardPage> {
  String _currentView = 'Upload Report'; 

  void _showCalendar() {
    showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) => Theme(data: ThemeData.light().copyWith(colorScheme: const ColorScheme.light(primary: Colors.indigo)), child: child!),
    );
  }

  void _showProfile() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Row(children: const [Icon(Icons.person, color: Colors.indigo), SizedBox(width: 10), Text("Secretary Profile")]),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Building: ${widget.userProfile.name}"),
            Text("Ward: ${widget.userProfile.ward}"),
          ],
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text("Close"))],
      ),
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
          IconButton(icon: const Icon(Icons.calendar_month), onPressed: _showCalendar),
          IconButton(icon: const Icon(Icons.person), onPressed: _showProfile),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Colors.indigo),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.end, children: [
                const Icon(Icons.admin_panel_settings, color: Colors.white, size: 40),
                const SizedBox(height: 10),
                Text(widget.userProfile.name, style: const TextStyle(color: Colors.white, fontSize: 18)),
                const Text("Secretary Mode", style: TextStyle(color: Colors.white70, fontSize: 14)),
              ]),
            ),
            ListTile(leading: const Icon(Icons.camera_alt), title: const Text('Upload Report'), onTap: () { setState(() => _currentView = 'Upload Report'); Navigator.pop(context); }),
            ListTile(leading: const Icon(Icons.history), title: const Text('Previous Report Status'), onTap: () { setState(() => _currentView = 'Previous Report'); Navigator.pop(context); }),
            ListTile(leading: const Icon(Icons.psychology), title: const Text('AI Recommendation'), onTap: () { setState(() => _currentView = 'AI Recommendation'); Navigator.pop(context); }),
            ListTile(leading: const Icon(Icons.store), title: const Text('Market'), onTap: () { setState(() => _currentView = 'Market'); Navigator.pop(context); }),
            ListTile(leading: const Icon(Icons.newspaper), title: const Text('News Dashboard'), onTap: () { setState(() => _currentView = 'News Dashboard'); Navigator.pop(context); }),
            const Divider(),
            // UPDATED LOGOUT: Goes back to Secretary Auth
            ListTile(leading: const Icon(Icons.logout, color: Colors.red), title: const Text('Logout'), onTap: () => Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const SecretaryAuthWrapper()), (route) => false)),
          ],
        ),
      ),
      body: _getBodyWidget(),
    );
  }

  Widget _getBodyWidget() {
    switch (_currentView) {
      case 'Upload Report': return const UploadReportView();
      case 'Previous Report': return const Center(child: Text("Previous Reports (Backend Pending)"));
      case 'AI Recommendation': return const Center(child: Padding(padding: EdgeInsets.all(20), child: Text("Keep it up! Everything is good.", textAlign: TextAlign.center, style: TextStyle(fontSize: 20, color: Colors.indigo))));
      case 'Market': return const MarketView();
      case 'News Dashboard': return const Center(child: Text("News Feed loading..."));
      default: return const UploadReportView();
    }
  }
}

// --- Photo Upload Logic (Geotagging + Address) ---
class TaggedPhoto {
  final File file;
  final String? address;
  TaggedPhoto(this.file, this.address);
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
  bool _isLoadingLocation = false;

  Future<void> _takePhoto(bool isComposter) async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    setState(() => _isLoadingLocation = true);

    try {
      final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
      if (photo != null) {
        Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
        String readableAddress = placemarks.isNotEmpty 
            ? "${placemarks[0].name}, ${placemarks[0].subLocality}, ${placemarks[0].locality}" 
            : "Lat: ${position.latitude}";

        setState(() {
          final tagged = TaggedPhoto(File(photo.path), readableAddress);
          if (isComposter) _composterPhotos.add(tagged); else _meterPhotos.add(tagged);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Location Error: $e")));
    } finally {
      setState(() => _isLoadingLocation = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_isLoadingLocation) const LinearProgressIndicator(),
          const Text("Photos are automatically geotagged.", style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic), textAlign: TextAlign.center),
          const SizedBox(height: 20),
          ElevatedButton.icon(onPressed: () => _takePhoto(true), icon: const Icon(Icons.camera_alt), label: const Text("Upload Composter Photo")),
          _buildPhotoGrid(_composterPhotos),
          const SizedBox(height: 20),
          ElevatedButton.icon(onPressed: () => _takePhoto(false), icon: const Icon(Icons.electric_meter), label: const Text("Upload Meters Photo")),
          _buildPhotoGrid(_meterPhotos),
          const SizedBox(height: 40),
          ElevatedButton(onPressed: () { 
             // BACKEND TODO: Upload these photos to server
             ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Report Submitted!'))); 
             setState(() { _composterPhotos.clear(); _meterPhotos.clear(); });
          }, child: const Text("SUBMIT REPORT")),
        ],
      ),
    );
  }

  Widget _buildPhotoGrid(List<TaggedPhoto> photos) {
    if (photos.isEmpty) return const SizedBox.shrink();
    return Container(
      height: 160,
      margin: const EdgeInsets.only(top: 10),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: photos.length,
        itemBuilder: (context, index) {
          return Container(
            width: 140,
            margin: const EdgeInsets.only(right: 8.0),
            child: Column(children: [
              Expanded(child: ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.file(photos[index].file, width: 140, fit: BoxFit.cover))),
              Text(photos[index].address ?? "", style: const TextStyle(fontSize: 10), textAlign: TextAlign.center, maxLines: 3)
            ]),
          );
        },
      ),
    );
  }
}

class MarketView extends StatelessWidget {
  const MarketView({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.all(20), child: Center(child: Text("Market Place (Backend TODO)")));
  }
}