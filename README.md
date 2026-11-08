# OpenMind (Cartoteca lui Matei)

Aplicație web de învățare pentru Matei: carduri (flashcards), teste, comparații, hărți și insigne, cu repetiție spațiată (algoritmul FSRS). Funcționează pe telefon și pe calculator, direct în browser, fără instalare.

17 domenii: Mașini, Ceasuri, Psihologie și comportament, Țări și capitale, Localizare țări, Județele României, Steagurile lumii, Aviație, Tabelul periodic, Astronomie, Istoria României, Corpul uman, Erori de gândire, Educație financiară, Monumente, Arhitectură, Vocabular englez.

## Structura

| Cale | Ce conține |
|---|---|
| `index.html` | Pagina aplicației (interfață și stiluri) |
| `app.js` | Logica: repetiție spațiată, teste, evaluarea răspunsurilor scrise, hărți, salvare |
| `data/index.json` | Lista domeniilor |
| `data/<domeniu>.json` | Cardurile fiecărui domeniu (întrebare, răspuns, detalii, imagine) |
| `data/world.json` | Hărțile folosite la localizare |
| `img/*.jpg` | Imaginile cardurilor |
| `img/pack-<domeniu>-<n>.json` | Imagini adăugate în Runda 2, câte 40 pe fișier, încărcate la nevoie |
| `CREDITS.md` | Autorul, licența și sursa fiecărei imagini |

## Aplicația instalată (GitHub Pages)

După activarea GitHub Pages, aplicația e la https://47matei.github.io/knowledge-app/. Pe Android: deschide adresa în Chrome → meniul ⋮ → „Adaugă pe ecranul de pornire". Progresul se salvează doar pe telefon, așa că fă un export lunar (Setări → Datele tale → Exportă); aplicația îți amintește singură.

## Rulare locală

Aplicația are nevoie de un server web, pentru că încarcă fișierele `data/` și `img/` prin rețea:

```bash
python3 -m http.server 8000
```

Apoi deschide `http://localhost:8000` în browser.

## Unde se salvează progresul

- **În Claude** (artefactul publicat): progresul se salvează local și se sincronizează în contul Claude.
- **În afara Claude** (local sau pe GitHub Pages): progresul se salvează doar în browser (`localStorage`), pe dispozitivul respectiv. Sincronizarea între dispozitive ar necesita un serviciu separat.

Repo-ul conține doar aplicația și cardurile, nu progresul cuiva.

## Cum lucrăm

- `main` - versiunea stabilă, identică cu cea publicată.
- `dev` - ramura de lucru. Modificările se fac aici sau pe ramuri separate (`feature/...`) și ajung în `main` printr-un Pull Request, după ce au fost verificate.

Versiunea inițială din acest repo este exportul aplicației din 7 noiembrie 2026 (Runda 2: test „Recunoaște după imagine” la ceasuri și mașini, mărci noi de supercaruri și ceasuri).

## Planificat (etapa 3)

- Domeniu personalizat generat cu Claude
- „Raportează o eroare” pe carduri
- Ghid de instalare ca aplicație pe telefon (PWA)
- Posibil: aplicație Android nativă

## Imagini

Fotografiile provin de pe Wikimedia Commons, sub licențe libere (domeniu public, CC0, CC BY, CC BY-SA). Atribuirile complete sunt în [CREDITS.md](CREDITS.md).
