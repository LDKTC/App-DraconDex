class TimelineModel {
  final int id;
  final String? name;
  final int projectId;
  final int? colorId;
  final String? colorCode;
  final String updatedAt;

  const TimelineModel({
    required this.id,
    this.name,
    required this.projectId,
    this.colorId,
    this.colorCode,
    required this.updatedAt,
  });

  factory TimelineModel.fromMap(Map<String, dynamic> m) => TimelineModel(
        id: m['id'] as int,
        name: m['line_name'] as String?,
        projectId: m['project_id'] as int,
        colorId: m['color'] as int?,
        colorCode: m['color_code'] as String?,
        updatedAt: m['update_at'] as String? ?? '',
      );
}

class TimelineDateModel {
  final int id;
  final int day;
  final int month;
  final int years;
  final int hour;
  final int minute;

  const TimelineDateModel({
    required this.id,
    required this.day,
    required this.month,
    required this.years,
    required this.hour,
    required this.minute,
  });

  factory TimelineDateModel.fromMap(Map<String, dynamic> m) => TimelineDateModel(
        id: m['id'] as int,
        day: m['day'] as int,
        month: m['month'] as int,
        years: m['years'] as int,
        hour: m['hour'] as int? ?? 0,
        minute: m['minute'] as int? ?? 0,
      );

  String get display {
    final h = hour.toString().padLeft(2, '0');
    final mi = minute.toString().padLeft(2, '0');
    return 'Y$years M$month D$day $h:$mi';
  }

  double toSortable() => years * 1e8 + month * 1e6 + day * 1e4 + hour * 100 + minute.toDouble();
}

class TimelineEventModel {
  final int id;
  final int timelineId;
  final String? name;
  final int startAtId;
  final int? endAtId;
  final int? colorId;
  final String? colorCode;
  final String? story;
  final String updatedAt;
  final TimelineDateModel? startDate;
  final TimelineDateModel? endDate;

  const TimelineEventModel({
    required this.id,
    required this.timelineId,
    this.name,
    required this.startAtId,
    this.endAtId,
    this.colorId,
    this.colorCode,
    this.story,
    required this.updatedAt,
    this.startDate,
    this.endDate,
  });

  factory TimelineEventModel.fromMap(Map<String, dynamic> m) {
    TimelineDateModel? startDate;
    if (m['s_years'] != null) {
      startDate = TimelineDateModel(
        id: m['start_at'] as int,
        day: m['s_day'] as int,
        month: m['s_month'] as int,
        years: m['s_years'] as int,
        hour: m['s_hour'] as int? ?? 0,
        minute: m['s_minute'] as int? ?? 0,
      );
    }
    TimelineDateModel? endDate;
    if (m['e_years'] != null) {
      endDate = TimelineDateModel(
        id: m['end_at'] as int,
        day: m['e_day'] as int,
        month: m['e_month'] as int,
        years: m['e_years'] as int,
        hour: m['e_hour'] as int? ?? 0,
        minute: m['e_minute'] as int? ?? 0,
      );
    }
    return TimelineEventModel(
      id: m['id'] as int,
      timelineId: m['timeline_id'] as int,
      name: m['event_name'] as String?,
      startAtId: m['start_at'] as int,
      endAtId: m['end_at'] as int?,
      colorId: m['color'] as int?,
      colorCode: m['color_code'] as String?,
      story: m['story'] as String?,
      updatedAt: m['update_at'] as String? ?? '',
      startDate: startDate,
      endDate: endDate,
    );
  }
}
