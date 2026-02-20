

let selectedRange = { start: null, end: null };
let book = "";
let chapter = "";
let nextChapter = 1;
let lastChapter = 1;

fetchVerse = function(selectedBook, selectedChapter, highlightVerse = null) {
  book = selectedBook;
  chapter = Number(selectedChapter);

  fetch('./KJV/' + selectedBook + '.json')
    .then(response => response.json())
    .then(data => {
      const verses = data.chapters[chapter - 1].verses;
      const verseContainer = document.getElementById("verse");
      verseContainer.innerHTML = "";

      let highlightStart = null, highlightEnd = null;
      if (highlightVerse) {
        if (highlightVerse.includes('-')) {
          [highlightStart, highlightEnd] = highlightVerse.split('-').map(Number);
        } else {
          highlightStart = highlightEnd = Number(highlightVerse);
        }
        selectedRange.start = highlightStart;
        selectedRange.end = highlightEnd;
      } else {
        selectedRange.start = selectedRange.end = null;
      }

      verses.forEach(v => {
        const p = document.createElement("span");
        
        p.innerHTML = `<b>${v.verse}</b> ${v.text} `
        p.style.cursor = "pointer";

        if (selectedRange.start !== null &&
            v.verse >= selectedRange.start &&
            v.verse <= selectedRange.end) {
          p.style.backgroundColor = "#ffff99";
        }

        p.onclick = function() {
          const verseNum = v.verse;

          if (selectedRange.start !== null &&
              verseNum >= selectedRange.start &&
              verseNum <= selectedRange.end) {
            selectedRange.start = selectedRange.end = null;
          } else if (selectedRange.start === null) {
            selectedRange.start = verseNum;
            selectedRange.end = verseNum;
          } else {
            selectedRange.end = verseNum;
            if (selectedRange.end < selectedRange.start) {
              [selectedRange.start, selectedRange.end] = [selectedRange.end, selectedRange.start];
            }
          }

          verseContainer.querySelectorAll("p").forEach(pp => {
            const vn = Number(pp.textContent.split('.')[0]);
            if (selectedRange.start !== null &&
                vn >= selectedRange.start &&
                vn <= selectedRange.end) {
              pp.style.backgroundColor = "#ffff99";
            } else {
              pp.style.backgroundColor = "";
            }
          });
        };

        verseContainer.appendChild(p);
      });
    })
    .catch(error => console.error(error));
};

function populateChapters(bookSelectValue) {
  const chapterSelect = document.getElementById("chapter-select");
  const bookChapters = {
    "Genesis":50,"Exodus":40,"Leviticus":27,"Numbers":36,"Deuteronomy":34,
    "Joshua":24,"Judges":21,"Ruth":4,"1Samuel":31,"2Samuel":24,
    "1Kings":22,"2Kings":25,"1Chronicles":29,"2Chronicles":36,
    "Ezra":10,"Nehemiah":13,"Esther":10,"Job":42,"Psalms":150,
    "Proverbs":31,"Ecclesiastes":12,"Song of Solomon":8,"Isaiah":66,
    "Jeremiah":52,"Lamentations":5,"Ezekiel":48,"Daniel":12,"Hosea":14,
    "Joel":3,"Amos":9,"Obadiah":1,"Jonah":4,"Micah":7,"Nahum":3,
    "Habakkuk":3,"Zephaniah":3,"Haggai":2,"Zechariah":14,"Malachi":4,
    "Matthew":28,"Mark":16,"Luke":24,"John":21,"Acts":28,"Romans":16,
    "1Corinthians":16,"2Corinthians":13,"Galatians":6,"Ephesians":6,
    "Philippians":4,"Colossians":4,"1Thessalonians":5,"2Thessalonians":3,
    "1Timothy":6,"2Timothy":4,"Titus":3,"Philemon":1,"Hebrews":13,
    "James":5,"1Peter":5,"2Peter":3,"1John":5,"2John":1,"3John":1,
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

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const urlBook = params.get("book");
  const urlChapter = params.get("chapter");
  const urlVerse = params.get("verse");

  const bookSelect = document.getElementById("book-select");
  const chapterSelect = document.getElementById("chapter-select");

  if (urlBook && urlChapter) {
    bookSelect.value = urlBook;
    populateChapters(urlBook);

    const chapterNum = Number(urlChapter);
    chapterSelect.value = chapterNum;

    fetchVerse(urlBook, chapterNum, urlVerse);

    nextChapter = chapterNum + 1;
    lastChapter = chapterNum - 1;
  } else {
    fetchVerse(bookSelect.value, 1);
    nextChapter = 2;
    lastChapter = 0;
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const bookSelect = document.getElementById("book-select");
  const chapterSelect = document.getElementById("chapter-select");

  populateChapters(bookSelect.value);
  fetchVerse(bookSelect.value, 1);

  bookSelect.addEventListener("change", (event) => {
    const selectedBook = event.target.value;
    populateChapters(selectedBook);
    fetchVerse(selectedBook, 1);
    selectedRange.start = selectedRange.end = null;
    nextChapter = 2;
    lastChapter = 0;
  });

  chapterSelect.addEventListener("change", (event) => {
    const selectedChapter = event.target.value;
    fetchVerse(bookSelect.value, selectedChapter);
    selectedRange.start = selectedRange.end = null;
    nextChapter = Number(selectedChapter) + 1;
    lastChapter = Number(selectedChapter) - 1;
  });

  document.getElementById("nextChapter").onclick = function() {
    const currentChapter = Number(document.getElementById("chapter-select").value);
    fetchVerse(bookSelect.value, currentChapter + 1);
    document.getElementById("chapter-select").value = currentChapter + 1;
  };

  document.getElementById("lastChapter").onclick = function() {
    const currentChapter = Number(document.getElementById("chapter-select").value);
    fetchVerse(bookSelect.value, currentChapter - 1);
    document.getElementById("chapter-select").value = currentChapter - 1;
  };

  document.getElementById("share").onclick = function () {
    const bookVal = document.getElementById("book-select").value;
    const chapterVal = document.getElementById("chapter-select").value;
    const params = new URLSearchParams();
    params.set("book", bookVal);
    params.set("chapter", chapterVal);

    let verseText = "";

    if (selectedRange.start !== null && selectedRange.end !== null) {
      if (selectedRange.start === selectedRange.end) {
        params.set("verse", selectedRange.start);
      } else {
        params.set("verse", `${selectedRange.start}-${selectedRange.end}`);
      }

      const verseContainer = document.getElementById("verse");
      const highlightedVerses = Array.from(verseContainer.querySelectorAll("p")).filter(p => {
        const verseNum = Number(p.textContent.split('.')[0]);
        return verseNum >= selectedRange.start && verseNum <= selectedRange.end;
      });

      verseText = highlightedVerses.map(p => p.textContent).join('\n');
    }

    navigator.share({
      title: `${bookVal} ${chapterVal}`,
      text: verseText,
      url: `${window.location.pathname}?${params.toString()}`
    });
  };

  loadFromURL();
});