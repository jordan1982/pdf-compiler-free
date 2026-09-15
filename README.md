# PDF Editor & Signer

Un'applicazione web moderna, veloce e sicura sviluppata in React per visualizzare, compilare, firmare e modificare documenti PDF direttamente all'interno del browser.

---

## 🚀 Caratteristiche Principali

* **Visualizzazione Avanzata:** Supporto sia alla modalità pagina singola che alla **modalità continua** con scorrimento fluido.
* **Compilazione Campi Testo:** Inserimento di campi di testo personalizzati con formattazione completa (font, dimensione, colore, grassetto, corsivo, sottolineato).
* **Gestione Firme Digitali:** Creazione, posizionamento, ridimensionamento e salvataggio di firme riutilizzabili.
* **Modifica Strutturale PDF:** Aggiunta di pagine bianche ed eliminazione di pagine esistenti con re-indicizzazione automatica dei contenuti.
* **Spostamento Multipagina:** Posizionamento fluido degli elementi (sia via mouse/touch che via tastiera) con transizione automatica tra le pagine.
* **Privacy 100% Locale:** Nessun file o dato viene inviato a server esterni; l'elaborazione del PDF e la persistenza dei dati avvengono esclusivamente nel browser via `localStorage` e RAM.
* **Scorciatoie da Tastiera:** Controllo rapido dell'editor con supporto a copia/incolla, eliminazione, annulla/ripristina e spostamento fine degli elementi.
* **Esportazione Flessibile:** Download del documento PDF finale elaborato o esportazione delle singole pagine come immagini PNG.

---

## 🛠️ Tecnologie Utilizzate

* **React** - Libreria principale per l'interfaccia utente
* **pdfjs-dist** - Rendering ad alta fedeltà delle pagine PDF
* **pdf-lib** - Manipolazione strutturale ed esportazione dei file PDF
* **Lucide React** - Set di icone
* **Tailwind CSS** - Styling e responsive design

---

## 📦 Installazione e Avvio

1. **Clona il repository:**
   ```bash
   git clone [https://github.com/jordan1982/pdf-compiler-free.git](https://github.com/jordan1982/pdf-compiler-free.git)
   cd nome-progetto