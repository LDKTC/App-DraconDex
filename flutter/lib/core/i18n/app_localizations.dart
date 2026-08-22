import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_de.dart';
import 'app_localizations_en.dart';
import 'app_localizations_es.dart';
import 'app_localizations_fr.dart';
import 'app_localizations_id.dart';
import 'app_localizations_ja.dart';
import 'app_localizations_ko.dart';
import 'app_localizations_pt.dart';
import 'app_localizations_qd.dart';
import 'app_localizations_ru.dart';
import 'app_localizations_th.dart';
import 'app_localizations_vi.dart';
import 'app_localizations_zh.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'i18n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('de'),
    Locale('en'),
    Locale('es'),
    Locale('fr'),
    Locale('id'),
    Locale('ja'),
    Locale('ko'),
    Locale('pt'),
    Locale('qd'),
    Locale('ru'),
    Locale('th'),
    Locale('vi'),
    Locale('zh'),
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'DraconDex'**
  String get appName;

  /// No description provided for @nexusTitle.
  ///
  /// In en, this message translates to:
  /// **'DraconDex'**
  String get nexusTitle;

  /// No description provided for @nexusSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Novel Data Management'**
  String get nexusSubtitle;

  /// No description provided for @moduleGlobalTags.
  ///
  /// In en, this message translates to:
  /// **'Tags'**
  String get moduleGlobalTags;

  /// No description provided for @moduleColors.
  ///
  /// In en, this message translates to:
  /// **'Colors'**
  String get moduleColors;

  /// No description provided for @moduleSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get moduleSettings;

  /// No description provided for @btnNew.
  ///
  /// In en, this message translates to:
  /// **'New'**
  String get btnNew;

  /// No description provided for @btnSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get btnSave;

  /// No description provided for @btnCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get btnCancel;

  /// No description provided for @btnDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get btnDelete;

  /// No description provided for @btnEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get btnEdit;

  /// No description provided for @btnClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get btnClose;

  /// No description provided for @btnAdd.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get btnAdd;

  /// No description provided for @btnImport.
  ///
  /// In en, this message translates to:
  /// **'Import DB'**
  String get btnImport;

  /// No description provided for @btnExport.
  ///
  /// In en, this message translates to:
  /// **'Export DB'**
  String get btnExport;

  /// No description provided for @labelName.
  ///
  /// In en, this message translates to:
  /// **'Name'**
  String get labelName;

  /// No description provided for @labelMemo.
  ///
  /// In en, this message translates to:
  /// **'Memo'**
  String get labelMemo;

  /// No description provided for @labelColor.
  ///
  /// In en, this message translates to:
  /// **'Color'**
  String get labelColor;

  /// No description provided for @labelNote.
  ///
  /// In en, this message translates to:
  /// **'Note'**
  String get labelNote;

  /// No description provided for @labelTags.
  ///
  /// In en, this message translates to:
  /// **'Tags'**
  String get labelTags;

  /// No description provided for @labelSearch.
  ///
  /// In en, this message translates to:
  /// **'Search...'**
  String get labelSearch;

  /// No description provided for @newHashtag.
  ///
  /// In en, this message translates to:
  /// **'New Tag'**
  String get newHashtag;

  /// No description provided for @noTags.
  ///
  /// In en, this message translates to:
  /// **'No tags yet.'**
  String get noTags;

  /// No description provided for @noColors.
  ///
  /// In en, this message translates to:
  /// **'No colors in the palette.'**
  String get noColors;

  /// No description provided for @noResults.
  ///
  /// In en, this message translates to:
  /// **'No results found.'**
  String get noResults;

  /// No description provided for @confirmDeleteTitle.
  ///
  /// In en, this message translates to:
  /// **'Confirm Delete'**
  String get confirmDeleteTitle;

  /// No description provided for @confirmDeleteMessage.
  ///
  /// In en, this message translates to:
  /// **'This action cannot be undone.'**
  String get confirmDeleteMessage;

  /// No description provided for @colorInUse.
  ///
  /// In en, this message translates to:
  /// **'Color is in use and cannot be deleted.'**
  String get colorInUse;

  /// No description provided for @themeLabel.
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get themeLabel;

  /// No description provided for @themeMidnight.
  ///
  /// In en, this message translates to:
  /// **'Midnight'**
  String get themeMidnight;

  /// No description provided for @themeMoonlight.
  ///
  /// In en, this message translates to:
  /// **'Moonlight'**
  String get themeMoonlight;

  /// No description provided for @themeDaylight.
  ///
  /// In en, this message translates to:
  /// **'Daylight'**
  String get themeDaylight;

  /// No description provided for @languageLabel.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get languageLabel;

  /// No description provided for @uiScaleLabel.
  ///
  /// In en, this message translates to:
  /// **'UI Scale'**
  String get uiScaleLabel;

  /// No description provided for @importSuccess.
  ///
  /// In en, this message translates to:
  /// **'Database imported successfully.'**
  String get importSuccess;

  /// No description provided for @importFailed.
  ///
  /// In en, this message translates to:
  /// **'Import failed. Please check the file.'**
  String get importFailed;

  /// No description provided for @exportSuccess.
  ///
  /// In en, this message translates to:
  /// **'Database exported.'**
  String get exportSuccess;

  /// No description provided for @selectColor.
  ///
  /// In en, this message translates to:
  /// **'Select Color'**
  String get selectColor;

  /// No description provided for @recentColors.
  ///
  /// In en, this message translates to:
  /// **'Recent'**
  String get recentColors;

  /// No description provided for @version.
  ///
  /// In en, this message translates to:
  /// **'Version 2.1.0'**
  String get version;

  /// No description provided for @btnRename.
  ///
  /// In en, this message translates to:
  /// **'Rename'**
  String get btnRename;

  /// No description provided for @btnPin.
  ///
  /// In en, this message translates to:
  /// **'Pin'**
  String get btnPin;

  /// No description provided for @btnUnpin.
  ///
  /// In en, this message translates to:
  /// **'Unpin'**
  String get btnUnpin;

  /// No description provided for @newNexusTitle.
  ///
  /// In en, this message translates to:
  /// **'New Nexus'**
  String get newNexusTitle;

  /// No description provided for @renameNexusTitle.
  ///
  /// In en, this message translates to:
  /// **'Rename Nexus'**
  String get renameNexusTitle;

  /// No description provided for @newModuleTitle.
  ///
  /// In en, this message translates to:
  /// **'New Module'**
  String get newModuleTitle;

  /// No description provided for @renameModuleTitle.
  ///
  /// In en, this message translates to:
  /// **'Rename Module'**
  String get renameModuleTitle;

  /// No description provided for @newModuleTooltip.
  ///
  /// In en, this message translates to:
  /// **'New Module'**
  String get newModuleTooltip;

  /// No description provided for @newNexusTooltip.
  ///
  /// In en, this message translates to:
  /// **'New Nexus'**
  String get newNexusTooltip;

  /// No description provided for @emptyNexusMessage.
  ///
  /// In en, this message translates to:
  /// **'No Nexus yet. Tap + to create one.'**
  String get emptyNexusMessage;

  /// No description provided for @emptyModuleMessage.
  ///
  /// In en, this message translates to:
  /// **'Empty. Tap + to add a module.'**
  String get emptyModuleMessage;

  /// No description provided for @deleteNexusMessage.
  ///
  /// In en, this message translates to:
  /// **'This deletes every module inside it. This action cannot be undone.'**
  String get deleteNexusMessage;

  /// No description provided for @deleteModuleMessage.
  ///
  /// In en, this message translates to:
  /// **'This deletes every module nested inside it too. This action cannot be undone.'**
  String get deleteModuleMessage;

  /// No description provided for @labelKind.
  ///
  /// In en, this message translates to:
  /// **'Kind'**
  String get labelKind;

  /// No description provided for @kindContentUnavailable.
  ///
  /// In en, this message translates to:
  /// **'This module kind isn't fully supported on mobile yet — using the shared notes field below.'**
  String get kindContentUnavailable;

  /// No description provided for @notesHint.
  ///
  /// In en, this message translates to:
  /// **'Notes for this module…'**
  String get notesHint;

  /// No description provided for @settingsAppearance.
  ///
  /// In en, this message translates to:
  /// **'Appearance'**
  String get settingsAppearance;

  /// No description provided for @settingsData.
  ///
  /// In en, this message translates to:
  /// **'Data'**
  String get settingsData;

  /// No description provided for @settingsAbout.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get settingsAbout;

  /// No description provided for @exportDbTitle.
  ///
  /// In en, this message translates to:
  /// **'Export Database'**
  String get exportDbTitle;

  /// No description provided for @exportDbSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Share the .db file to transfer data to PC or another device'**
  String get exportDbSubtitle;

  /// No description provided for @importDbTitle.
  ///
  /// In en, this message translates to:
  /// **'Import Database'**
  String get importDbTitle;

  /// No description provided for @importDbSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Merge data from a DraconDex .db file'**
  String get importDbSubtitle;

  /// No description provided for @checkUpdatesTitle.
  ///
  /// In en, this message translates to:
  /// **'Check for Updates'**
  String get checkUpdatesTitle;

  /// No description provided for @checkUpdatesSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Looks at this project's GitHub Releases — never installs automatically'**
  String get checkUpdatesSubtitle;

  /// No description provided for @upToDateMessage.
  ///
  /// In en, this message translates to:
  /// **'You're on the latest version.'**
  String get upToDateMessage;

  /// No description provided for @importingMessage.
  ///
  /// In en, this message translates to:
  /// **'Importing…'**
  String get importingMessage;

  /// No description provided for @importCompleteMessage.
  ///
  /// In en, this message translates to:
  /// **'Import complete.'**
  String get importCompleteMessage;

  /// No description provided for @importFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Import failed.'**
  String get importFailedMessage;

  /// No description provided for @exportFailedMessage.
  ///
  /// In en, this message translates to:
  /// **'Export failed.'**
  String get exportFailedMessage;

  /// No description provided for @addColorTitle.
  ///
  /// In en, this message translates to:
  /// **'Add Color'**
  String get addColorTitle;

  /// No description provided for @colorPaletteTitle.
  ///
  /// In en, this message translates to:
  /// **'Color Palette'**
  String get colorPaletteTitle;

  /// No description provided for @hashtagsTitle.
  ///
  /// In en, this message translates to:
  /// **'Hashtags'**
  String get hashtagsTitle;

  /// No description provided for @editHashtagTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit Hashtag'**
  String get editHashtagTitle;

  /// No description provided for @tagNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Tag Name'**
  String get tagNameLabel;

  /// No description provided for @removeColorConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Remove color?'**
  String get removeColorConfirmTitle;

  /// No description provided for @deleteHashtagConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete hashtag?'**
  String get deleteHashtagConfirmTitle;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) => <String>[
    'de',
    'en',
    'es',
    'fr',
    'id',
    'ja',
    'ko',
    'pt',
    'qd',
    'ru',
    'th',
    'vi',
    'zh',
  ].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'de':
      return AppLocalizationsDe();
    case 'en':
      return AppLocalizationsEn();
    case 'es':
      return AppLocalizationsEs();
    case 'fr':
      return AppLocalizationsFr();
    case 'id':
      return AppLocalizationsId();
    case 'ja':
      return AppLocalizationsJa();
    case 'ko':
      return AppLocalizationsKo();
    case 'pt':
      return AppLocalizationsPt();
    case 'qd':
      return AppLocalizationsQd();
    case 'ru':
      return AppLocalizationsRu();
    case 'th':
      return AppLocalizationsTh();
    case 'vi':
      return AppLocalizationsVi();
    case 'zh':
      return AppLocalizationsZh();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
