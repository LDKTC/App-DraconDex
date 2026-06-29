import 'package:flutter/material.dart';
import '../../../data/models/timeline_model.dart';
import '../../../widgets/color_dot.dart';

class TimelineGraphPainter extends CustomPainter {
  final List<TimelineEventModel> events;
  final ThemeData theme;

  TimelineGraphPainter({required this.events, required this.theme});

  @override
  void paint(Canvas canvas, Size size) {
    if (events.isEmpty) return;

    final sorted = events.where((e) => e.startDate != null).toList()
      ..sort((a, b) => a.startDate!.toSortable().compareTo(b.startDate!.toSortable()));

    if (sorted.isEmpty) return;

    final minTs = sorted.first.startDate!.toSortable();
    final maxTs = sorted.last.startDate!.toSortable();
    final range = maxTs - minTs;

    final axisY = size.height / 2;
    final axisPaint = Paint()
      ..color = theme.colorScheme.outline
      ..strokeWidth = 2;
    canvas.drawLine(Offset(16, axisY), Offset(size.width - 16, axisY), axisPaint);

    for (int i = 0; i < sorted.length; i++) {
      final ev = sorted[i];
      if (ev.startDate == null) continue;
      final ts = ev.startDate!.toSortable();
      final x = range == 0 ? size.width / 2 : 16 + (ts - minTs) / range * (size.width - 32);

      final dotColor = ev.colorCode != null
          ? hexToColor(ev.colorCode!)
          : theme.colorScheme.primary;
      final dotPaint = Paint()..color = dotColor;

      canvas.drawCircle(Offset(x, axisY), 6, dotPaint);

      final linePaint = Paint()..color = theme.colorScheme.outline..strokeWidth = 1;
      final labelY = i.isEven ? axisY - 40 : axisY + 20;
      canvas.drawLine(Offset(x, axisY), Offset(x, labelY), linePaint);

      final tp = TextPainter(
        text: TextSpan(
          text: ev.name ?? 'Event',
          style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 10),
        ),
        textDirection: TextDirection.ltr,
      );
      tp.layout(maxWidth: 80);
      tp.paint(canvas, Offset(x - tp.width / 2, i.isEven ? labelY - tp.height - 2 : labelY + 2));
    }
  }

  @override
  bool shouldRepaint(covariant TimelineGraphPainter old) => old.events != events;
}
