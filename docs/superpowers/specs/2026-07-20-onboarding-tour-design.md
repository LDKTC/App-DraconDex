# Nexus creation tour design

## Goal

Remove the unexplained experience-level confirmation from first-run Nexus creation while retaining the optional coach-mark tour.

## Chosen approach

The welcome dialog continues to offer Create, Import, and Later. Choosing Create opens the existing Nexus form directly. That form gains a theme-safe, localized checkbox labelled as an optional quick tour after creation; it is checked by default only when the form was entered from the first-run welcome flow. Normal “new Nexus” creation remains uncluttered.

## Behavior

`welcomeCreateNexus()` requests the creation form with the guide choice enabled. The form records the checkbox state and `createNexusSubmit()` launches the existing guide only when the submitted state is enabled. The nested `uiConfirm()` prompt is removed. Creating a Nexus still validates its name, closes the form, selects the new Nexus, and shows its success toast.

## Verification

Add a focused regression test that prohibits the nested confirmation and requires the optional guide control. Drive the Electron app through first-run creation with the control both enabled and disabled, inspect screenshots, and run the renderer style checker.
