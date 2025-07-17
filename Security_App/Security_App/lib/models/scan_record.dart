class ScanRecord {
  final String guestNIC;
  final String inTime;
  final String? outTime;
  final bool isAllowed;  // new field

  ScanRecord({
    required this.guestNIC,
    required this.inTime,
    this.outTime,
    required this.isAllowed,
  });

  factory ScanRecord.fromMap(Map<String, dynamic> data) {
    return ScanRecord(
      guestNIC: data['qrCode'],
      inTime: data['timestamp'].toDate().toString(),
      outTime: data['type'] == 'out' ? data['timestamp'].toDate().toString() : null,
      isAllowed: data['isAllowed'] ?? true,  // default to true if missing
    );
  }
}
