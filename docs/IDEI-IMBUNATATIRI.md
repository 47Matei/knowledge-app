# OpenMind - analiză și idei de îmbunătățire

Scris de Claude pe 13 noiembrie 2026, pe ramura `buton-watches_complexity-repetitionno`, după citirea codului (`app.js`, `data/`), a documentului AGENTS.md și după folosirea aplicației.

## 1. Ce este aplicația azi

- **22 de domenii** și aproximativ **4.150 de carduri** după runda asta: mașini, ceasuri, comportament, capitale, localizare, județe, steaguri, avioane, elemente, astronomie, istorie, corp, erori de gândire, finanțe, monumente, arhitectură, vocabular, AI, securitate, tehnologie, programare, date și statistică.
- **Învățare cu repetiție spațiată (FSRS 4.5):** fiecare card revine exact când e pe cale să fie uitat.
- **Teste:** alegere multiplă, răspuns scris (tolerant la greșeli de tastare), cronometrat 60 s, „găsește intrusul", „recunoaște după imagine" (la mașini și ceasuri: „Ce model {marcă} este?").
- **Altele:** hărți interactive (țări, județe), modul Compară pentru perechi ușor de confundat, introducere și test de plasare pentru fiecare domeniu, sesiune rapidă de 5 minute, amestec de domenii, cardul zilei, XP, serii cu protecție, insigne, statistici.
- **Unde rulează:** ca artifact Claude (cu salvare în cont) și ca aplicație instalabilă (PWA) pe GitHub Pages, cu salvare doar pe telefon și export lunar.

## 2. Aplicații asemănătoare și ce putem învăța de la ele

| Aplicație | Ce face bine | Ce putem prelua |
|---|---|---|
| **Anki** | Repetiție spațiată foarte bună (are și FSRS), pachete făcute de comunitate, statistici detaliate | Avem deja FSRS. Putem prelua „cardurile cu goluri" (cloze) și statistica „câte carduri vei avea de repetat în zilele următoare". |
| **Duolingo** | Motivație: serie zilnică, ligi săptămânale, „vieți", traseu vizual de lecții, notificări prietenoase | Traseu vizual pe domeniu (lecția 1, 2, 3 ... cu lacăte), provocări săptămânale, „misiunea zilei". |
| **Quizlet** | Mod „Learn" care trece de la variante la răspuns scris pe măsură ce știi, jocul „Match" contra cronometru | Dificultate adaptivă în același test: întâi variante, apoi scris, pentru același card. Jocul Match pe orice domeniu (azi există doar în introducere). |
| **Brainscape** | Autoevaluare pe 5 niveluri, progres afișat pe fiecare capitol | Bara de „stăpânire" pe fiecare subsecțiune, direct pe pagina domeniului. |
| **Seterra / jocuri de geografie** | Hărți rapide, scor pe timp, clasament | Avem hărți. Putem adăuga un mod „contra cronometru" pe hartă și recorduri personale pe continent. |
| **Kahoot / jocuri de quiz** | Multiplayer în timp real, distracție în grup | Un mod „duel" pe același telefon (doi jucători, pe rând) - fără server. |

## 3. Ce merge bine

- **Algoritmul de repetiție** e unul modern și corect implementat, iar setările lui sunt adunate într-un singur loc.
- **Verificarea răspunsurilor scrise** e foarte tolerantă și inteligentă (diacritice, ordine, greșeli de tastare, Austria/Australia).
- **Calitatea conținutului:** faptele sunt verificate, iar pozele sunt auditate vizual.
- **Testele automate** acoperă datele, răspunsurile, testul cu imagini, PWA-ul și tastatura de pe telefon.
- **Designul** e unitar (Morlet), cu temă luminoasă și întunecată.

## 4. Ce nu mergea și am reparat în runda asta

| Problemă | Cauza | Ce am făcut |
|---|---|---|
| În sesiunea rapidă, aceeași întrebare greșită revenea în 2-3 minute | Cardul greșit era pus înapoi în sesiune după alte 10 carduri; regula de „o oră" se aplica doar între sesiuni | Sesiunea rapidă și amestecul nu mai repetă cardul: revine după o oră. În lecțiile pe domeniu revine o singură dată, la finalul lecției. |
| Lecții prea scurte | Teste fixe de 10 întrebări, lecții de 20 de carduri | 25 implicit pentru ambele, cu alegere în Setări (10 / 20 / 25 / 30). |
| „Încă o dată" la finalul lecției | Text vechi | Peste tot scrie „Continuă". Testul continuat evită întrebările din runda dinainte. |
| Poze cu mașini de curse, raliu sau modificate | Pozele găsite automat pe Commons | 31 de poze scoase după un audit vizual al tuturor celor 216. |
| Ceasuri: prea multe mărci și modele, prea puțină tehnică | Conținutul inițial | 105 carduri noi: mecanism, complicații, brățări, materiale, carcasă și ace, certificări, plus poze. |

## 5. Ce încă nu merge sau lipsește

1. **Mașinile care și-au pierdut poza** nu mai apar în testul „Recunoaște după imagine" (de exemplu Porsche are acum o singură poză). Trebuie căutate poze cu modelul de serie, de la expoziții sau din stradă.
2. **Progresul pe telefon (PWA) nu se sincronizează** între dispozitive; dacă se pierde telefonul, se pierde tot ce nu e exportat.
3. **„Raportează o eroare"** (planificat în etapa 3) nu există încă; Matei nu are cum să semnaleze un card greșit din aplicație.
4. **Mărci de supercar cu 1-2 modele** (Pagani, Rimac, Zenvo, SSC, Hennessey etc.) nu intră în testul cu imagini.
5. **Nu există căutare globală** - dacă vrei să găsești rapid „Tourbillon" sau „Lancia", trebuie să știi în ce domeniu e.
6. **Nu există sunet** - pronunția la vocabularul englez ar ajuta mult.
7. **Pe hărțile mari**, câmpul de răspuns poate rămâne sub tastatură (compromis cunoscut, notat în AGENTS.md).

## 6. Idei noi, ordonate după cât de mult ar ajuta

### A. Ușor de făcut, efect mare

| Idee | Ce face | De ce |
|---|---|---|
| **Pronunție (vocabular englez)** | Butonul 🔊 citește cuvântul cu vocea telefonului (`speechSynthesis`), fără internet | Funcționează și în artifact, nu are nevoie de server |
| **Căutare globală** | O casetă pe ecranul principal care caută în toate domeniile | Te duce direct la card sau la subsecțiune |
| **Misiunea zilei** | 3 obiective mici (de exemplu: 1 test perfect, 20 de repetări, 1 domeniu nou) cu XP bonus | Motivează fără presiune, ca la Duolingo |
| **Bara de stăpânire pe subsecțiuni** | Pe pagina domeniului, fiecare subsecțiune arată % învățat | Vezi imediat unde mai ai de lucru |
| **„Raportează o eroare"** | Planul din AGENTS.md 10.3 | Cardurile greșite ajung la tine cu id-ul cardului |

### B. Efort mediu

| Idee | Ce face |
|---|---|
| **Traseu de lecții** | Fiecare domeniu devine un drum: lecția 1, 2, 3..., fiecare de 25 de carduri, cu o stea la final |
| **Test adaptiv** | Același card trece de la variante la răspuns scris când l-ai nimerit de 2 ori |
| **Joc „Potrivește" pe orice domeniu** | Jocul din introducere, disponibil oricând, contra cronometru |
| **Hartă contra cronometru** | Câte țări sau județe găsești în 60 de secunde, cu record pe continent |
| **Duel pe același telefon** | Doi jucători, pe rând, aceleași întrebări, câștigă cine are mai multe corecte |
| **Cartea de recorduri** | O pagină cu recordurile personale pe fiecare domeniu și tip de test |

### C. Mai mult de muncă

| Idee | Ce face |
|---|---|
| **Domeniu nou generat cu Claude** | Planul din AGENTS.md 10.2, prin Cloudflare Worker |
| **Sincronizare pentru PWA** | Salvare în cloud (de exemplu tot prin Worker), ca progresul să nu se piardă |
| **Poze noi la mașini** | Modelul de serie pentru cele 31 de carduri rămase fără poză și modele noi la mărcile de supercar |
| **Ceasuri - runda următoare** | Poze de detaliu cu mecanisme (azi regula le exclude), animație simplă a ancorei |

## 7. Funcții prietenoase pentru utilizator (mici, dar se simt)

- **Vibrație scurtă** la răspuns corect sau greșit (`navigator.vibrate`, doar pe Android).
- **Mod „fără grabă"**: un comutator care ascunde cronometrul în sesiunea rapidă.
- **Explicația „De ce?"** mai vizibilă după un răspuns greșit (azi e în detaliile cardului).
- **Recapitulare la final de lecție**: lista cardurilor greșite, cu butonul „Exersează-le acum" (există la teste, nu și la lecții).
- **Font mai mare** ca opțiune în Setări.
- **Confirmare la ieșirea din lecție** dacă ai răspuns la peste jumătate din carduri.

## 8. Ce recomand pentru runda următoare

1. Poze noi pentru cele 31 de mașini (modelul de serie) - repară direct ce s-a pierdut acum.
2. „Raportează o eroare" - Matei poate semnala singur problemele.
3. Pronunție la vocabular și căutare globală - cele mai ieftine funcții cu cel mai mare efect.
4. Misiunea zilei și bara de stăpânire pe subsecțiuni - pentru motivație.
