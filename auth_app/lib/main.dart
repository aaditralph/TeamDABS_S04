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
      // NEW: We start at the Role Selection Screen
      home: const RoleSelectionPage(),
    );
  }
}

// ==========================================
// 1. LANDING PAGE (Select Role)
// ==========================================
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
                'Welcome to Society Manager',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.indigo),
              ),
              const SizedBox(height: 60),
              
              // Option 1: Resident
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ResidentLoginPage()));
                },
                icon: const Icon(Icons.person),
                label: const Text("Login as Resident"),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  backgroundColor: Colors.blue, 
                  foregroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              
              // Option 2: Secretary / Committee
              ElevatedButton.icon(
                onPressed: () {
                  // Goes to the AuthWrapper we built before
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const SecretaryAuthWrapper()));
                },
                icon: const Icon(Icons.admin_panel_settings),
                label: const Text("Login as Secretary / Committee"),
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

// ==========================================
// 2. RESIDENT FLOW (New Features)
// ==========================================

// --- Resident Login ---
class ResidentLoginPage extends StatelessWidget {
  const ResidentLoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    final buildingController = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text("Resident Login")),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              "Access your Building Dashboard",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 30),
            TextField(
              controller: buildingController,
              decoration: const InputDecoration(
                labelText: 'Enter Building Email OR Name',
                prefixIcon: Icon(Icons.search),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // BACKEND TODO: Validate if this building exists in DB
                if (buildingController.text.isNotEmpty) {
                  Navigator.pushReplacement(
                    context, 
                    MaterialPageRoute(builder: (_) => ResidentDashboard(buildingName: buildingController.text))
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please enter a name")));
                }
              },
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
              child: const Text("Login to Dashboard"),
            ),
          ],
        ),
      ),
    );
  }
}

// --- Resident Dashboard ---
class ResidentDashboard extends StatefulWidget {
  final String buildingName;
  const ResidentDashboard({super.key, required this.buildingName});

  @override
  State<ResidentDashboard> createState() => _ResidentDashboardState();
}

class _ResidentDashboardState extends State<ResidentDashboard> {
  String _currentView = 'Tax Rebate';

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
    // Shows the Building Name as requested
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Row(children: const [Icon(Icons.apartment, color: Colors.indigo), SizedBox(width: 10), Text("Current Building")]),
        content: Text("You are logged in viewing data for:\n\n${widget.buildingName}", style: const TextStyle(fontSize: 18)),
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
          IconButton(icon: const Icon(Icons.calendar_month), onPressed: _showCalendar), // "Calculator like before" (Calendar)
          IconButton(icon: const Icon(Icons.account_circle), onPressed: _showProfile),
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
                  const Icon(Icons.person, color: Colors.white, size: 40),
                  const SizedBox(height: 10),
                  const Text("Resident Menu", style: TextStyle(color: Colors.white, fontSize: 24)),
                  Text(widget.buildingName, style: const TextStyle(color: Colors.white70)),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.percent),
              title: const Text('Tax Rebate'),
              onTap: () { setState(() => _currentView = 'Tax Rebate'); Navigator.pop(context); },
            ),
            ListTile(
              leading: const Icon(Icons.description),
              title: const Text('Reports Sent'),
              onTap: () { setState(() => _currentView = 'Reports Sent'); Navigator.pop(context); },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Logout'),
              onTap: () => Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const RoleSelectionPage()), (route) => false),
            ),
          ],
        ),
      ),
      body: _getBodyWidget(),
    );
  }

  Widget _getBodyWidget() {
    switch (_currentView) {
      case 'Tax Rebate': return const TaxRebateView();
      case 'Reports Sent': return const ReportsSentView();
      default: return const TaxRebateView();
    }
  }
}

// --- Resident View 1: Tax Rebate ---
class TaxRebateView extends StatefulWidget {
  const TaxRebateView({super.key});

  @override
  State<TaxRebateView> createState() => _TaxRebateViewState();
}

class _TaxRebateViewState extends State<TaxRebateView> {
  String _resultText = "";

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text("Calculate Potential Rebate", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.indigo)),
          const SizedBox(height: 20),
          const TextField(
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Enter Property Tax Amount',
              prefixText: '₹ ',
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              // BACKEND TODO: 
              // 1. Send input amount to server.
              // 2. Server checks compost history.
              // 3. Server returns calculated rebate.
              
              setState(() {
                // Placeholder for now
                _resultText = "Based on your society's compost output, you are eligible for a 5% rebate!\n\nEstimated Saving: ₹ 1,200";
              });
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, foregroundColor: Colors.white),
            child: const Text("Calculate"),
          ),
          const SizedBox(height: 40),
          // Backend Response Area
          if (_resultText.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.green)),
              child: Text(_resultText, style: const TextStyle(fontSize: 16, color: Colors.green)),
            ),
        ],
      ),
    );
  }
}

// --- Resident View 2: Reports Sent ---
class ReportsSentView extends StatelessWidget {
  const ReportsSentView({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 3, // Dummy count
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            leading: const Icon(Icons.check_circle, color: Colors.green, size: 40),
            title: Text("Report #${1023 + index}"),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Submitted: Feb ${5 - index}, 2026"),
                // BACKEND TODO: Fetch the response from BMC office for this specific report
                const Text("Status: Approved by BMC Officer", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo)),
              ],
            ),
            isThreeLine: true,
          ),
        );
      },
    );
  }
}

// ==========================================
// 3. SECRETARY FLOW (Existing Logic)
// ==========================================

class SecretaryAuthWrapper extends StatefulWidget {
  const SecretaryAuthWrapper({super.key});

  @override
  State<SecretaryAuthWrapper> createState() => _SecretaryAuthWrapperState();
}

class _SecretaryAuthWrapperState extends State<SecretaryAuthWrapper> {
  bool showRegister = true;
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

// ... [The RegisterPage, LoginPage, and DashboardPage for Secretaries are below]
// ... [Using the EXACT SAME code from before, just renamed UserProfileData to avoid conflict if needed]

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
                  final dummyUser = UserProfileData(name: "Returning User", address: "123 Main St", email: emailController.text, ward: "B-2");
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

// --- Secretary Dashboard (The original one with Camera/Geotag) ---
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
                Text("Secretary Mode", style: const TextStyle(color: Colors.white70, fontSize: 14)),
              ]),
            ),
            ListTile(leading: const Icon(Icons.camera_alt), title: const Text('Upload Report'), onTap: () { setState(() => _currentView = 'Upload Report'); Navigator.pop(context); }),
            ListTile(leading: const Icon(Icons.history), title: const Text('Previous Report Status'), onTap: () { setState(() => _currentView = 'Previous Report'); Navigator.pop(context); }),
            ListTile(leading: const Icon(Icons.psychology), title: const Text('AI Recommendation'), onTap: () { setState(() => _currentView = 'AI Recommendation'); Navigator.pop(context); }),
            ListTile(leading: const Icon(Icons.store), title: const Text('Market'), onTap: () { setState(() => _currentView = 'Market'); Navigator.pop(context); }),
            ListTile(leading: const Icon(Icons.newspaper), title: const Text('News Dashboard'), onTap: () { setState(() => _currentView = 'News Dashboard'); Navigator.pop(context); }),
            const Divider(),
            ListTile(leading: const Icon(Icons.logout, color: Colors.red), title: const Text('Logout'), onTap: () => Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const RoleSelectionPage()), (route) => false)),
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

class MarketView extends StatefulWidget {
  const MarketView({super.key});

  @override
  State<MarketView> createState() => _MarketViewState();
}

class _MarketViewState extends State<MarketView> {
  // --- PASTE YOUR VARIABLES HERE ---
  List<dynamic> officersList = [];
  String status = "Ready to fetch";

  // --- PASTE YOUR FUNCTION HERE ---
  void loadData() async {
    setState(() => status = "Logging in...");

    // Step 1: Login
    String? token = await ApiService.loginAndGetToken();

    if (token != null) {
      setState(() => status = "Login Success! Fetching Officers...");
      
      // Step 2: Use Token to Get Data
      List<dynamic> officers = await ApiService.getPendingOfficers(token);

      setState(() {
        officersList = officers;
        status = "Loaded ${officers.length} officers";
      });
    } else {
      setState(() => status = "Login Failed. Check connection/IP.");
    }
  }

  // OPTIONAL: Call it automatically when page loads
  @override
  void initState() {
    super.initState();
    // loadData(); // Uncomment this if you want it to run immediately on open
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Market Place / Officers")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Status Text
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                status,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),

            // Button to Trigger the API
            ElevatedButton(
              onPressed: loadData,
              child: const Text("Fetch Data"),
            ),

            const SizedBox(height: 20),

            // List of Officers
            Expanded(
              child: officersList.isEmpty
                  ? const Text("No data yet")
                  : ListView.builder(
                      itemCount: officersList.length,
                      itemBuilder: (context, index) {
                        final officer = officersList[index];
                        return Card(
                          margin: const EdgeInsets.all(8),
                          child: ListTile(
                            leading: const Icon(Icons.person),
                            title: Text(officer['name'] ?? "Unknown Name"),
                            subtitle: Text(officer['email'] ?? "No Email"),
                            trailing: officer['isVerified'] == true 
                                ? const Icon(Icons.check, color: Colors.green)
                                : const Icon(Icons.warning, color: Colors.orange),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}