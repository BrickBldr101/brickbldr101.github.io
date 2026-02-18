//https://labs.bible.org/api/?passage=John%203:16
fetchVerse = function (book, verse, push = true) {
  let url;

  if (book === "" || verse === "") {
    url = "https://labs.bible.org/api/?passage=votd";

    fetch(url)
      .then(r => r.text())
      .then(text => {
        document.getElementById("verse").innerHTML = text;
        document.title = "VOTD - BibleLookup";

        if (push) {
          history.pushState(
            { book: "", verse: "" },
            "",
            "/"
          );
        }
      });

  } else {
    url = `https://labs.bible.org/api/?passage=${book}%20${verse}`;

    fetch(url)
      .then(r => r.text())
      .then(text => {
        document.getElementById("verse").innerHTML =
          `<strong>${book}</strong> ` + text;

        document.title = `${book} ${verse} - BibleLookup`;

        if (push) {
          history.pushState(
            { book, verse },
            "",
            `?book=${encodeURIComponent(book)}&verse=${encodeURIComponent(verse)}`
          );
        }
      });
  }
};

convertVerse = function(){
    let input = document.getElementById("textbox").value;
    let listInput = input.split(" ");
    let bookRaw = listInput[0];
    let verse  = listInput[1];
    let chapterRaw = verse.split(":");
    globalThis.chapter = chapterRaw[0];
    globalThis.nextChapter = Number(chapter) + 1;
    globalThis.lastChapter = Number(chapter) - 1;

    book = bookRaw.charAt(0).toUpperCase() + bookRaw.slice(1)

    fetchVerse(book, verse)
}

document.getElementById("submit").onclick = function(){
  convertVerse();
}


input.addEventListener("keypress", function(event) {
  if (event.key == "Enter") {
    convertVerse();
  }
})

document.getElementById("votd").onclick = function(){
  fetchVerse("", "")
}

document.getElementById("share").onclick = function () {
    navigator.share({
      title: document.title,
      text: '"' + document.getElementById("verse").textContent + '"\n\n',
      url: window.location.href
    })
}


document.getElementById("read").onclick = function(){
  let oldText = document.getElementById("verse").textContent
  let text = oldText.replace(/:/g, ", ")
  text = text.replace(/\b(?!\d+:)\d+\b/g, '');
  console.log(text);
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  document.getElementById("pause").onclick = function(){
    speechSynthesis.pause();
  }
  document.getElementById("resume").onclick = function(){
    speechSynthesis.resume();
  }
  document.getElementById("stop").onclick = function(){
    speechSynthesis.cancel();
  }
}

document.getElementById("nextChapter").onclick = function(){
  fetchVerse(book, nextChapter.toString());
  nextChapter = Number(nextChapter)
  lastChapter = lastChapter  + 1;
  nextChapter = nextChapter + 1;
  chapter = chapter + 1;
  
}

document.getElementById("lastChapter").onclick = function(){
  fetchVerse(book, lastChapter.toString()); 
  lastChapter = Number(lastChapter)
  nextChapter = nextChapter - 1
  lastChapter = lastChapter - 1;
  chapter = chapter - 1;
  
  
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const book = params.get("book");
  const verse = params.get("verse");

  if (book && verse) {
    fetchVerse(book, verse, false);
  } else {
    fetchVerse("", "", false); // VOTD
  }
}

loadFromURL();