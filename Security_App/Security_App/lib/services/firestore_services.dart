import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import '../models/scan_record.dart';

class FirestoreService {
  final _db = FirebaseFirestore.instance;

  Future<String> validateAndSaveScan(String code) async {
    try {
      final doc = await _db.collection('qr_invites').doc(code).get();
      if (!doc.exists) return "Invalid QR";

      final data = doc.data()!;
      final now = DateTime.now();
      final DateFormat fmt = DateFormat('yyyy-MM-dd');
      final isToday = fmt.format(now) == fmt.format(data['date'].toDate());

      if (!isToday) return "QR expired (not today)";
      if (data['scanCount'] >= 2) return "QR expired (max scans)";
      final enter = DateFormat.Hm().parse(data['enteringTime']);
      final leave = DateFormat.Hm().parse(data['leavingTime']);
      if (now.hour < enter.hour || now.hour > leave.hour) return "QR not valid in this time";

      await _db.collection('qr_invites').doc(code).update({'scanCount': FieldValue.increment(1)});
      await _db.collection('scans').add({
        'qrCode': code,
        'timestamp': now,
        'type': data['scanCount'] == 0 ? 'in' : 'out',
        'apartmentId': data['apartmentId']
      });

      // Send notification logic goes here
      return "Scan recorded successfully";
    } catch (e) {
      return "Scan error: ${e.toString()}";
    }
  }

  Future<List<ScanRecord>> getTodayScans() async {
    final today = DateTime.now();
    final result = await _db.collection('scans')
      .where('timestamp', isGreaterThanOrEqualTo: DateTime(today.year, today.month, today.day))
      .orderBy('timestamp', descending: true).get();

    return result.docs.map((e) => ScanRecord.fromMap(e.data())).toList();
  }
}
