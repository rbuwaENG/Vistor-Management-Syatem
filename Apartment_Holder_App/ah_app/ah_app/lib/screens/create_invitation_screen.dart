// screens/create_invitation_screen.dart
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class CreateInvitationScreen extends StatefulWidget {
  const CreateInvitationScreen({super.key});

  @override
  _CreateInvitationScreenState createState() => _CreateInvitationScreenState();
}

class _CreateInvitationScreenState extends State<CreateInvitationScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _nicController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  DateTime? _entryTime;
  DateTime? _exitTime;
  File? _nicImage;
  String? _qrData;
  bool _isLoading = false;
  bool _qrGenerated = false;

  Future<void> _pickImage() async {
    final pickedFile = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() => _nicImage = File(pickedFile.path));
    }
  }

  Future<void> _generateQR() async {
    if (!_formKey.currentState!.validate()) return;
   // if (_nicImage == null) {
   //   ScaffoldMessenger.of(context).showSnackBar(
     //   const SnackBar(content: Text('Please upload NIC photo')),
   //   );
  //    return;
  //  }
    if (_entryTime == null || _exitTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select entry and exit times')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Upload NIC image to Firebase Storage
    //  final storageRef = FirebaseStorage.instance.ref().child(
     //     'nic_images/${DateTime.now().millisecondsSinceEpoch}.jpg');
      //await storageRef.putFile(_nicImage!);
    //final nicImageUrl = await storageRef.getDownloadURL();

      // Create guest document in Firestore
      final guestRef = await FirebaseFirestore.instance.collection('guests').add({
        'apartmentHolderId': Provider.of<AuthService>(context, listen: false).currentUser?.uid,
        'name': _nameController.text,
        'nic': _nicController.text,
        //'nicPhoto': nicImageUrl,
        'age': int.parse(_ageController.text),
        'entryTime': Timestamp.fromDate(_entryTime!),
        'exitTime': Timestamp.fromDate(_exitTime!),
        'createdAt': Timestamp.now(),
        'scansLeft': 2,
        'status': 'active',
      });

      setState(() {
        _qrData = guestRef.id;
        _qrGenerated = true;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _shareQR() async {
    if (_qrData == null) return;

    try {
      final qrImage = await QrPainter(
        data: _qrData!,
        version: QrVersions.auto,
      ).toImageData(300);

      final tempDir = await getTemporaryDirectory();
      final filePath = '${tempDir.path}/guest_qr.png';
      final file = File(filePath);
      await file.writeAsBytes(qrImage!.buffer.asUint8List());

      await Share.shareXFiles(
        [XFile(filePath)],
        text: 'Guest Invitation for ${_nameController.text}',
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Share failed: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Guest Invitation')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (!_qrGenerated) ...[
                      TextFormField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Guest Full Name',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter guest name';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _nicController,
                        decoration: const InputDecoration(
                          labelText: 'NIC Number',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter NIC number';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _ageController,
                        decoration: const InputDecoration(
                          labelText: 'Age',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter age';
                          }
                          if (int.tryParse(value) == null) {
                            return 'Please enter a valid number';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      const Text('Entry Time:', style: TextStyle(fontWeight: FontWeight.bold)),
                      ElevatedButton(
                        onPressed: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                          );
                          if (time != null) {
                            final now = DateTime.now();
                            setState(() => _entryTime = DateTime(
                              now.year, now.month, now.day, time.hour, time.minute));
                          }
                        },
                        child: Text(_entryTime == null
                            ? 'Select Entry Time'
                            : DateFormat.jm().format(_entryTime!)),
                      ),
                      const SizedBox(height: 20),
                      const Text('Exit Time:', style: TextStyle(fontWeight: FontWeight.bold)),
                      ElevatedButton(
                        onPressed: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                          );
                          if (time != null) {
                            final now = DateTime.now();
                            setState(() => _exitTime = DateTime(
                              now.year, now.month, now.day, time.hour, time.minute));
                          }
                        },
                        child: Text(_exitTime == null
                            ? 'Select Exit Time'
                            : DateFormat.jm().format(_exitTime!)),
                      ),
                     // const SizedBox(height: 20)
                     // const Text('NIC Photo:', style: TextStyle(fontWeight: FontWeight.bold)),
                    //  const SizedBox(height: 10),
                  //    _nicImage == null
                    //      ? ElevatedButton(
                      //        onPressed: _pickImage,
                       //       child: const Text('Upload NIC Photo'),
                          //  )
                      //    : Column(
                       //       children: [
                      //          Image.file(_nicImage!, height: 150),
                         //       TextButton(
                        //          onPressed: _pickImage,
                        //         child: const Text('Change Photo'),
                        //        ),
                          //    ],
                         //   ),
                      const SizedBox(height: 30),
                      ElevatedButton(
                        onPressed: _generateQR,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: const Text('Generate QR Code'),
                      ),
                    ] else ...[
                      const Text(
                        'Guest Invitation QR Code',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      Card(
                        elevation: 4,
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            children: [
                              QrImageView(
                                data: _qrData!,
                                version: QrVersions.auto,
                                size: 200,
                              ),
                              const SizedBox(height: 20),
                              Text(
                                'Valid until: ${DateFormat.yMMMd().add_jm().format(DateTime.now().add(const Duration(days: 1)))}',
                                style: const TextStyle(fontStyle: FontStyle.italic),
                              ),
                              const SizedBox(height: 20),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                children: [
                                  ElevatedButton(
                                    onPressed: _shareQR,
                                    child: const Text('Share QR'),
                                  ),
                                  ElevatedButton(
                                    onPressed: () => setState(() => _qrGenerated = false),
                                    child: const Text('Create Another'),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Guest Details',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Divider(),
                      ListTile(
                        title: const Text('Name'),
                        subtitle: Text(_nameController.text),
                      ),
                      ListTile(
                        title: const Text('NIC Number'),
                        subtitle: Text(_nicController.text),
                      ),
                      ListTile(
                        title: const Text('Age'),
                        subtitle: Text(_ageController.text),
                      ),
                      ListTile(
                        title: const Text('Entry Time'),
                        subtitle: Text(DateFormat.jm().format(_entryTime!)),
                      ),
                      ListTile(
                        title: const Text('Exit Time'),
                        subtitle: Text(DateFormat.jm().format(_exitTime!)),
                      ),
                    ],
                  ],
                ),
              ),
            ),
    );
  }
}