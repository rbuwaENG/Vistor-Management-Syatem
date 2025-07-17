import 'package:flutter/material.dart';
import 'scan_screen.dart';
import '../services/firestore_services.dart';
import '../models/scan_record.dart';

class HomeScreen extends StatelessWidget {
  final firestoreService = FirestoreService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Security Dashboard')),
      body: SafeArea(
        child: FutureBuilder<List<ScanRecord>>(
          future: firestoreService.getTodayScans(),
          builder: (context, snapshot) {
            if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());

            final scans = snapshot.data!;

            final totalGuests = scans.length;
            final scannedOutCount = scans.where((r) => r.outTime != null).length;
            final notAllowedCount = scans.where((r) => r.isAllowed == false).length;
            final notAllowedGuests = scans.where((r) => r.isAllowed == false).toList();

            return Column(
              children: [
                // Horizontal scroll on small screens, so cards don't overflow
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                  child: Row(
                    children: [
                      SizedBox(width: 8),
                      _buildCountCard(
                        context,
                        title: 'Total Guests',
                        count: totalGuests,
                        icon: Icons.people,
                        color: Colors.blue.shade700,
                      ),
                      SizedBox(width: 12),
                      _buildCountCard(
                        context,
                        title: 'Scanned Out',
                        count: scannedOutCount,
                        icon: Icons.check_circle,
                        color: Colors.green.shade700,
                      ),
                      SizedBox(width: 12),
                      _buildCountCard(
                        context,
                        title: 'Not Allowed',
                        count: notAllowedCount,
                        icon: Icons.block,
                        color: Colors.red.shade700,
                      ),
                      SizedBox(width: 8),
                    ],
                  ),
                ),

                const SizedBox(height: 8),

                // The list takes all remaining space
                Expanded(
                  child: notAllowedCount > 0
                      ? ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: notAllowedGuests.length + 1,
                          itemBuilder: (context, index) {
                            if (index == 0) {
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                child: Text(
                                  'Not Allowed Guests',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.red.shade700,
                                      ),
                                ),
                              );
                            }
                            final guest = notAllowedGuests[index - 1];
                            return Card(
                              color: Colors.red.shade50,
                              margin: const EdgeInsets.symmetric(vertical: 6),
                              child: ListTile(
                                leading: const Icon(Icons.block, color: Colors.red),
                                title: Text(guest.guestNIC, style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('In: ${guest.inTime}\nOut: ${guest.outTime ?? 'Pending'}'),
                                trailing: const Text('Rejected', style: TextStyle(color: Colors.red)),
                              ),
                            );
                          },
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: scans.length,
                          itemBuilder: (context, index) {
                            final record = scans[index];
                            return ListTile(
                              title: Text(record.guestNIC),
                              subtitle: Text('${record.inTime} → ${record.outTime ?? 'Pending'}'),
                              trailing: record.isAllowed == false
                                  ? const Icon(Icons.block, color: Colors.red)
                                  : null,
                            );
                          },
                        ),
                ),
              ],
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ScanScreen())),
        child: const Icon(Icons.qr_code_scanner),
      ),
    );
  }

  Widget _buildCountCard(
    BuildContext context, {
    required String title,
    required int count,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        width: 110,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: color.withOpacity(0.1),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min, // <-- prevents overflow by wrapping tightly
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 28, color: color),
            const SizedBox(height: 8),
            Text(
              count.toString(),
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: color),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
