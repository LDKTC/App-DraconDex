// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get appName => 'DraconDex';

  @override
  String get nexusTitle => 'DraconDex';

  @override
  String get nexusSubtitle => 'Управление Данными Романов';

  @override
  String get moduleGlobalTags => 'Теги';

  @override
  String get moduleColors => 'Цвета';

  @override
  String get moduleSettings => 'Настройки';

  @override
  String get btnNew => 'Новый';

  @override
  String get btnSave => 'Сохранить';

  @override
  String get btnCancel => 'Отмена';

  @override
  String get btnDelete => 'Удалить';

  @override
  String get btnEdit => 'Редактировать';

  @override
  String get btnClose => 'Закрыть';

  @override
  String get btnAdd => 'Добавить';

  @override
  String get btnImport => 'Импорт БД';

  @override
  String get btnExport => 'Экспорт БД';

  @override
  String get labelName => 'Имя';

  @override
  String get labelMemo => 'Заметка';

  @override
  String get labelColor => 'Цвет';

  @override
  String get labelNote => 'Примечание';

  @override
  String get labelTags => 'Теги';

  @override
  String get labelSearch => 'Поиск...';

  @override
  String get newHashtag => 'Новый Тег';

  @override
  String get noTags => 'Пока нет тегов.';

  @override
  String get noColors => 'Нет цветов в палитре.';

  @override
  String get noResults => 'Результаты не найдены.';

  @override
  String get confirmDeleteTitle => 'Подтвердите Удаление';

  @override
  String get confirmDeleteMessage => 'Это действие нельзя отменить.';

  @override
  String get colorInUse => 'Цвет используется и не может быть удалён.';

  @override
  String get themeLabel => 'Тема';

  @override
  String get themeMidnight => 'Полночь';

  @override
  String get themeMoonlight => 'Лунный Свет';

  @override
  String get themeDaylight => 'Дневной Свет';

  @override
  String get languageLabel => 'Язык';

  @override
  String get uiScaleLabel => 'Масштаб Интерфейса';

  @override
  String get importSuccess => 'База данных успешно импортирована.';

  @override
  String get importFailed => 'Ошибка импорта. Проверьте файл.';

  @override
  String get exportSuccess => 'База данных экспортирована.';

  @override
  String get selectColor => 'Выбрать Цвет';

  @override
  String get recentColors => 'Недавние';

  @override
  String get version => 'Версия 2.1.0';

  @override
  String get btnRename => 'Переименовать';

  @override
  String get btnPin => 'Закрепить';

  @override
  String get btnUnpin => 'Открепить';

  @override
  String get newNexusTitle => 'Новый Nexus';

  @override
  String get renameNexusTitle => 'Переименовать Nexus';

  @override
  String get newModuleTitle => 'Новый модуль';

  @override
  String get renameModuleTitle => 'Переименовать модуль';

  @override
  String get newModuleTooltip => 'Новый модуль';

  @override
  String get newNexusTooltip => 'Новый Nexus';

  @override
  String get emptyNexusMessage => 'Пока нет ни одного Nexus. Нажмите +, чтобы создать.';

  @override
  String get emptyModuleMessage => 'Пусто. Нажмите +, чтобы добавить модуль.';

  @override
  String get deleteNexusMessage => 'Это удалит все модули внутри него. Это действие нельзя отменить.';

  @override
  String get deleteModuleMessage => 'Это также удалит все вложенные модули внутри. Это действие нельзя отменить.';

  @override
  String get labelKind => 'Тип';

  @override
  String get kindContentUnavailable => 'Этот тип модуля пока не полностью поддерживается на мобильных устройствах — используется общее поле заметок ниже.';

  @override
  String get notesHint => 'Заметки для этого модуля…';

  @override
  String get settingsAppearance => 'Внешний вид';

  @override
  String get settingsData => 'Данные';

  @override
  String get settingsAbout => 'О программе';

  @override
  String get exportDbTitle => 'Экспорт базы данных';

  @override
  String get exportDbSubtitle => 'Поделитесь файлом .db, чтобы перенести данные на ПК или другое устройство';

  @override
  String get importDbTitle => 'Импорт базы данных';

  @override
  String get importDbSubtitle => 'Объединить данные из файла .db DraconDex';

  @override
  String get checkUpdatesTitle => 'Проверить обновления';

  @override
  String get checkUpdatesSubtitle => 'Проверяет GitHub Releases этого проекта — никогда не устанавливает автоматически';

  @override
  String get upToDateMessage => 'У вас установлена последняя версия.';

  @override
  String get importingMessage => 'Импорт…';

  @override
  String get importCompleteMessage => 'Импорт завершён.';

  @override
  String get importFailedMessage => 'Ошибка импорта.';

  @override
  String get exportFailedMessage => 'Ошибка экспорта.';

  @override
  String get addColorTitle => 'Добавить цвет';

  @override
  String get colorPaletteTitle => 'Палитра цветов';

  @override
  String get hashtagsTitle => 'Теги';

  @override
  String get editHashtagTitle => 'Изменить тег';

  @override
  String get tagNameLabel => 'Название тега';

  @override
  String get removeColorConfirmTitle => 'Удалить цвет?';

  @override
  String get deleteHashtagConfirmTitle => 'Удалить тег?';
}
