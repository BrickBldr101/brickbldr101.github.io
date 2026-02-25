// variables
let selectedRange = { start: null, end: null };
let book = "";
let chapter = "";
let nextChapter = 1;
let lastChapter = 1;

window.onload = loadFromURL;



fetchVerse = function(selectedBook, selectedChapter, translation, highlightVerse = null) {
  book = selectedBook;
  chapter = Number(selectedChapter);

  if (translation == undefined){
    translation = "WEB"
  }

  fetch(`./Bible/${translation}/${selectedBook}.json`)
    .then(response => response.json())
    .then(data => {

      const chapterData = data[selectedBook][chapter];
      const verseContainer = document.getElementById("verse");
      verseContainer.innerHTML = "";

      Object.keys(chapterData).forEach(verseNum => {
        const text = chapterData[verseNum];

        const span = document.createElement("span");
        span.innerHTML = `<b>${verseNum}</b> ${text} `;
        span.style.cursor = "pointer";

        const vNum = Number(verseNum);

        if (selectedRange.start !== null &&
            vNum >= selectedRange.start &&
            vNum <= selectedRange.end) {
          span.style.backgroundColor = "#ffff99";
        }

        span.onclick = function() {

          if (selectedRange.start !== null &&
              vNum >= selectedRange.start &&
              vNum <= selectedRange.end) {
            selectedRange.start = selectedRange.end = null;
          } else if (selectedRange.start === null) {
            selectedRange.start = vNum;
            selectedRange.end = vNum;
          } else {
            selectedRange.end = vNum;

            if (selectedRange.end < selectedRange.start) {
              [selectedRange.start, selectedRange.end] =
              [selectedRange.end, selectedRange.start];
            }
          }
          
          updateURL(book, chapter);
          fetchVerse(book, chapter, translation); // re-render
        };

        verseContainer.appendChild(span);
      });

    })
    .catch(error => console.error(error));
};

function updateURL(book, chapter) {
    const url = new URL(window.location);

    url.searchParams.set('book', book);
    url.searchParams.set('chapter', chapter);
    url.searchParams.set('selectRangeStart', selectedRange.start)
    url.searchParams.set('selectRangeEnd', selectedRange.end)

    window.history.pushState({}, '', url);
}
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const bookParam = params.get('book');
    const chapterParam = params.get('chapter');
    const startParam = params.get('selectRangeStart');
    const endParam = params.get('selectRangeEnd');

    if (bookParam && chapterParam) {
        // 1. Update the UI dropdowns to match the URL
        const bookSelect = document.getElementById("book-select");
        const chapterSelect = document.getElementById("chapter-select");
        
        bookSelect.value = bookParam;
        populateChapters(bookParam); // Rebuild chapter list for this book
        chapterSelect.value = chapterParam;

        // 2. Load the highlights into our global variable
        if (startParam && endParam) {
            selectedRange.start = Number(startParam);
            selectedRange.end = Number(endParam);
        }

        // 3. Actually fetch and render the verses
        fetchVerse(bookParam, chapterParam);
    }
}

// make the chapters based on the book
function populateChapters(bookSelectValue) {
  const chapterSelect = document.getElementById("chapter-select");
  const bookChapters = {
    "Genesis":50,"Exodus":40,"Leviticus":27,"Numbers":36,"Deuteronomy":34,
    "Joshua":24,"Judges":21,"Ruth":4,"1 Samuel":31,"2 Samuel":24,
    "1 Kings":22," 2Kings":25,"1 Chronicles":29,"2 Chronicles":36,
    "Ezra":10,"Nehemiah":13,"Esther":10,"Job":42,"Psalm":150,
    "Proverbs":31,"Ecclesiastes":12,"Song of Solomon":8,"Isaiah":66,
    "Jeremiah":52,"Lamentations":5,"Ezekiel":48,"Daniel":12,"Hosea":14,
    "Joel":3,"Amos":9,"Obadiah":1,"Jonah":4,"Micah":7,"Nahum":3,
    "Habakkuk":3,"Zephaniah":3,"Haggai":2,"Zechariah":14,"Malachi":4,
    "Matthew":28,"Mark":16,"Luke":24,"John":21,"Acts":28,"Romans":16,
    "1 Corinthians":16,"2 Corinthians":13,"Galatians":6,"Ephesians":6,
    "Philippians":4,"Colossians":4,"1 Thessalonians":5,"2 Thessalonians":3,
    "1 Timothy":6,"2 Timothy":4,"Titus":3,"Philemon":1,"Hebrews":13,
    "James":5,"1 Peter":5,"2 Peter":3,"1 John":5,"2 John":1,"3 John":1,
    "Jude":1,"Revelation":22
  };

  chapterSelect.innerHTML = "";
  const numChapters = bookChapters[bookSelectValue];
  for (let i = 1; i <= numChapters; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    chapterSelect.appendChild(option);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const bookSelect = document.getElementById("book-select");
  const chapterSelect = document.getElementById("chapter-select");
  const translationSelect = document.getElementById("translation-select");

  populateChapters(bookSelect.value);
  fetchVerse(bookSelect.value, 1);

  bookSelect.addEventListener("change", (event) => {
    const selectedBook = event.target.value;
    populateChapters(selectedBook, chapterSelect.value);
    fetchVerse(selectedBook, 1, translationSelect.value);
    document.title = `${bookSelect.value} ${chapterSelect.value} -  Verbum Bible`;
    updateURL(bookSelect.value, chapterSelect.value);
    selectedRange.start = selectedRange.end = null;
    nextChapter = 2;
    lastChapter = 0;
  });

  chapterSelect.addEventListener("change", (event) => {
    const selectedChapter = event.target.value;
    fetchVerse(bookSelect.value, selectedChapter, translationSelect.value);
    document.title = `${bookSelect.value} ${chapterSelect.value} -  Verbum Bible`;
    updateURL(bookSelect.value, chapterSelect.value);
    selectedRange.start = selectedRange.end = null;
    nextChapter = Number(selectedChapter) + 1;
    lastChapter = Number(selectedChapter) - 1;
  });

  
  translationSelect.addEventListener("change", (event) => {
    const selectedTranslation = event.target.value;
    fetchVerse(bookSelect.value, chapterSelect.value, selectedTranslation)
    document.title = `${bookSelect.value} ${chapterSelect.value} -  Verbum Bible`;
    updateURL(bookSelect.value, chapterSelect.value);
  })


  document.getElementById("nextChapter").onclick = function() {
    const currentChapter = Number(document.getElementById("chapter-select").value);
    fetchVerse(bookSelect.value, currentChapter + 1);
    document.title = `${bookSelect.value} ${chapterSelect.value} -  Verbum Bible`;
    updateURL(bookSelect.value, chapterSelect.value);
    document.getElementById("chapter-select").value = currentChapter + 1;
  };

  document.getElementById("lastChapter").onclick = function() {
    const currentChapter = Number(document.getElementById("chapter-select").value);
    fetchVerse(bookSelect.value, currentChapter - 1);
    document.title = `${bookSelect.value} ${chapterSelect.value} -  Verbum Bible`;
    updateURL(bookSelect.value, chapterSelect.value);
    document.getElementById("chapter-select").value = currentChapter - 1;
  };

  
document.getElementById("share").onclick = async function () {
  // 1. Construct the specific URL for this highlight
  const url = new URL(window.location.href);
  url.searchParams.set('book', book);
  url.searchParams.set('chapter', chapter);
  url.searchParams.set('selectRangeStart', selectedRange.start);
  url.searchParams.set('selectRangeEnd', selectedRange.end);

  let shareText = `${book} ${chapter}`;

  // 2. Format the text description
  if (selectedRange.start !== null) {
    if (selectedRange.start === selectedRange.end) {
      shareText += `:${selectedRange.start}`;
    } else {
      shareText += `:${selectedRange.start}-${selectedRange.end}`;
    }
  }
  shareText += " on Verbum Bible";

  // 3. Check for support and share
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareText,
        text: shareText,
        url: url.toString() // This sends the link WITH the chapter/verses
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  } else {
    // Fallback: Copy to clipboard if Share API isn't available
    navigator.clipboard.writeText(url.toString());
    alert("Link copied to clipboard!");
  }
};


  
});