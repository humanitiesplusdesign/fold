// fix encoding of apostrophes by microsoft word
//fix issue with bounding rectangles when page is scrolled down,find how to calculate scroll pixels
var result;
var colorMap = d3.map();
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
  var highlightScreen = "<p id='instructions3'>Input your categories and choose a corresponding color for each category. To select a highlight color, click on the button next to the desired category</p>";
  highlightScreen += "<button id='highlight'>Highlight</button>" + "<p id='color_controls'>\
    <form>\
    Create Category: <input type='text' id='categoryH'><br>Choose Highlight Color: <input type='text' id='colorH'>\
  </form>\
  <button id='sub'>Enter</button>\
  </p>\
  <div id='current_colors'>\
  </div>";
  d3.select("#control_container").html(highlightScreen);

  document.getElementById("sub").addEventListener("click", function(){addNewCategory()});
  document.getElementById("highlight").addEventListener("click", function(){highlight()});
  d3.select("#control_container").append("svg")
  .attr("id", "svg_control_container");
}

function addNewCategory() {
  var colorH = d3.select("#colorH").property("value");
  var categoryH = d3.select("#categoryH").property("value");

  colorMap.set(categoryH, colorH);
  var controlsHTML = "";
  var position = 15;
  colorMap.forEach(function (key, value) {
    var thisControl = "<p id=" + key + ">" + key + "<input type='radio' name='color' id=check_" + key + " value=" + key + ">" + "</p>";
    controlsHTML += thisControl;
    d3.select("#current_colors").html(controlsHTML);
    d3.select("#svg_control_container").append("circle")
      .attr("id", value + key)
      .attr("fill", value)
      .attr("r", 10)
      .attr("cx", 20)
      .attr("cy", position);
    position += 60;
  });

}

function highlight() {
  current_category.category = $('input[name=color]:checked').val();
  current_category.color = colorMap.get($('input[name=color]:checked').val());

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

function removeThisHighlight(index, spanID) {
    $("#" + spanID).contents().unwrap();
    d3.select("#sidenote" + index).remove();
}
