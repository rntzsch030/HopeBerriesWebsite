# Finder: technische Datenschutzprüfung

Stand: 14. November 2026. Technische Umsetzung, keine Bescheinigung rechtlicher Konformität.

## Änderungen und Datenfluss

- `public/finder.html` enthält die bisherigen drei Fragen mit sämtlichen Optionen und
  unveränderter Empfehlungslogik (sechs Beschwerden, zwei Zielgruppen, drei Therapiephasen).
- Die Vorlage hatte noch keinen Produktkatalog, keine Produktdetaillinks und keinen Checkout.
  Sie gibt Produkthinweise aus. Es wurden keine neuen medizinischen Aussagen oder Empfehlungen ergänzt.
- Ein vorgeschalteter Hinweis erklärt die lokale Verarbeitung. Keine Registrierung/Einwilligungsmaske.
- Antworten liegen ausschließlich im privaten JavaScript-Zustand `st` und im Ergebnis-DOM
  innerhalb des isolierten Frames. Kein Local Storage, Session Storage, IndexedDB oder Cookie.
- „Antworten zurücksetzen“ und „Neu starten“ entfernen Antworten und Ergebnis aus dem aktiven
  Zustand und DOM. Dasselbe geschieht bei `visibilitychange` zu hidden und bei `pagehide`.
  JavaScript kann keine forensische Überschreibung des Browser-/Betriebssystemspeichers garantieren.
- Vormerken löscht zuerst den Finder-Zustand. Nur die konstante Nachricht
  `hopeberries:open-signup` geht an die Hauptseite; keine Auswahl, Ergebnisse oder Zielgruppe.
  Sie löst lediglich Scrollen und Fokus auf das separate E-Mail-Formular aus.
- Das bisherige versteckte Finder-Feld, die Auswahlchips im Formular und die automatische
  Übernahme der Zielgruppe sind entfernt. Die manuelle Zielgruppenauswahl im E-Mail-Formular
  bleibt wie bisher rein visuell und wird nicht übertragen.
- `/api/subscribe` akzeptiert nur email, consent und Honeypot. Zusätzliche Felder werden vor
  jedem Supabase-Aufruf abgewiesen. Supabase erhält nur E-Mail und Einwilligungsversion;
  den Zeitpunkt erzeugt die Datenbank. Keine Profil-/Bestell-/Konto-Verknüpfung vorhanden.

## Technische Schutzgrenzen

- Frame-Sandbox `allow-scripts` ohne `allow-same-origin`: Hauptseitenskripte können das
  Antwort-DOM nicht auslesen; Browser-Speicher/Cookies sind im Frame nicht zugänglich.
- Finder-CSP in Dokument UND HTTP-Header: `default-src 'none'`, `connect-src 'none'`,
  keine externen Bilder/Fonts/Medien, keine Unterframes/Worker, keine Formübermittlung.
  Nur der konkrete überprüfte Inline-Script-Hash ist erlaubt. Kein CSP-Reporting-Endpunkt.
- Serverseitige Sandbox schützt auch beim direkten Aufruf von `/finder.html`.
- Die Hauptseite akzeptiert nur die konstante Nachricht vom erwarteten Frame mit opaque Origin.
- Hauptseiten-CSP sperrt externe Skripte, externe API-Aufrufe und Worker. Keine Analytics-,
  Pixel-, Session-Replay- oder Fehlerreporting-Bibliothek im geprüften Quellstand vorhanden.
- Alle bisherigen Google-Fonts sind lokal gespeichert (OFL-Lizenzen in `public/fonts`).
  Im Finder direkt eingebettet: kein nutzungsabhängiger Font-Request.
- Globale Referrer-Policy `no-referrer`; Antworten und Empfehlungen landen nicht in URL,
  Hash, Query, Events, Serverlogs oder Fehlermeldungen des Anwendungscodes.
- Der Finder erzeugt keine Links oder dynamischen Ressourcenpfade anhand der Antworten.
  Externe Quellenlinks der Hauptseite enthalten keine Finder-Daten.
- Bei späteren Codeänderungen Script-Hashes in `vercel.json` und Finder-Meta-CSP aktualisieren.
  Nicht durch `unsafe-inline` für Scripts oder `allow-same-origin` ersetzen.

## Prüfung und Befunde

- `npm test`: Isolation/CSP/Hash-Prüfung, alle 378 nichtleeren Antwortkombinationen gegen die
  bisherige Empfehlungslogik, Reset, konstante Anmeldung-Nachricht, API-Abweisung zusätzlicher
  Felder und Ausfallverhalten. Alle Prüfungen erfolgreich.
- Browserprüfung mit Vercel-gleichen Headern auf localhost: Hinweis, Start, Mehrfachauswahl,
  Weiter/Zurück mit Erhalt der Auswahl, alle drei Fragen, Ergebnis, Vormerken mit gelöschtem
  Zustand, neuer Durchlauf ohne vorausgewählte Antworten, explizites Zurücksetzen.
- Mobile Ansicht bei 390 x 844 geprüft. Browser meldete keine Script-/CSP-Fehler im Test.
- Tatsächliche eingehende HTTP-Anfragen am lokalen Server und Browser-Ressourceninventar
  während dieses Ablaufs geprüft: nur generische Seite, finder.html, lokale Fonts/CSS und
  feste Medienpfade. Keine antwortabhängigen HTTP-Anfragen oder Anfrageparameter beobachtet.
  Der Ressourcenkatalog ist kein vollständiger HAR-Mitschnitt aller Browserkommunikation.
  Eine vollständige unabhängige Netzwerkanalyse und Prüfung der produktiven Hosting-Einstellungen
  (einschließlich eventuell außerhalb des Repositorys injizierter Integrationen) bleibt erforderlich.
- Live-Veröffentlichung auf www.hopeberries.de bestätigt: neuer Hinweis und Reset im Browser
  getestet; Ressourceninventar enthält nur eigene Website-Adressen. Der ausgelieferte HTTP-Header
  für finder.html enthält die erwartete CSP mit Netzwerksperre, Script-Hash und Sandbox sowie
  no-referrer und no-store. Kein vollständiger produktiver HAR-Mitschnitt verfügbar.
- Die beiden ursprünglich fehlenden MP4-Dateien wurden nachgeliefert und unter den vorhandenen
  lokalen Medienpfaden ergänzt (H.264/AAC, Metadaten am Dateianfang). Keine externen Videodienste.

## Personenbezug und juristisch offene Punkte

- Beim Abruf der Website sieht Vercel weiterhin IP-Adresse und technische Verbindungsdaten,
  gegebenenfalls vorhandene Cookies/Anfragekennungen. Die Website ist nicht insgesamt anonym.
  Auch der Kontext des Besuchs und die separate E-Mail-Vormerkung können sensibel sein.
- Rechtsgrundlage für die konkrete Ausgestaltung einschließlich lokaler Gesundheitsverarbeitung
  nach Art. 6 und gegebenenfalls Art. 9 DSGVO, Informationspflichten, Verantwortlichkeiten,
  Auftragsverarbeitungsverträge, Drittlandtransfers, Log-Fristen und mögliche DSFA prüfen lassen.
- Auch die Aussagen „ohne bekannte Wechselwirkungen“ und sonstige medizinische Produkttexte
  benötigen vor einem tatsächlichen Produktangebot fachliche und rechtliche Freigabe.
- Für jede spätere Konto-/Bestellverknüpfung, Produktempfehlungs-URL, Affiliate-Integration,
  Analyse oder serverseitige Speicherung erneut prüfen; insbesondere geeignete Rechtsgrundlage
  nach Art. 6 und Ausnahme nach Art. 9 Abs. 2 DSGVO. Solche Funktionen sind derzeit nicht implementiert.
- Browser-Erweiterungen, kompromittierte Endgeräte oder vom Nutzer angefertigte Screenshots
  liegen außerhalb der technischen Schutzgrenze dieser Website.

Quellen:
- DSGVO: https://eur-lex.europa.eu/eli/reg/2016/679
- Sandbox: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/sandbox
- iframe: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
