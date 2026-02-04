//https://labs.bible.org/api/?passage=John%203:16
fetchVerse = function(book, verse){
    if (book == "" || verse == ""){
        fetch("https://labs.bible.org/api/?passage=votd").then(response => {
            if (!response.ok){
                throw new Error("Network was not ok");
            }
            return response.text();
        }).then(text => {
            document.getElementById("verse").innerHTML = text;
            document.title = "VOTD - BibleLookup";
        })
    }
    else{
        fetch("https://labs.bible.org/api/?passage="+book+"%20"+verse).then(response => {
            if (!response.ok){
                throw new Error("Network was not ok");
            }
            return response.text();
        }).then(text => {
            document.getElementById("verse").innerHTML = book.bold() + " ";
            document.getElementById("verse").innerHTML = document.getElementById("verse").innerHTML + text;
            document.title = book + " " + verse + " - BibleLookup";
        })
    }
}

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

document.getElementById("copy").onclick = function () {
  const text = document.getElementById("verse").textContent;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied!");
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
};

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    alert("Copied!");
  } catch (err) {
    alert("Copy failed");
  }

  document.body.removeChild(textarea);
}

// Put up the VOTD upon loading
fetchVerse("", "")

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