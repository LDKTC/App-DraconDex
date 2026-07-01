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

  /// No description provided for @moduleDirector.
  ///
  /// In en, this message translates to:
  /// **'Director'**
  String get moduleDirector;

  /// No description provided for @moduleProjects.
  ///
  /// In en, this message translates to:
  /// **'Projects'**
  String get moduleProjects;

  /// No description provided for @moduleTimeline.
  ///
  /// In en, this message translates to:
  /// **'Timeline'**
  String get moduleTimeline;

  /// No description provided for @moduleRelations.
  ///
  /// In en, this message translates to:
  /// **'Relations'**
  String get moduleRelations;

  /// No description provided for @moduleMap.
  ///
  /// In en, this message translates to:
  /// **'Map'**
  String get moduleMap;

  /// No description provided for @moduleTags.
  ///
  /// In en, this message translates to:
  /// **'Project Tags'**
  String get moduleTags;

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

  /// No description provided for @labelCodename.
  ///
  /// In en, this message translates to:
  /// **'Codename'**
  String get labelCodename;

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

  /// No description provided for @labelFolder.
  ///
  /// In en, this message translates to:
  /// **'Folder'**
  String get labelFolder;

  /// No description provided for @labelCategory.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get labelCategory;

  /// No description provided for @labelType.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get labelType;

  /// No description provided for @labelField.
  ///
  /// In en, this message translates to:
  /// **'Field'**
  String get labelField;

  /// No description provided for @labelStory.
  ///
  /// In en, this message translates to:
  /// **'Story'**
  String get labelStory;

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

  /// No description provided for @newFolder.
  ///
  /// In en, this message translates to:
  /// **'New Folder'**
  String get newFolder;

  /// No description provided for @newProject.
  ///
  /// In en, this message translates to:
  /// **'New Project'**
  String get newProject;

  /// No description provided for @newCategory.
  ///
  /// In en, this message translates to:
  /// **'New Category'**
  String get newCategory;

  /// No description provided for @newObject.
  ///
  /// In en, this message translates to:
  /// **'New Object'**
  String get newObject;

  /// No description provided for @newTimeline.
  ///
  /// In en, this message translates to:
  /// **'New Timeline'**
  String get newTimeline;

  /// No description provided for @newEvent.
  ///
  /// In en, this message translates to:
  /// **'New Event'**
  String get newEvent;

  /// No description provided for @newMap.
  ///
  /// In en, this message translates to:
  /// **'New Map'**
  String get newMap;

  /// No description provided for @newArea.
  ///
  /// In en, this message translates to:
  /// **'New Area'**
  String get newArea;

  /// No description provided for @newRelation.
  ///
  /// In en, this message translates to:
  /// **'New Relation'**
  String get newRelation;

  /// No description provided for @newRelationType.
  ///
  /// In en, this message translates to:
  /// **'New Relation Type'**
  String get newRelationType;

  /// No description provided for @newHashtag.
  ///
  /// In en, this message translates to:
  /// **'New Tag'**
  String get newHashtag;

  /// No description provided for @noProjects.
  ///
  /// In en, this message translates to:
  /// **'No projects yet. Create one to get started.'**
  String get noProjects;

  /// No description provided for @noObjects.
  ///
  /// In en, this message translates to:
  /// **'No objects in this category.'**
  String get noObjects;

  /// No description provided for @noTimelines.
  ///
  /// In en, this message translates to:
  /// **'No timelines yet.'**
  String get noTimelines;

  /// No description provided for @noEvents.
  ///
  /// In en, this message translates to:
  /// **'No events on this timeline.'**
  String get noEvents;

  /// No description provided for @noMaps.
  ///
  /// In en, this message translates to:
  /// **'No maps yet.'**
  String get noMaps;

  /// No description provided for @noAreas.
  ///
  /// In en, this message translates to:
  /// **'No areas on this map.'**
  String get noAreas;

  /// No description provided for @noRelations.
  ///
  /// In en, this message translates to:
  /// **'No relations yet.'**
  String get noRelations;

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

  /// No description provided for @searchHint.
  ///
  /// In en, this message translates to:
  /// **'Search projects, objects, tags...'**
  String get searchHint;

  /// No description provided for @searchProjects.
  ///
  /// In en, this message translates to:
  /// **'Projects'**
  String get searchProjects;

  /// No description provided for @searchObjects.
  ///
  /// In en, this message translates to:
  /// **'Objects'**
  String get searchObjects;

  /// No description provided for @searchTags.
  ///
  /// In en, this message translates to:
  /// **'Tags'**
  String get searchTags;

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

  /// No description provided for @relOBOB.
  ///
  /// In en, this message translates to:
  /// **'Object ↔ Object'**
  String get relOBOB;

  /// No description provided for @relOBTL.
  ///
  /// In en, this message translates to:
  /// **'Object ↔ Event'**
  String get relOBTL;

  /// No description provided for @relTLTL.
  ///
  /// In en, this message translates to:
  /// **'Event ↔ Event'**
  String get relTLTL;

  /// No description provided for @startDate.
  ///
  /// In en, this message translates to:
  /// **'Start Date'**
  String get startDate;

  /// No description provided for @endDate.
  ///
  /// In en, this message translates to:
  /// **'End Date'**
  String get endDate;

  /// No description provided for @year.
  ///
  /// In en, this message translates to:
  /// **'Year'**
  String get year;

  /// No description provided for @month.
  ///
  /// In en, this message translates to:
  /// **'Month'**
  String get month;

  /// No description provided for @day.
  ///
  /// In en, this message translates to:
  /// **'Day'**
  String get day;

  /// No description provided for @hour.
  ///
  /// In en, this message translates to:
  /// **'Hour'**
  String get hour;

  /// No description provided for @minute.
  ///
  /// In en, this message translates to:
  /// **'Minute'**
  String get minute;

  /// No description provided for @unfiledProjects.
  ///
  /// In en, this message translates to:
  /// **'Unfiled'**
  String get unfiledProjects;

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

  /// No description provided for @listView.
  ///
  /// In en, this message translates to:
  /// **'List View'**
  String get listView;

  /// No description provided for @tableView.
  ///
  /// In en, this message translates to:
  /// **'Table View'**
  String get tableView;

  /// No description provided for @fields.
  ///
  /// In en, this message translates to:
  /// **'Fields'**
  String get fields;

  /// No description provided for @fromObj.
  ///
  /// In en, this message translates to:
  /// **'From'**
  String get fromObj;

  /// No description provided for @toObj.
  ///
  /// In en, this message translates to:
  /// **'To'**
  String get toObj;

  /// No description provided for @relationTypeName.
  ///
  /// In en, this message translates to:
  /// **'Relation Type'**
  String get relationTypeName;

  /// No description provided for @addField.
  ///
  /// In en, this message translates to:
  /// **'Add Field'**
  String get addField;

  /// No description provided for @objectNote.
  ///
  /// In en, this message translates to:
  /// **'Notes'**
  String get objectNote;

  /// No description provided for @eventStory.
  ///
  /// In en, this message translates to:
  /// **'Story'**
  String get eventStory;

  /// No description provided for @mapTool.
  ///
  /// In en, this message translates to:
  /// **'Tool'**
  String get mapTool;

  /// No description provided for @mapToolMove.
  ///
  /// In en, this message translates to:
  /// **'Move'**
  String get mapToolMove;

  /// No description provided for @mapToolCreate.
  ///
  /// In en, this message translates to:
  /// **'Add Point'**
  String get mapToolCreate;

  /// No description provided for @mapToolDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete Point'**
  String get mapToolDelete;

  /// No description provided for @version.
  ///
  /// In en, this message translates to:
  /// **'Version 2.1.0'**
  String get version;
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
