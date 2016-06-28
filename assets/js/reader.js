// preserve paragrpahs when saved as web page..
//overlapping bubbles
//create text separation capacity,, add features to annulus capacity
var result;
var reader_svg;
var colorMap = d3.map();
var current_category = {
    "number": 1,
    "category": "conservative",
    "color": "red"
  };
var current_index = 1;
// for storing data to generate annulus rings later
var jsonDB = [];

// add necessary event listeners
document.getElementById("makeSelection").addEventListener("click", function(){makeSelection()});
document.getElementById("undoSelection").addEventListener("click", function(){undoSelection()});
document.getElementById("confirmSelection").addEventListener("click", function(){confirmSelection()});

//reads the file uploaded and displays to the left
window.onload = function() {
  var fileupload = document.getElementById('fileupload');
    fileupload.addEventListener('change', function(e) {
      var file = fileupload.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
          result = reader.result;
          displayText(encodeForWord(result));
      }
      reader.readAsText(file);
    });
}

function encodeForWord(text) {
    return decodeURIComponent(encodeURIComponent(text));
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
    .style("top", oRect.top + + window.scrollY + "px")
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

// sets up highlighting abilities and category/color selection
function newInstructions() {
  var highlightScreen = "<p id='instructions3'>Input your categories and choose a corresponding color for each category. To select a highlight color, click on the button next to the desired category</p>";
  highlightScreen += "<button id='highlight'>Highlight</button>" + "<button id='annulus'>Annulus</button>" + "<p id='color_controls'>\
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
  document.getElementById("annulus").addEventListener("click", function(){displayAnnulus()});
  d3.select("#control_container").append("svg")
  .attr("id", "svg_control_container");
}

// adds a new category with corresponding color for highlighting
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
  // update the category and color used for highlighting rn
  current_category.category = $('input[name=color]:checked').val();
  current_category.color = colorMap.get($('input[name=color]:checked').val());

    // get the selected text, put a span with appropriate id around it
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

    var placement = oRect.top + window.scrollY;
    //create text bubble to the left
    d3.select("#text_container").append("div")
      .attr("class", "sidenote")
      .attr("id", "sidenote" + current_index)
      .style("color", current_category.color)
      .html("<p>" + current_category.category + "</p>")
      .style("top", placement + "px");

    var this_index = current_index;

    document.getElementById("sidenote" + current_index).addEventListener("click", function(){
      removeThisHighlight(this_index, spanID);});
    // update the array for building rings
    var segment = {
        "index": current_index,
        "text":  selText, //contents of line-height
        "category": current_category.category, //used to determine colors
        "color": current_category.color, /// unecessary but makes things easier
        "placement": placement,
        "comment": "",
      };
    jsonDB.push(segment);
    current_index += 1;
    console.log(jsonDB);
}

//removes the highlighted text given an index and an id
function removeThisHighlight(number, spanID) {
    //remove span, remove side note
    $("#" + spanID).contents().unwrap();
    d3.select("#sidenote" + number).remove();
    // delete highlight from db
    for (var i = 0; i < jsonDB.length; i++) {
        if (jsonDB[i].index == number) jsonDB.splice(i, 1);
    }
}

function displayAnnulus() {
  var controls = d3.select("#control_container");
  var storeHTML = controls.html();

  controls.html("");

  reader_svg = controls.append("svg")
  .attr("id", "svg_container")
  .attr("width", 300)
  .attr("height", 300)
  .style("margin-left", "50px");

  annulusPrep();

  var currentHTML = controls.html();
  controls.html(currentHTML + "<button id='back'>Back to Controls</back>");
  document.getElementById("back").addEventListener("click", function(){
    controls.html(storeHTML);
    document.getElementById("sub").addEventListener("click", function(){addNewCategory()});
    document.getElementById("highlight").addEventListener("click", function(){highlight()});
    document.getElementById("annulus").addEventListener("click", function(){displayAnnulus()});
    d3.select("#control_container").append("svg")
    .attr("id", "svg_control_container");
  });
}

function annulusPrep() {
    var max = jsonDB.length;
    jsonDB.sort(function(a, b) {
      if (a.placement > b.placement) return 1;
      if (a.placement < b.placement) return -1;
      return 0;
    })
    for (var i = 0; i < jsonDB.length; i++) {
        drawRing(i + 1, jsonDB[i].color, max);
      }
}

function drawRing(order, color, max) {
  // calculate desired radius based on order in sequence - earlier rings get larger radii
  var radius = (max * 10 + 10) - 10 * order;
  var opacity = order / max;
  var circleName = "circle" + order;
  var animationDelay = .1 * order;
  var animationTime = .1 * max;

  var animationName = "animateSize" + order;
  // a hack of sorts - inserts a unique animation into <style> tag at header for each size circle.
  // alternative which i couldn't get to work: insert rules into stylesheet (@keyframes doesnt behave well with this)
  var new_rule = "\
  @keyframes " + animationName + "{0% {r: 0px;} 100% {r: " + radius + "px;}}\
  ";
  var rule_with_opacity = "\
  @keyframes " + animationName + "{0% {r: 0px; opacity: 1} 5% {r: 10px} 100% {r: " + radius + "px; opacity: " + opacity + "}}\
  ";

  var current_animations = d3.select("#animation").text();

  //adds the new animation rule for the new circle
  d3.select("#animation").text(current_animations + rule_with_opacity);
  //draw a circle
  reader_svg.append("circle")
      .attr("id", circleName)
      .attr("cx", 150)
      .attr("cy", 150)
      .attr("r", radius)
      .style("opacity", 0)
      .style("fill", color)
      .attr("stroke", "#b3ffb3")
      .style("animation", animationName + " " + animationTime + "s cubic-bezier(.2,.63,.66,.94) 1")
      .style("animation-fill-mode", "forwards")
      .style("animation-delay", animationDelay + "s");
}
