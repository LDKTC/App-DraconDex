import 'package:flutter/material.dart';
import '../../../data/models/map_model.dart';
import '../../../widgets/color_dot.dart';

class MapCanvasPainter extends CustomPainter {
  final List<MapAreaModel> areas;
  final Map<int, List<MapPointModel>> pointsByArea;
  final int? selectedAreaId;
  final ThemeData theme;

  const MapCanvasPainter({
    required this.areas,
    required this.pointsByArea,
    this.selectedAreaId,
    required this.theme,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final area in areas) {
      final points = pointsByArea[area.id] ?? [];
      if (points.isEmpty) continue;

      final color = area.colorCode != null
          ? hexToColor(area.colorCode!)
          : theme.colorScheme.primary;

      final fillPaint = Paint()
        ..color = color.withOpacity(area.id == selectedAreaId ? 0.4 : 0.2)
        ..style = PaintingStyle.fill;

      final strokePaint = Paint()
        ..color = area.id == selectedAreaId ? color : color.withOpacity(0.8)
        ..style = PaintingStyle.stroke
        ..strokeWidth = area.id == selectedAreaId ? 2.5 : 1.5;

      final path = Path();
      path.moveTo(points.first.x, points.first.y);
      for (int i = 1; i < points.length; i++) {
        path.lineTo(points[i].x, points[i].y);
      }
      path.close();

      canvas.drawPath(path, fillPaint);
      canvas.drawPath(path, strokePaint);

      // Draw area label at centroid
      if (area.name != null) {
        final cx = points.map((p) => p.x).reduce((a, b) => a + b) / points.length;
        final cy = points.map((p) => p.y).reduce((a, b) => a + b) / points.length;
        final tp = TextPainter(
          text: TextSpan(
            text: area.name,
            style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 11, fontWeight: FontWeight.w500),
          ),
          textDirection: TextDirection.ltr,
        );
        tp.layout();
        tp.paint(canvas, Offset(cx - tp.width / 2, cy - tp.height / 2));
      }

      // Draw vertex dots
      for (final pt in points) {
        canvas.drawCircle(
          Offset(pt.x, pt.y),
          4,
          Paint()..color = color,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant MapCanvasPainter old) =>
      old.areas != areas || old.pointsByArea != pointsByArea || old.selectedAreaId != selectedAreaId;
}
