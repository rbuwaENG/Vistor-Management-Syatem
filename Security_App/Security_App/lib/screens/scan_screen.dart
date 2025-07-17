import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/firestore_services.dart';

class ScanScreen extends StatefulWidget {
  @override
  _ScanScreenState createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final firestoreService = FirestoreService();
  MobileScannerController controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: (capture) async {
              if (_isProcessing) return;
              
              final barcode = capture.barcodes.firstOrNull;
              if (barcode?.rawValue == null) return;
              
              setState(() => _isProcessing = true);
              try {
                final result = await firestoreService.validateAndSaveScan(barcode!.rawValue!);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(result))
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: ${e.toString()}'))
                );
              } finally {
                setState(() => _isProcessing = false);
                Navigator.pop(context);
              }
            },
          ),
          Positioned(
            top: 40,
            right: 20,
            child: IconButton(
              icon: ValueListenableBuilder(
                valueListenable: controller.torchState,
                builder: (context, state, child) {
                  switch (state as TorchState) {
                    case TorchState.off: return Icon(Icons.flash_off, color: Colors.white);
                    case TorchState.on: return Icon(Icons.flash_on, color: Colors.yellow);
                  }
                },
              ),
              onPressed: () => controller.toggleTorch(),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                'Scanning QR Code...',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  shadows: [
                    Shadow(
                      offset: Offset(1, 1),
                      blurRadius: 2,
                      color: Colors.black,
                    )
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}