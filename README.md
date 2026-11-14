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
- Schriftarten werden lokal ausgeliefert; der Finder ist isoliert und verarbeitet Antworten ausschließlich im Browser.
  Details und Prüfgrenzen: siehe `FINDER-DATENSCHUTZ.md`.
- Löschung und späterer Versand werden derzeit manuell im Backend verwaltet.

## Prüfung

`npm test` prüft die API mit simuliertem Supabase: Validierung, Geheimnisschutz,
Datenminimierung, wiederholte Anmeldung und Ausfallverhalten.
Ein echter Supabase-/Vercel-Test benötigt die eingerichteten Konten und Variablen.

Dokumentation:
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/row-level-security
- https://vercel.com/docs/environment-variables


## Kontaktformular

`public/kontakt.html` sendet E-Mail und Nachricht sowie optional Name und Betreff an
`api/contact.js`. Die Anfragen werden getrennt in `public.contact_messages` gespeichert.
Die Tabellenvorlage steht in `supabase/contact.sql` und wurde im vorhandenen Projekt ausgeführt.
RLS ist aktiv; öffentliche Rollen haben keinen Tabellenzugriff. Es gibt keine Übernahme aus dem Finder.

Eingabelängen und Ursprünge werden serverseitig geprüft. Honeypot gegen einfache Bots;
zusätzliches dauerhaftes Rate-Limiting kann über die Vercel-Firewall eingerichtet werden.
Wiederholungen derselben Anfrage verwenden eine UUID und erzeugen keinen zweiten Datensatz.
Keine Inhalte in Anwendungslogs oder Fehlermeldungen. Keine automatische E-Mail-Benachrichtigung:
Anfragen derzeit im Supabase Table Editor lesen und per E-Mail beantworten.
Löschung entsprechend den veröffentlichten Zweck- und Aufbewahrungsregeln manuell verwalten.
