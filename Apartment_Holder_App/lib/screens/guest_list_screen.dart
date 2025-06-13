// screens/guest_list_screen.dart
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';

class GuestListScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final apartmentHolderId = Provider.of<AuthService>(context).currentUser?.uid;

    if (apartmentHolderId == null) {
      return const Center(child: Text('Not authenticated'));
    }

    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('guests')
          .where('apartmentHolderId', isEqualTo: apartmentHolderId)
          .orderBy('createdAt', descending: true)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }

        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return const Center(child: Text('No guests found'));
        }

        return ListView.builder(
          itemCount: snapshot.data!.docs.length,
          itemBuilder: (context, index) {
            final guest = snapshot.data!.docs[index];
            final data = guest.data() as Map<String, dynamic>;
            
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 8),
              child: ListTile(
                title: Text(data['name']),
                subtitle: Text('NIC: ${data['nic']}'),
                trailing: Text('Scans left: ${data['scansLeft']}'),
                onTap: () {
                  // Navigate to guest details screen
                },
              ),
            );
          },
        );
      },
    );
  }
}