# HopeBerries

Statische Website in `public/`, Vercel-Serverfunktion in `api/subscribe.js`.
Die ursprüngliche Gestaltung und die Medien der gelieferten HTML-Datei wurden übernommen.

## Supabase einrichten

1. Supabase-Projekt erstellen (gewünschte EU-Region wählen).
2. `supabase/schema.sql` im SQL Editor ausführen. Data API für Schema `public` muss verfügbar sein.
3. Projekt-URL und einen **Secret API Key** aus den Projekteinstellungen bereitstellen.
   Der Schlüssel gehört ausschließlich in die Server-Umgebungsvariablen, nie in HTML oder Git.

## Vercel einrichten

1. Projekt in ein GitHub-Repository übernehmen und dieses in Vercel importieren.
2. Framework: Other; Output Directory: `public`; kein Build erforderlich.
3. `SUPABASE_URL` und `SUPABASE_SECRET_KEY` unter Environment Variables setzen.
   Vorschau-Deployments nur mit einer separaten Testdatenbank verbinden.
4. Deployen bzw. nach Änderungen der Variablen erneut deployen.
5. Vormerkung mit eigener Testadresse absenden und Eintrag in `launch_signups` prüfen.
   Wiederholungen erzeugen keinen zweiten Datensatz. Fehler dürfen keine Erfolgsmeldung anzeigen.

## Funktionsumfang und offene Punkte

- Gespeichert werden E-Mail, serverseitiger Zeitpunkt und Einwilligungsversion.
- Finder-Auswahl und Zielgruppe werden nicht übertragen.
- RLS ist aktiv; öffentliche Datenbankzugriffe sind gesperrt.
- Die API validiert die Eingaben, prüft Browser-Ursprünge und enthält ein Honeypot-Feld.
  Vor öffentlichem Betrieb zusätzlich persistentes Rate-Limiting/Bot-Schutz in Vercel konfigurieren;
  das Honeypot-Feld allein verhindert keine automatisierten Anmeldungen.
- Noch kein E-Mail-Versand und keine Bestätigung der E-Mail-Inhaberschaft (Double-Opt-in).
  Vor dem tatsächlichen Versand einen E-Mail-Dienst und Bestätigungsablauf ergänzen.
- Impressum und Datenschutz sind ausdrücklich Entwürfe: alle Platzhalter, Betreiberform,
  Kontaktadresse, Hosting-Verträge, Medienquellen und Löschfristen prüfen und vervollständigen.
- Google Fonts werden wie in der Vorlage extern geladen. Vor Veröffentlichung lokal hosten
  oder die Einbindung passend zur finalen Datenschutz-/Einwilligungslösung umsetzen.
- Löschung und späterer Versand werden derzeit manuell im Backend verwaltet.

## Prüfung

`npm test` prüft die API mit simuliertem Supabase: Validierung, Geheimnisschutz,
Datenminimierung, wiederholte Anmeldung und Ausfallverhalten.
Ein echter Supabase-/Vercel-Test benötigt die eingerichteten Konten und Variablen.

Dokumentation:
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/row-level-security
- https://vercel.com/docs/environment-variables
