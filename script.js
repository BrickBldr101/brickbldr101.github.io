// ==============================
// Global Variables
// ==============================
let BIBLE = {};           // Stores the currently loaded book
let CURRENT_BOOK = "";    // Tracks which book is loaded
let book = "";            // Current book
let chapter = 1;          // Current chapter

// ==============================
// Load a book JSON dynamically
// ==============================
async function loadBook(bookName) {
  if (CURRENT_BOOK === bookName && Object.keys(BIBLE).length > 0) return;

  try {
    const res = await fetch(`./webBible/${bookName}.json`);
    const data = await res.json();

    // Convert array of objects into { chapter: { verse: text } }
    BIBLE = {};
    data.forEach(v => {
      if (v.chapterNumber == null || v.verseNumber == null) return;
      const ch = v.chapterNumber.toString();
      const vs = v.verseNumber.toString();
      if (!BIBLE[ch]) BIBLE[ch] = {};
      BIBLE[ch][vs] = v.value || "";
    });

    CURRENT_BOOK = bookName;
  } catch (err) {
    console.error("Failed to load book:", err);
    document.getElementById("verse").innerHTML = "<em>Book not found</em>";
  }
}

// ==============================
// Fetch a verse or chapter
// ==============================
async function fetchVerse(bookName, verseInput, push = true) {
  await loadBook(bookName);

  const [ch, vs] = verseInput.split(":");
  const chap = ch;
  const verseNum = vs;

  let output;

  if (verseNum) {
    // Single verse
    if (BIBLE[chap] && BIBLE[chap][verseNum]) {
      output = `<strong>${bookName} ${chap}:${verseNum}</strong><br>${BIBLE[chap][verseNum]}`;
    } else {
      output = "<em>Verse not found</em>";
    }
    document.title = `${bookName} ${chap}:${verseNum} - BibleLookup`;
  } else {
    // Whole chapter
    if (BIBLE[chap]) {
      output = Object.entries(BIBLE[chap])
        .map(([v, text]) => `<sup>${v}</sup> ${text}`)
        .join(" ");
      output = `<strong>${bookName} ${chap}</strong><br>${output}`;
      document.title = `${bookName} ${chap} - BibleLookup`;
    } else {
      output = "<em>Chapter not found</em>";
    }
  }

  document.getElementById("verse").innerHTML = output;

  if (push) {
    history.pushState(
      { book: bookName, verse: verseInput },
      "",
      `?book=${encodeURIComponent(bookName)}&verse=${encodeURIComponent(verseInput)}`
    );
  }
}

// ==============================
// Convert input into book + chapter:verse
// ==============================
function convertVerse() {
  const input = document.getElementById("textbox").value.trim();
  if (!input) return;

  const parts = input.split(" ");
  const verseInput = parts.pop();          // e.g., 3:16
  book = parts.join(" ");                   // e.g., "John" or "1 John"

  const chapNum = Number(verseInput.split(":")[0]);
  chapter = chapNum;

  fetchVerse(book, verseInput);
}

// ==============================
// Chapter navigation helpers
// ==============================
function getChapterNumbers() {
  return Object.keys(BIBLE).map(Number).sort((a, b) => a - b);
}

document.getElementById("nextChapter").onclick = async function() {
  const chapters = getChapterNumbers();
  const idx = chapters.indexOf(chapter);
  if (idx < 0 || idx + 1 >= chapters.length) return;
  chapter = chapters[idx + 1];
  await fetchVerse(book, chapter.toString());
};

document.getElementById("lastChapter").onclick = async function() {
  const chapters = getChapterNumbers();
  const idx = chapters.indexOf(chapter);
  if (idx <= 0) return;
  chapter = chapters[idx - 1];
  await fetchVerse(book, chapter.toString());
};

// ==============================
// Verse of the Day (random)
// ==============================
document.getElementById("votd").onclick = async function() {
  const books = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
  const randomBook = books[Math.floor(Math.random() * books.length)];
  await loadBook(randomBook);
  const chapters = getChapterNumbers();
  const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
  const verses = Object.keys(BIBLE[randomChapter]);
  const randomVerse = verses[Math.floor(Math.random() * verses.length)];
  await fetchVerse(randomBook, `${randomChapter}:${randomVerse}`);
};

// ==============================
// Keyboard Enter to submit
// ==============================
const input = document.getElementById("textbox");
input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    convertVerse();
  }
});

document.getElementById("submit").onclick = convertVerse;

// ==============================
// Sharing
// ==============================
document.getElementById("share").onclick = function() {
  navigator.share({
    title: document.title,
    text: `"${document.getElementById("verse").textContent}"\n\n`,
    url: window.location.href
  });
};

// ==============================
// Speech
// ==============================
document.getElementById("read").onclick = function() {
  let text = document.getElementById("verse").textContent;
  text = text.replace(/:/g, ", ").replace(/\b(?!\d+:)\d+\b/g, '');
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);

  document.getElementById("pause").onclick = () => speechSynthesis.pause();
  document.getElementById("resume").onclick = () => speechSynthesis.resume();
  document.getElementById("stop").onclick = () => speechSynthesis.cancel();
};

// ==============================
// Load verse from URL
// ==============================
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const b = params.get("book");
  const v = params.get("verse");

  if (b && v) {
    book = b;
    chapter = Number(v.split(":")[0]);
    fetchVerse(b, v, false);
  } else {
    // Default to VOTD
    document.getElementById("verse").innerHTML = "<em>Enter a verse above</em>";
  }
}

// ==============================
// Initialize on page load
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  loadFromURL();
});
