var exampleheirarchy = {
  "tree": [
    // sections = heirarchy[i].sections
    // partition name = heirarchy[i].id
      {"id": "",
      "text": "",
      "sections": [
        {
          "topic": "topic1",
          "text": "",
          "segments": []
        },
        {
          "topic": "topic2",
          "text": "",
          "segments": []
        }
      ],
    }
    //new partition would start here
  ],
  "circleArray": []
}
var heirarchy = {
  "tree": [
  //  {"id": "",
  //  "text": "",
  //  "sections": [
  //    {
  //      "topic": "",
  //      "text": "",
  //      "segments": []
  //      },
  //    ]
//    }
  ],
  "circleArray": []
}

var result;
var svg_width = 400;
var reader_svg;
var grid_svg = "";
var colorMap = d3.map();
var current_category = {
    "number": 1,
    "category": "conservative",
    "color": "red"
  };
var current_index = 1;
// for storing data to generate annulus rings later
var jsonDB = [];
var annulusArray = [];
var currentCircleArray = [];
var dblReturnNext = false;
var partitioning = true;
var currentPartition = "";
var activeSection = "";

document.getElementById("continueToSections").addEventListener("click", function(){continueToSections()});
document.getElementById("continueToHighlighting").addEventListener("click", function(){continueToHighlighting()});
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

function updateHeirarchyDisplay() {
    d3.select("#tableOfContents").html("");
    appendTable();
    //d3.select("#tableOfContents").html(table);
    //createTableEventListeners();
}

function appendTable() {
    var currentTable = d3.select("#tableOfContents")
    var currentLength = heirarchy.tree.length;
    for (var i = 0; i < currentLength; i++) {
      var id = heirarchy.tree[i].id;
      if (id == "") {
        id = "Part" + (i + 1) ;
      heirarchy.tree[i].id = id;
      }

      currentTable.append("div")
        .attr("id", "partition" + i)
        .html("<h1 id='" + id + "'>" + id + "</h1>");

          (function() {
            var i1 = i;
              document.getElementById(id).addEventListener("click", function(){
                console.log(i1)
                displayThisPartition(i1);
              });
          })();
      for (var j = 0; j < heirarchy.tree[i].sections.length; j++) {
        var topic = (heirarchy.tree[i].sections.topic == "") ? heirarchy.tree[i].sections.topic : "Section" + (j + 1);

        d3.select("#" + "partition" + i).append("div")
          .attr("id", id + topic + j)
          .html("<h2>" + topic + "</h2>");

          (function() {
            var i1 = i;
            var j1 = j;
              document.getElementById(id + topic + j).addEventListener("click", function(){
                displayThisSection(i1, j1);
              });
              document.getElementById(id + topic + j).addEventListener("mouseenter", function(){
                d3.select("#text-div-" + i + "-section-" + j).style("font-weight", "bold")
              });
              document.getElementById(id + topic + j).addEventListener("mouseout", function(){
                d3.select("#text-div-" + i + "-section-" + j).style("font-weight", "normal")
              });
          })();

          for (var k = 0; k < heirarchy.tree[i].sections[j].segments.length; k++) {
            d3.select("#" + id + topic + j).append("div")
              .text(heirarchy.tree[i].sections[j].segments[k].text)
              .style("color", heirarchy.tree[i].sections[j].segments[k].color)
              .style("font-size", "10px")
              .style("margin", "1px");
          }

      }
    }

}

function displayThisSection(i, j) {
    d3.selectAll(".section").style("display", "none");
    d3.select("#text-div-" + i + "-section-" + j).style("display", "block");
    activeSection = heirarchy.tree[i].sections[j];
    showCategoriesOfSection(activeSection);
}

function displayThisPartition(i) {
    d3.selectAll(".section").style("display", "none");
    for (var j = 0; j < heirarchy.tree[i].sections.length; j++) {
      d3.select("#text-div-" + i + "-section-" + j).style("display", "block");
    }
    console.log("showing all of " + i);
}

//based off of http://jsfiddle.net/TjXEG/1/
function getCaretPos(element) {
  var caretPos = 0;
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretPos = preCaretRange.toString().length;
  return caretPos
}

function createPartition(caretPos) {
  var currentLength = heirarchy.tree.length;
  for (var i = 0; i < currentLength; i++) {
    if (i != 0) caretPos -= heirarchy.tree[i - 1].text.length;
  }
  heirarchy.tree.push({
    "id": "",
    "text": heirarchy.tree[currentLength - 1].text.substring(caretPos, heirarchy.tree[currentLength - 1].text.length),
    "sections": [
      {
        "topic": "",
        "text": heirarchy.tree[currentLength - 1].text.substring(caretPos, heirarchy.tree[currentLength - 1].text.length),
        "segments": [],
        "categories": d3.map()
      }
      ]
    });
  heirarchy.tree[currentLength - 1].text = heirarchy.tree[currentLength - 1].text.substring(0, caretPos);
  heirarchy.tree[currentLength - 1].sections[0].text = heirarchy.tree[currentLength - 1].text;
}

function createSection(caretPos, element) {
  var i = +element.id.split("-")[2];
  var currentSectionsLength = heirarchy.tree[i].sections.length;

  for (var j = 0; j < i; j++) {
      caretPos -= heirarchy.tree[j].text.length;
  }

  for (var j = 0; j < currentSectionsLength - 1; j++) {
      caretPos -= heirarchy.tree[i].sections[j].text.length;
  }

  var lastSection = heirarchy.tree[i].sections[currentSectionsLength - 1];

  heirarchy.tree[i].sections.push(
    {
      "topic": "",
      "text": lastSection.text.substring(caretPos),
      "segments": [],
      "categories": d3.map()
    }
  );
  lastSection.text = lastSection.text.substring(0, caretPos);
  }



function encodeForWord(text) {
    return decodeURIComponent(encodeURIComponent(text));
}

// does exactly that
function displayText(result) {
      d3.select("#control_container_before").attr("id", "control_container");
      d3.select("#text_container_before").attr("id", "text_container");

      d3.select("#text_container").html(result).style("opacity", 1).style("contenteditable", "true");
      d3.select("#instructions1").style("display", "none");
      d3.select("#instructions2").style("display", "block");
      returnEventListener();
      heirarchy.tree.push({
        "id": "",
        "text": result,
        "sections": [
            {
              "topic": "",
              "text": "result",
              "segments": [],
              "categories": d3.map()
            }
          ]
      })
}

function continueToSections() {
  partitioning = false;
  d3.select("#instructions1").style("display", "none");
  d3.select("#instructions2").style("display", "none");
  d3.select("#instructions2-5").style("display", "block");
  partitionListeners();

}

function partitionListeners() {
  for (var i = 0; i < heirarchy.tree.length; i++) {
    document.getElementById("text-div-" + i).removeEventListener("click", function() {
      currentPartition = this;
    });
    document.getElementById("text-div-" + i).addEventListener("click", function() {
      currentPartition = this;
    });
  }
}

function continueToHighlighting() {
  newInstructions();
  $("body").off();
  $("body").on("keydown", function() {
    if (event.which === 17) {
      console.log(heirarchy.tree);
    }
  })
}

// sets up highlighting abilities and category/color selection
function newInstructions() {
  d3.select("#instructions2-5").style("display", "none");
  d3.select("#instructions3").style("display", "block");

  highlightEventListeners();

  d3.select("#control_container").append("svg")
  .attr("id", "svg_control_container");
}


function returnEventListener() {
  $("body").on("keydown", function(e){
    if (e.which == 16) {
      console.log(heirarchy.tree);
    }
    // partitions
    if (partitioning) {
      if (e.which == 13 && !dblReturnNext) {
          dblReturnNext = true;
      } else if (e.which == 13 && dblReturnNext) {
        // create the partition
          var caretpos = getCaretPos(document.getElementById("text_container"));
          createPartition(caretpos);
          dblReturnNext = false;
          updateHeirarchyDisplay();
          d3.select("#text_container").html("")

          // create separate divs for each partition
          for (var i = 0; i < heirarchy.tree.length; i++) {
            d3.select("#text_container").append("div")
              .attr("id", "text-div-" + i)
              .attr("class", "partition")
              .html(heirarchy.tree[i].text);
          }
      }
    } else {

      if (e.which == 13 && !dblReturnNext) {
          //displayDblReturnNote();
          dblReturnNext = true;
        } else if (e.which == 13 && dblReturnNext) {
            dblReturnNext = false;
            var caretpos = getCaretPos(document.getElementById("text_container"));
            createSection(caretpos, currentPartition);
            updateHeirarchyDisplay();
            d3.select("#text_container").html("")

            //use data from heirarchy to add divs containing divs, representing partitions and sections
            for (var i = 0; i < heirarchy.tree.length; i++) {
              d3.select("#text_container").append("div")
                .attr("id", "text-div-" + i)
                .attr("class", "partition");


                for (var j = 0; j < heirarchy.tree[i].sections.length; j++) {
                    d3.select("#text-div-" + i).append("div")
                      .attr("id", "text-div-" + i + "-section-" + j)
                      .attr("class", "section")
                      .html(heirarchy.tree[i].sections[j].text);
                }

            }
            partitionListeners();
        }
    }
    });
  }



//only call when these buttons exist
function highlightEventListeners() {
  document.getElementById("sub").addEventListener("click", function(){addNewCategoryToSection(activeSection)});
  document.getElementById("highlight").addEventListener("click", function(){highlight()});
  document.getElementById("annulus").addEventListener("click", function(){
    displayAnnulus();
  //separateIntoColumns();
  });
  document.body.onkeyup = function(e){
    if (window.getSelection().toString() != "") {
        if (e.keyCode == 49) {
          $("#check_" + 1).prop("checked", true);
          highlight();
        }
        if (e.keyCode == 50) {
          $("#check_" + 2).prop("checked", true);
          highlight();
        }
        if (e.keyCode == 51) {
          $("#check_" + 3).prop("checked", true);
          highlight();
        }
    }
  }
}

// adds a new category with corresponding color for highlighting
function addNewCategoryToSection(section) {
  var colorH = d3.select("#colorH").property("value");
  var categoryH = d3.select("#categoryH").property("value");

  section.categories.set(categoryH, colorH);
  showCategoriesOfSection(section);
}

function showCategoriesOfSection(section) {
  d3.select("#current_colors").html("");
  d3.select("#svg_control_container").html("");
  if (section === "") {
    console.log("no active section");
    return;
  }
  var controlsHTML = "";
  var position = 15;
  var index = 1;
  section.categories.forEach(function (key, value) {
    var thisControl = "<p id=" + key + ">" + key + "<input type='radio' name='color' id=check_" + index + " value=" + key + ">" + "</p>";
    controlsHTML += thisControl;
    d3.select("#current_colors").html(controlsHTML);
    d3.select("#svg_control_container").append("circle")
      .attr("id", value + key)
      .attr("fill", value)
      .attr("r", 10)
      .attr("cx", 20)
      .attr("cy", position)
      .on("click", function() {
          deleteCategoryOfSection(section, key);
      });
    position += 60;
    index += 1;
  });
}

//to do
function deleteCategoryOfSection(section, category) {
    section.categories.remove(category);
    for (var i = 0; i < 2; i++) {
      var spliceCount = 0;
      for (var j = 0; j < section.segments.length; j++) {
        if (section.segments[j - spliceCount].category ==  category) {
          section.segments.splice(j - spliceCount, 1);
          spliceCount++;
        }
      }
    }
    showCategoriesOfSection(section);
    updateHeirarchyDisplay();
}

function highlight() {
  // update the category and color used for highlighting rn
  current_category.category = $('input[name=color]:checked').val();
  current_category.color = activeSection.categories.get($('input[name=color]:checked').val());

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
    var this_index = current_index;

    document.getElementById(spanID).addEventListener("click", function(){
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

    activeSection.segments.push(segment);
    updateHeirarchyDisplay();
}

function separateIntoColumns() {
  d3.select("#text_container").html("");
  var top = 0;
  for (var i = 0; i < jsonDB.length; i++) {
    d3.select("#text_container").append("div")
      .attr("id", "column_text_" + i)
      .style("position", "absolute")
      .style("top", function () {
        if (top === 0) return jsonDB[i].placement + "px";
        return (top - 5) + "px";
      })
      .style("left", function() {
        if (i % 2 === 0) {
          return "200px";
        } else {
          return "505px";
        }
      })
      .html(jsonDB[i].text)
      .style("width", "295px")
      .style("border-left", "1px solid " + jsonDB[i].color);

      top = document.getElementById("column_text_" + i).getBoundingClientRect().bottom;
  }

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

    for (var i = 0; i < activeSection.segments.length; i++) {
        if ($("#" + spanID).contents() == activeSection.segments[i].text) {
          activeSection.segments.splice(i, 1);
        }
    }
    updateHeirarchyDisplay();
}

//to do: remove .html, turn into
function displayAnnulus() {
  var controls = d3.select("#control_container");
  var storeHTML = controls.html();

  controls.html("");

  reader_svg = controls.append("svg")
  .attr("id", "svg_container")
  .attr("width", 400)
  .attr("height", 400)
  .style("margin-left", "50px");

  //draw the annulus
  annulusPrep();
  drawAnnulus();

  var currentHTML = controls.html();
  controls.html(currentHTML + "<div id='circle_hover'>Click on a ring to see the highlighted text.</div>" + "<button id='back'>Back to Controls</button>" + "<button id='save'>Save Annulus</button>" + "<button id='grid'>View Saved</button>" + "<form id='saveform'>To save, enter a name. Please choose only letters and numbers (no spaces): <input type='text' id='save_name' /></form>");

  // add event listener which displays the highlighted text under the rings when the specific ring is clicked on
  d3.selectAll("circle").on("mousedown", function(d,i) {
    var index = this.id.substring(6, 8);
    if (isNaN(index)) {index = +index.charAt(0);}
    index = +index - 1;
    var text = jsonDB[i].text;
    if (text.length > 85) {
      text = text.substring(0, 85) + "..."
    }
    d3.select("#circle_hover").html(jsonDB[i].category + " - " + "<span style='background-color: " + jsonDB[i].color + ";'>" + text + "</span>");
  });
  document.getElementById("back").addEventListener("click", function() {
    //back button resets html to newisntructions and re-adds event listeners
    controls.html(storeHTML);
    highlightEventListeners();
    showCategoriesOfSection(activeSection);
  });
  document.getElementById("save").addEventListener("click", function() {
      d3.select("#saveform").style("opacity", 1);
      var name = d3.select("#save_name").property("value");
      var newName = true;
      for (var i = 0; i < annulusArray.length; i++) {
        if (annulusArray[i].name === name) newName = false;
      }
      if (name != "" && newName === true) {
          saveAnnulus(name);
          d3.select("#saveform").style("opacity", 0);
          $("#save").prop("disabled", true);
        };
  });
  document.getElementById("grid").addEventListener("click", function () {gridView()});
}

//order the entries in jsonDB based on appearance order in text
function annulusPrep() {
    jsonDB.sort(function(a, b) {
      if (a.placement > b.placement) return 1;
      if (a.placement < b.placement) return -1;
      return 0;
    })
}

//does exactly that
function drawAnnulus() {
  currentCircleArray = [];
  var max_radius = svg_width / 2 - 10;
  var center = svg_width / 2;
  for (var i = 0; i < jsonDB.length; i++) {
      //draw the ring
      drawRing(i + 1, jsonDB[i].color, jsonDB.length, jsonDB[i].category, jsonDB[i].text, max_radius, "current", center);
      var ring = {
                    "order": i + 1,
                    "color": jsonDB[i].color,
                    "category": jsonDB[i].category
                    };
      //add to list of current circles in case the annulus needs to be saved
      currentCircleArray.push(ring);

    }
}

//does exactly that
function drawRing(order, color, max, circleCategory, circleText, max_radius, name, center) {
  // calculate desired radius based on order in sequence - earlier rings get larger radii
  var start_radius = 50 / max;
  var increment = (max_radius - start_radius) / max;
  var radius = max_radius - increment * order;
  var opacity = order / max;
  var circleName = "circle" + order + name;
  var animationDelay = .1 * order;
  var animationTime = .25 * max;

  var animationName = "animateSize" + circleName;
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
  var current_svg;
  if (grid_svg != "") {
      current_svg = grid_svg;
    } else {
      current_svg = reader_svg;
    }

  current_svg.append("circle")
      .attr("id", circleName)
      .attr("class", "svgcircle")
      .attr("cx", center)
      .attr("cy", 200)
      .attr("r", radius)
      .style("opacity", 0)
      .style("fill", color)
      .attr("stroke", "#b3ffb3")
      .style("animation", animationName + " " + animationTime + "s cubic-bezier(.2,.63,.66,.94) 1")
      .style("animation-fill-mode", "forwards")
      .style("animation-delay", animationDelay + "s");
}

// ring object: json file of array, category, color, with length of array as max and
function Annulus(circleArray, name, index) {
  this.circleArray = circleArray;
  //circleArray = array of objects, each object is a circle containing color, category, and order;
  this.max = circleArray.length;
  this.draw = recreateAnnulus;
  this.name = name;
  this.index = index;
}

function saveAnnulus(name) {
  var currentIndex = annulusArray.length;
  var annulus = new Annulus(currentCircleArray, name, currentIndex);
  annulusArray.push(annulus);
}

function recreateAnnulus(center) {
  for (var i = 0; i < this.max; i++) {
    var order = this.circleArray[i].order;
    var color = this.circleArray[i].color;
    var max = this.max;
    var circleCategory = this.circleArray[i].category;
    var name = this.name;
    var max_radius = 200;

    drawRing(order, color, max, circleCategory, name, max_radius, name, center);
  }
}

function gridView() {
  var body = d3.select("#text_container");
  var storeHTML = body.html();
  body.html("");
  d3.select("#control_container").style("border-left", "none");
  d3.select("#svg_container").html("");

  var numAnnulus = annulusArray.length;
  var width;
  var height;

  width = 500;
  height = 500;

  grid_svg = body.append("svg")
    .attr("id", "grid_svg")
    .attr("width", "1000%")
    .attr("height", "550px");

  var center = width / 2;

  for (var i = 0; i < annulusArray.length; i++) {
      annulusArray[i].draw(center);
      grid_svg.append("text")
      .html(annulusArray[i].name)
      .attr("x", center - width / 4)
      .attr("y", 350)
      .attr("class", "annulusName");
      center += width / 1.2;
  }

  body.append("div")
  .html("<button id='back'>Back</button>");

  document.getElementById("back").addEventListener("click", function() {
        body.html(storeHTML);
        d3.select("#control_container").style("border-left", "1px solid #5cd65c");
      });
}
