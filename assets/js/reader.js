//to do: add color and category select, find way to
// retain proper ordering of elements based on place in text,
// fix issue with ghost spans preventing re-highlighting
// fix encoding of apostrophes by microsoft word
var result;
var current_category = {
    "number": 1,
    "category": "conservative",
    "color": "red"
  };
var current_index = 1;
var jsonDB = [
  {
    "index": 0, //place in the text that the line occurs
    "text": "", //contents of line-height
    "category": "", //used to determine colors
    "color": "", /// unecessary but makes things easier
    "comment": ""
  }
];

document.getElementById("makeSelection").addEventListener("click", function(){makeSelection()});
document.getElementById("undoSelection").addEventListener("click", function(){undoSelection()});
document.getElementById("confirmSelection").addEventListener("click", function(){confirmSelection()});

//reads the file uploaded and displays to the left
window.onload = function() {
  var fileupload = document.getElementById('fileupload');

    fileupload.addEventListener('change', function(e) {
      var file = fileupload.files[0];
      currentFile = fileupload.files[0];

      var reader = new FileReader();

      reader.onload = function(e) {
          result = reader.result;
          displayText(result);
      }
      reader.readAsText(file);

    });
}

// does exactly that
function displayText(result) {
      d3.select("#text_container").html(result).style("opacity", 1);
      d3.select("#instructions1").style("opacity", .3);
      d3.select("#fileupload").style("opacity", .3);
      d3.select("#instructions2").style("opacity", 1);
}

function makeSelection() {
  // get highlighted text
  var selectedText = "";
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  }
  // get general area of selected text
  oRange = window.getSelection().getRangeAt(0); //get the text range
  oRect = oRange.getBoundingClientRect();
  console.log(oRect);
  console.log(oRect.left);

  //remove any previous selection div
  d3.select("#selection").remove();

  // add new selection div

  d3.select("body").append("div")
    .attr("id", "selection")
    .html(selectedText)
    .style("left", oRect.left + "px")
    .style("top", oRect.top + "px")
    .style("width", oRect.width + "px")
    .style("height", oRect.height + "px");
  d3.select("#text_container").style("opacity", 0);
  d3.select("#selection").style("opacity", .85);

}

function undoSelection() {
  d3.select("#text_container").style("opacity", 1);
    d3.select("#selection").remove();
}

function confirmSelection() {
    d3.select("#selection").style("animation", "moveToCorner 1.5s ease 1")
      .style("animation-fill-mode", "forwards").style("pointer-events", "none");

    d3.select("#text_container").html(d3.select("#selection").html());
    d3.select("#text_container").style("opacity", 1);

    d3.select("#selection").remove();

    newInstructions();
}

function newInstructions() {
  var highlightScreen = "<p id='instructions3'>Input your categories and choose a corresponding color for each category.</p><br>\
  <button id ='highlight'>Highlight this</button>"
  d3.select("#control_container").html(highlightScreen);

  document.getElementById("highlight").addEventListener("click", function(){highlight()});
}

function highlight() {
    var sel = window.getSelection();
    var selText = sel.toString();
    var range = sel.getRangeAt(0);
    var newNode = document.createElement("span");
    var spanID = current_category.color + current_category.category + current_index;
    newNode.setAttribute('id', spanID);
    newNode.setAttribute('style', "background-color: " + current_category.color);
    newNode.setAttribute('class', "highlightSpan");
    range.surroundContents(newNode);

    oRange = sel.getRangeAt(0); //get the text range
    oRect = oRange.getBoundingClientRect();

    d3.select("#text_container").append("div")
      .attr("class", "sidenote")
      .attr("id", "sidenote" + current_index)
      .style("color", current_category.color)
      .html("<p>" + current_category.category + " " + current_index + "</p>")
      .style("top", oRect.top + "px");

    var this_index = current_index;

    document.getElementById("sidenote" + current_index).addEventListener("click", function(){
      removeThisHighlight(this_index, spanID);});



    var segment = {
        "index": current_index,
        "text":  selText, //contents of line-height
        "category": current_category.category, //used to determine colors
        "color": current_category.color, /// unecessary but makes things easier
        "comment": "",
      };
    jsonDB.push(segment);
    current_index += 1;
    console.log(jsonDB);
}

//fix this
function removeThisHighlight(index, spanID) {
    d3.select("#" + spanID).attr("id", "")
      .style("background-color", "white");
    d3.select("#sidenote" + index).remove();
}
