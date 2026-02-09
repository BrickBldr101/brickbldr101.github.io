// Global variables
let CURRENT_BOOK = "";
let CURRENT_VERSION = "WEB"; // default version
let BIBLE = {};
let chapter = 1;

// Normalize book name based on version
function normalizeBookName(bookName) {
  if (!bookName) return "";
  if (CURRENT_VERSION === "WEB") return bookName.toLowerCase();
  // KJV: remove spaces and uppercase (1 John → 1JOHN)
  return bookName.replace(/\s+/g, "").toUpperCase();
}

// Load a book JSON and normalize to internal BIBLE structure
async function loadBook(bookName) {
  const filename = CURRENT_VERSION === "WEB" 
    ? bookName.toLowerCase() 
    : bookName.replace(/\s+/g, "").toUpperCase(); // KJV uppercase, no spaces

  try {
    const res = await fetch(`./${CURRENT_VERSION}/${filename}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    BIBLE = {};

    if (Array.isArray(data)) {
      // WEB format: array of objects
      data.forEach(v => {
        if (v.chapterNumber == null || v.verseNumber == null) return;
        const ch = v.chapterNumber.toString();
        const vs = v.verseNumber.toString();
        if (!BIBLE[ch]) BIBLE[ch] = {};
        BIBLE[ch][vs] = v.value || v.text || "";
      });
    } else if (data.book && Array.isArray(data.chapters)) {
      // KJV format: { book: "Exodus", chapters: [...] }
      data.chapters.forEach(chObj => {
        const ch = chObj.chapter.toString();
        if (!BIBLE[ch]) BIBLE[ch] = {};
        chObj.verses.forEach(vsObj => {
          const vs = vsObj.verse.toString();
          BIBLE[ch][vs] = vsObj.text || "";
        });
      });
    } else {
      console.warn("Unknown Bible JSON format:", data);
    }

    CURRENT_BOOK = bookName;
    chapter = Math.min(chapter, Object.keys(BIBLE).length || 1);

  } catch (err) {
    console.error("Failed to load book:", err);
    document.getElementById("verse").innerHTML = "<em>Book not found</em>";
  }
}

// Fetch and display a verse
async function fetchVerse(book, verse, push = true) {
  if (!book || !verse) {
    document.getElementById("verse").innerHTML = "<em>VOTD not implemented</em>";
    document.title = "VOTD - BibleLookup";
    return;
  }

  await loadBook(book);

  const [chapterNum, verseNum] = verse.split(":");
  const text = BIBLE[chapterNum]?.[verseNum] || "<em>Verse not found</em>";

  document.getElementById("verse").innerHTML = `<strong>${book} ${verse}</strong> ${text}`;
  document.title = `${book} ${verse} - BibleLookup`;
  chapter = Number(chapterNum);

  if (push) {
    history.pushState(
      { book, verse },
      "",
      `?book=${encodeURIComponent(book)}&verse=${encodeURIComponent(verse)}&version=${encodeURIComponent(CURRENT_VERSION)}`
    );
  }
}

// Convert input box text to fetch a verse
function convertVerse() {
  const input = document.getElementById("textbox").value.trim();
  if (!input) return;

  let [bookRaw, verseRaw] = input.split(" ");
  if (!verseRaw) verseRaw = "1:1";

  // Normalize capitalization for WEB
  const book = CURRENT_VERSION === "WEB"
    ? bookRaw.toLowerCase()
    : bookRaw.charAt(0).toUpperCase() + bookRaw.slice(1);

  fetchVerse(book, verseRaw);
}

// Navigation helpers
function nextChapterVerse() {
  const next = chapter + 1;
  if (BIBLE[next]) {
    fetchVerse(CURRENT_BOOK, `${next}:1`);
  } else {
    alert("No next chapter");
  }
}

function prevChapterVerse() {
  const prev = chapter - 1;
  if (BIBLE[prev]) {
    fetchVerse(CURRENT_BOOK, `${prev}:1`);
  } else {
    alert("No previous chapter");
  }
}

// Event listeners
document.getElementById("submit").onclick = convertVerse;
document.getElementById("textbox").addEventListener("keypress", e => {
  if (e.key === "Enter") convertVerse();
});

document.getElementById("version").addEventListener("change", e => {
  CURRENT_VERSION = e.target.value;
  if (CURRENT_BOOK) fetchVerse(CURRENT_BOOK, `${chapter}:1`);
});

document.getElementById("nextChapter").onclick = nextChapterVerse;
document.getElementById("lastChapter").onclick = prevChapterVerse;

// Load from URL params
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const book = params.get("book");
  const verse = params.get("verse");
  const version = params.get("version");

  if (version) CURRENT_VERSION = version;
  if (book && verse) {
    fetchVerse(book, verse, false);
    document.getElementById("version").value = CURRENT_VERSION;
  }
}

loadFromURL();
  