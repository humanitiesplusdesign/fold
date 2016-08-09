/* To do:
Get parsing and ToC working decently well
Create setting page
Create the hovering color selection div


*/
(function () {
const heirarchy = {
  "tree": [],
  "annulusArray": [],
  "categories": d3.map(),
  "title": "Project 1"
}

let svg_width = 400;
let reader_svg;
let grid_svg = "";
let colorMap = d3.map();
// for storing data to generate annulus rings later
let annulusArray = [];
let currentCircleArray = [];

initializeReader();

/*
*  Initializes the entire application
*/
function initializeReader() {
  $("#submit").click(function(event) {
    if (d3.select("#fileupload").property("value") == "") {
          $('#fileupload2').click();
    } else {
      parseTextHelper(d3.select("#fileupload").property("value"));
      displayTable();
    }
  })
  //reads the file uploaded and displays to the left
  window.onload = function() {
    let fileupload = document.getElementById('fileupload2');
      fileupload.addEventListener('change', function(e) {
        let file = fileupload.files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            result = reader.result;
            parseTextHelper(result);
            displayTable();
        }
        reader.readAsText(file);
      });
    }
}

/*
* Helper for recursive table function
*/
  function traverseAndUpdateTableHelper() {
    d3.select("#tableOfContents").html("");

    d3.select("#tableOfContents").append("div")
      .html("<h1>TABLE OF CONTENTS</h1>");

    d3.select("#tableOfContents").append("div")
      .html("<h2>Project Title: " + heirarchy.title + "</h2>");

    d3.select("#tableOfContents").append("div")
      .attr("id", "table");

    let currentTable = d3.select("#table");
      traverseAndUpdateTable(currentTable, heirarchy.tree[0].sections);
  }

  /*
  * Traverses the table and creates headers for each section of the text
  */
  function traverseAndUpdateTable(table, arrayOfSections) {
    for (let i = 0; i < arrayOfSections.length; i++) {
      let id = arrayOfSections[i].id;
      let level = arrayOfSections[i].level;
      // if the section is unnamed, simply give it its id as a name

      let name = (arrayOfSections[i].name == "") ? id : arrayOfSections[i].name;
      table.append("div")
        .attr("id", id)
        .style("margin-left", (level - 1) * 40 + "px")
        .html("<h" + level + " id='" + id + "'>" + id + " " +   name+ "</h" + level + ">")
        .on("click", function() {
          prepareText(id);
          displayOnly("#text_container");
        });
      traverseAndUpdateTable(table, arrayOfSections[i].sections);
    }
  }

/*
* Helper for recursive parse function
*/
function parseTextHelper(result) {
   let header = "#";
   heirarchy.tree.push({
     "name": "",
     "text": result,
     "id": "Part",
     "sections": [],
     "level": 0,
     "header": header,
   })
   parseText(header, heirarchy.tree[0]);
   console.log(heirarchy.tree[0]);
}

/*
* Parses input text for markdown headers and creates sections based on these
*/
function parseText(header, section) {
  let textArray = [];
  let indexArray = [];
  //get indexes of text breaks into sections based on header
  for (let i = 0; i < section.text.length; i++) {
    if (section.text.substr(i, header.length) == header && section.text.charAt(i + header.length) != "#" && section.text.charAt(i - 1) != "#" ) {
        indexArray.push(i);
      }
  }
  //get name if there is one after the header, break text, push into array
  for (let i = 0; i < indexArray.length; i++) {
    let pos = indexArray[i] + header.length;
    let name = "";
    for (let j = pos; j < section.text.length; j++) {
      if (section.text.charAt(j) == "\n") {
        break;
      }
      name += section.text.charAt(j);
    }
    let end = 0;
    if (i == indexArray.length - 1) {
      end = section.text.length;
    } else {
      end = indexArray[i + 1];
    }
    textArray.push({"name": name, "text": section.text.substring(pos, end)});
  }

  if (textArray.length > 0) {
    for (let i = 0; i < textArray.length; i++) {
        section.sections.push({
          "name": textArray[i].name,
          "id": section.id + "." + i,
          "text": textArray[i].text,
          "sections": [],
          "level": section.level + 1,
          "header":  header + "#"
        });
    }
    //recursively call on each section
    for (let i = 0; i < section.sections.length; i++) {
      parseText(section.sections[i].header, section.sections[i]);
    }
  }

}

// does exactly that
function prepareText(section) {
  let result = heirarchy.tree[0].sections[section.split(".")[1]].text;
  d3.select("#text_container")
        .html(result);
}


function iconEventListeners() {
  $('#toggle-text_container').on("click", function() {
    displayOnly("#text_container");
    // make sure to choose only approopriate partition
  });
  $('#toggle-annotate').on("click", function() {
    displayOnly("#settings");
    //display other stuff
  });
  $('#toggle-tableOfContents').on("click", function() {
    displayOnly("#tableOfContents");
  });
  $('#toggle-compare').on("click", function() {
    //displayOnly("#compare");
  });
  $('#toggle-settings').on("click", function() {
    displayOnly("#settings");
  });
}

function displayOnly(selection) {
  d3.select("#intro").style("display", "none");
  d3.select("#text_container").style("display", "none");
  d3.select("#settings").style("display", "none");
  // add in everything that needs to be hidden
  d3.select("#tableOfContents").style("display", "none");

  d3.selectAll("i").style("color", "gray");

  d3.select(selection).style("display", "block");
  d3.select("#toggle-" + selection.substring(1)).style("color", "black");


}

function displayTable() {
  displayOnly("#tableOfContents");
  traverseAndUpdateTableHelper();
  prepareText(heirarchy.tree[0].sections[0].id);
  iconEventListeners();
}

function continueToSections() {
  partitioning = false;
  d3.select("#instructions1").style("display", "none");
  d3.select("#instructions2").style("display", "none");
  d3.select("#instructions2-5").style("display", "block");
  partitionListeners();

  if (!document.getElementById("text-div-0-section-0")) {
    d3.select("#text-div-" + 0).html("").append("div")
      .attr("id", "text-div-" + 0 + "-section-" + 0)
      .attr("class", "section")
      .html(heirarchy.tree[0].sections[0].text);
  }
}



function continueToHighlighting() {
  newInstructions();
  $("body").on("keydown", function() {
    if (event.which === 17) {
      //testing
      console.log(heirarchy.tree);
    }
  })
}

// sets up highlighting abilities and category/color selection
function newInstructions() {
  d3.select("#instructions2-5").style("display", "none");
  d3.select("#instructions3").style("display", "block");

  activeSection = heirarchy.tree[0].sections[0];
  displayThisSection(0,0);

  highlightEventListeners();
  annulusDisplayListeners();

  updateTable();

  d3.select("#control_container").append("svg")
  .attr("id", "svg_control_container");
}

function annulusDisplayListeners() {
  document.getElementById("back").addEventListener("click", function() {
    d3.select("#annulus-display").style("display", "none");
    d3.select("#instructions3").style("display", "block");
    d3.select("#svg_control_container").style("display", "block");
    reader_svg.remove();
  });
  document.getElementById("save").addEventListener("click", function() {
      d3.select("#saveform").style("opacity", 1);
      let name = d3.select("#save_name").property("value");
      let newName = true;
      for (let i = 0; i < annulusArray.length; i++) {
        if (annulusArray[i].name === name) newName = false;
      }
      if (name != "" && newName === true) {
          saveAnnulus(name);
          d3.select("#saveform").style("opacity", 0);
          $("#save").prop("disabled", true);
        };
  });
  document.getElementById("grid").addEventListener("click", function () {gridView()})
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
        if (e.keyCode == 49 && heirarchy.categories.size() > 0) {
          $("#check_" + 1).prop("checked", true);
          highlight();
        }
        if (e.keyCode == 50 && heirarchy.categories.size() > 1) {
          $("#check_" + 2).prop("checked", true);
          highlight();
        }
        if (e.keyCode == 51 && heirarchy.categories.size() > 2) {
          $("#check_" + 3).prop("checked", true);
          highlight();
        }
    }
  }
}

// adds a new category with corresponding color for highlighting
function addNewCategoryToSection(section) {
  let colorH = d3.select("#colorH").property("value");
  let categoryH = d3.select("#categoryH").property("value");

  heirarchy.categories.set(categoryH, colorH);
  showCategoriesOfSection(section);
}

function showCategoriesOfSection(section) {
  d3.select("#current_colors").html("");
  d3.select("#svg_control_container").html("");

  let controlsHTML = "";
  let position = 15;
  let index = 1;
  heirarchy.categories.forEach(function (key, value) {
    let thisControl = "<p id=" + key + ">" + key + "<input type='radio' name='color' id=check_" + index + " value=" + key + ">" + "</p>";
    controlsHTML += thisControl;
    d3.select("#current_colors").html(controlsHTML);
    d3.select("#svg_control_container").append("circle")
      .attr("id", value + key)
      .attr("fill", value)
      .attr("r", 10)
      .attr("cx", 20)
      .attr("cy", position)
      .on("click", function() {
        heirarchy.categories.remove(key);
        for (let i = 0; i < heirarchy.tree.length; i++) {
          for (let j = 0; j < heirarchy.tree[i].sections.length; j++) {
            deleteCategoryOfSection(heirarchy.tree[i].sections[j], key);
          }
        }

        //removes highlights of this color
        let spans = d3.selectAll("span");
        spans.each(function (d,i) {
          if (this.style.backgroundColor == value) $("#" + this.id).contents().unwrap();
        })

        showCategoriesOfSection(section);
        updateTable();
      });
    position += 60;
    index += 1;
  });
}

function deleteCategoryOfSection(section, category) {
    for (let i = 0; i < 2; i++) {
      let spliceCount = 0;
      for (let j = 0; j < section.segments.length; j++) {
        if (section.segments[j - spliceCount].category ==  category) {
          section.segments.splice(j - spliceCount, 1);
          spliceCount++;
        }
      }
    }
}

function highlight() {
  let category = $('input[name=color]:checked').val();
  let color = heirarchy.categories.get($('input[name=color]:checked').val());

    // get the selected text, put a span with appropriate id around it
    let sel = window.getSelection();
    let selText = sel.toString();
    let range = sel.getRangeAt(0);
    let newNode = document.createElement("span");
    let spanID = color + category + current_index;
    newNode.setAttribute('id', spanID);
    newNode.setAttribute('style', "background-color: " + color);
    newNode.setAttribute('class', "highlightSpan");
    range.surroundContents(newNode);

    oRange = sel.getRangeAt(0); //get the text range
    oRect = oRange.getBoundingClientRect();

    let placement = oRect.top + window.scrollY;
    let this_index = current_index;

    document.getElementById(spanID).addEventListener("click", function(){
      removeThisHighlight(this_index, spanID);});
    // update the array for building rings
    let segment = {
        "index": current_index,
        "text":  selText, //contents of line-height
        "category": category, //used to determine colors
        "color": color, /// unecessary but makes things easier
        "placement": placement,
        "comment": "",
      };
    current_index += 1;

    activeSection.segments.push(segment);
    annulusPrepForSection(activeSection);
    updateTable();
}

// to be finished - based on topic (?)
function separateIntoColumns() {
  d3.select("#text_container").html("");
  let top = 0;
  for (let i = 0; i < jsonDB.length; i++) {
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
    $("#" + spanID).contents().unwrap();
    for (let i = 0; i < activeSection.segments.length; i++) {
        if (activeSection.segments[i].index == number) {
          activeSection.segments.splice(i, 1);
        }
    }
    updateTable();
}

function displayAnnulus() {
  d3.select("#instructions3").style("display", "none");
  d3.select("#svg_control_container").style("display", "none");
  d3.select("#annulus-display").style("display", "block");
  d3.select("#animation").text("");

  reader_svg = d3.select("#appendhere").append("svg")
  .attr("id", "svg_container")
  .attr("width", 400)
  .attr("height", 400)
  .style("margin-left", "50px");

  //draw the annulus
  annulusPrepForSection(activeSection);
  drawAnnulusOfSection(activeSection);

  // add event listener which displays the highlighted text under the rings when the specific ring is clicked on
  d3.selectAll("circle").on("mousedown", function(d,i) {
    let index = this.id.substring(6, 8);
    if (isNaN(index)) {index = +index.charAt(0);}
    index = +index - 1;
    let text = activeSection.segments[i].text;
    if (text.length > 85) {
      text = text.substring(0, 85) + "..."
    }
    d3.select("#circle_hover").html(activeSection.segments[i].category + " - " + "<span style='background-color: " + activeSection.segments[i].color + ";'>" + text + "</span>");
  });

}

//order the segment entries in section based on appearance order in text
function annulusPrepForSection(section) {
      section.segments.sort(function(a, b) {
        if (a.placement > b.placement) return 1;
        if (a.placement < b.placement) return -1;
        return 0;
      })
}

function drawAnnulusOfSection(section) {
  currentCircleArray = [];
  let max_radius = svg_width / 2 - 10;
  let center = svg_width / 2;
  for (let i = 0; i < section.segments.length; i++) {
      //draw the ring
      drawRing(i + 1, section.segments[i].color, section.segments.length, section.segments[i].category, section.segments[i].text, max_radius, "current", center);
      let ring = {
                    "order": i + 1,
                    "color": section.segments[i].color,
                    "category": section.segments[i].category
                    };
      //add to list of current circles in case the annulus needs to be saved
      currentCircleArray.push(ring);
    }
}

//does exactly that
function drawRing(order, color, max, circleCategory, circleText, max_radius, name, center) {
  // calculate desired radius based on order in sequence - earlier rings get larger radii
  let start_radius = 50 / max;
  let increment = (max_radius - start_radius) / max;
  let radius = max_radius - increment * order;
  let opacity = order / max;
  let circleName = "circle" + order + name;
  let animationDelay = .1 * order;
  let animationTime = .25 * max;

  let animationName = "animateSize" + circleName;
  // a hack of sorts - inserts a unique animation into <style> tag at header for each size circle.
  // alternative which i couldn't get to work: insert rules into stylesheet (@keyframes doesnt behave well with this)
  let new_rule = "\
  @keyframes " + animationName + "{0% {r: 0px;} 100% {r: " + radius + "px;}}\
  ";
  let rule_with_opacity = "\
  @keyframes " + animationName + "{0% {r: 0px; opacity: 1} 5% {r: 10px} 100% {r: " + radius + "px; opacity: " + opacity + "}}\
  ";
  let current_animations = d3.select("#animation").text();
  //adds the new animation rule for the new circle
  d3.select("#animation").text(current_animations + rule_with_opacity);
  //draw a circle
  let current_svg;
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
  let currentIndex = annulusArray.length;
  let annulus = new Annulus(currentCircleArray, name, currentIndex);
  annulusArray.push(annulus);
  heirarchy.annulusArray.push(annulus);
}

function recreateAnnulus(center) {
  for (let i = 0; i < this.max; i++) {
    let order = this.circleArray[i].order;
    let color = this.circleArray[i].color;
    let max = this.max;
    let circleCategory = this.circleArray[i].category;
    let name = this.name;
    let max_radius = 200;

    drawRing(order, color, max, circleCategory, name, max_radius, name, center);
  }
}

function gridView() {
  let body = d3.select("#text_container");
  let storeHTML = body.html();
  body.html("");
  d3.select("#control_container").style("border-left", "none");
  d3.select("#svg_container").html("");

  let numAnnulus = annulusArray.length;
  let width;
  let height;

  width = 500;
  height = 500;

  grid_svg = body.append("svg")
    .attr("id", "grid_svg")
    .attr("width", "1000%")
    .attr("height", "550px");

  let center = width / 2;

  for (let i = 0; i < heirarchy.annulusArray.length; i++) {
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

  function setupBlinkCursor() {
      blinkCursor = d3.select("#text_container").append("span")
        .attr("id", "blink")
        .text("|")
        .style("visibility", "hidden")
        .style("position", "absolute");
  }



  /////
/*
  createLinearVisualization(part) {
    d3.select("#linvis").html("");
    let rectArray = getRectanglesHelper(part);

  }

  getRectanglesHelper(part) {
    let rectArray = [];
  }

  getRectanglesOf() {

  }
*/


})();
