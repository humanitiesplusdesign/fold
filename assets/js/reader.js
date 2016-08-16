/* To do:
  1 get annotations functional
  2 implement tone highlighting
      2.1 paragraph separation by tone
  3 side graphic based on tone


  how to detect if span overlaps =
      count number of <span> and number of </span> in selected text
      if the counts are not identical, throw an error
      otherwise, fine

      one solution -
      instead of throw an error, remove the first <span> and insert a </span> before the selection (or vice versa in the case of ending chopping off)
  4(?) grid view which can alternate between linear and annulus visualizations



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
let highlight_tip;
let topic_tip;
let toneMap = d3.map();
let topicMap = d3.map();
let numTopics = 0;
let numTones = 0;
let current_range;
let activePart = 1;

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
          activePart = id.split(".")[1];
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
          "header":  header + "#",
          "data": {
            "annotations": [],
              /*
              {
              "text"
              "start"
              "end"
              }
              */
            "highlights": [],
            /*
            {
            "key"
            "text"
            "start"
            "end"
            }
            */
            "topics": []
            /*
            {
            "key"
            "text"
            "start"
            "end"
            }
            */
          }
        });
    }
    //recursively call on each section
    for (let i = 0; i < section.sections.length; i++) {
      parseText(section.sections[i].header, section.sections[i]);
    }
  }

}

/*
* Sets up the text view by creating separate divs for each h1 top level partition. By default, the first one is displayed.
*/
function prepareText(section) {
  for (let i = 0; i < heirarchy.tree[0].sections.length; i++) {
    d3.select("#text_container").append("div")
      .attr("id", "text-h1-" + i)
      .attr("class", "text-h1")
      .style("display", "none")
      .html(heirarchy.tree[0].sections[i].text);
  }
  d3.select("#text-h1-" + section.split(".")[1]).style("display", "block");

  refreshHighlightTip();
  setupTooltips();

}

/*
* Adds event listeners to the main five icons
*/
function iconEventListeners() {
  $('#toggle-text_container').on("click", function() {
    displayOnly("#text_container");
    refreshHighlightTip();
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

/*
* Adds event listeners to the add tone/topic buttons, to the fields, and to the save buttons.
*/
function settingsEventListeners() {
  // plus button adds a new topic and puts it in the map
  $('#add-topic').on("click", function() {
    if (numTopics < 3) {
      numTopics += 1;
      topicMap.set(numTopics, {"topic": "", "description": ""});

      if (numTopics === 3) {
        d3.select("#add-topic").style("display", "none");
      }
    }
    topicMap.forEach(function(key, value) {
      d3.select("#topic-input-" + key).style("display", "inline");
    });
    d3.select("#ignore").style('display', "block");

  });

  // plus button adds a new tone and adds it to the map
  $('#add-tone').on("click", function() {
    if (numTones < 4) {
      numTones += 1;
      toneMap.set(numTones, {"tone": "", "description": "", "color": "", "number": ""});
      if (numTones === 4) {
        d3.select("#add-tone").style("display", "none");
      }
    }

    toneMap.forEach(function(key, value) {
      d3.select("#tone-input-" + key).style("display", "inline");
    });
  });

  // adds listeners to each of the save buttons
  for (let i = 1; i < 5; i++) {
    if (i != 4) {
      $('#save-topic-' + i).on("click", function() {
        topicMap.set(i, {"topic": d3.select("#topic-term-" + i).property("change"), "description": d3.select("#topic-des-" + i).property("value")});
        d3.select(this).style("display", "none");
        console.log(topicMap.get(i));
      });
      $('#topic-term-' + i + ", #topic-des-" + i).on("keydown", function() {
        d3.select("#save-topic-" + i).style("display", "block");
      });
    }
    $('#save-tone-' + i).on("click", function() {
      if (toneMap.get(i).color != d3.select("#color-" + i).property("value")) {
        console.log("current_color is " +toneMap.get(i).color +" , new color should be "  + d3.select("#color-" + i).property("value"));
        let spans = d3.selectAll("span");
        d3.selectAll("span").each(function(d, j) {
          if ("#" + this.id.split("-")[0] == toneMap.get(i).color) {
            d3.select(this).style("background-color", d3.select("#color-" + i).property("value"));
          }
        });
      }
      toneMap.set(i, {"tone": d3.select("#tone-name-" + i).property("value"), "description": d3.select("#tone-des-" + i).property("value"), "color": d3.select("#color-" + i).property("value"), "number": "0"});
      d3.select(this).style("display", "none");
    });

    //makes save button visible whenever a field is changed
    $('#tone-name-' + i + ", #tone-des-" + i + ", #color-" + i).on("change", function() {
      d3.select("#save-tone-" + i).style("display", "block");
    });

  }
}

function refreshHighlightTip() {
  let tip = d3.select("#highlight_tip");
  tip.html("");
  tip.append("p").html("Apply a tone:");
  toneMap.forEach(function(key, value) {
    tip.append("div")
      .attr("class", "tip-color-container")
      .attr("id", "tip-color-container-" + key)
      .html(value.tone + ": " + "<i class='fa fa-paint-brush' aria-hidden='true' style='color: " + value.color +"!important;'></i>");

      $("#tip-color-container-" + key).on("click", function() {
        event.preventDefault();
        highlight(key);
      })
  });

  let tip2 = d3.select("#topic_tip");
  tip2.html("");
  topicMap.forEach(function(key, value) {
    tip2.append("div")
      .attr("class", "tip-topic-container")
      .attr("id", "tip-topic-container-" + key)
      .html(value.topic);

        $("#tip-color-container-" + key).on("click", function() {
          event.preventDefault();
          //applyTopic(key);
        })
  });
}



function setupTooltips() {

  $("#text_container").on("mouseup", function() {
    if (window.getSelection().toString().length > 1) {
      current_range = window.getSelection().getRangeAt(0);

      $("#text_container_left").css("background-color", "gray");

      $("#highlight_tip").css("display", "block")
        .css("top", event.pageY - 40)
        .css("left", event.pageX);
    } else {
      $("#highlight_tip").css("display", "none");
      $("#text_container_left").css("background-color", "white");
    }
  });

    $("#text_container_left").on("mouseover", function() {
      $("#topic_tip").css("display", "block")
        .css("top", event.pageY - 40)
        .css("left", event.pageX);
    });

    $("#text_container_right").on("click", function() {
      let top = event.pageY + $('body').scrollTop();
      createAnnotation(activePart, top);
    });
}


/*
* The write view displays only one h1 part at a time; this does that.
*/
function displayOnlyThisPart(part) {
  for (let i = 0; i < heirarchy.tree[0].sections.length; i++) {
    d3.select("#text-h1-" + i).style("display", "none");
    }
  d3.select("#text-h1-" + part).style("display", "block");
  d3.selectAll(".annotation").style("display", function() {
    console.log(activePart)
    console.log(d3.select(this).attr("id"));
    if (d3.select(this).attr("id").split("-")[1] == activePart) {
      return "block";
    } else {
      return "none";
    }
  })
}

/*
* Essentially switches between pages/views by setting all of the div displays to none and then toggling the desired view to block
*/
function displayOnly(selection) {
  d3.select("#intro").style("display", "none");
  d3.select("#text_container").style("display", "none");
  d3.select("#settings").style("display", "none");
  // add in everything that needs to be hidden
  d3.select("#tableOfContents").style("display", "none");

  d3.selectAll("i").style("color", "gray");

  d3.select(selection).style("display", "block");
  d3.select("#toggle-" + selection.substring(1)).style("color", "black");

  if (selection == "#text_container") {
    $("#text_container_right").css("height", $("#text_container").height());
    $("#text_container_left").css("height",  $("#text_container").height());
    $("#text_container_right").css("display", "block");
    $("#text_container_left").css("display", "block");
    displayOnlyThisPart(activePart);
  } else {
    $("#text_container_right").css("display", "none");
    $("#text_container_left").css("display", "none");
    d3.selectAll(".annotation").style("display", "none");
  }
}

/*
* Shows and creates the table based on the parsed document, prepares the text, and sets up event listeners
*/
function displayTable() {
  displayOnly("#tableOfContents");
  traverseAndUpdateTableHelper();
  prepareText(heirarchy.tree[0].sections[0].id);
  iconEventListeners();
  settingsEventListeners();
}

/*
* Applies the selected color to the selected text
*/
function highlight(key) {
    let category = toneMap.get(key).tone;
    let desc = toneMap.get(key).description;
    let color = toneMap.get(key).color;
    let index = toneMap.get(key).number;

      // get the selected text, put a span with appropriate id around it
      toneMap.set(key, {"tone": category, "description": desc, "color": color, "number": index + 1});
    let newNode = document.createElement("span");
    let spanID = color.substring(1) + "-" + category + "-" + index;
    newNode.setAttribute('id', spanID);
  //  newNode.setAttribute('style', "background-color: " + color);
    newNode.setAttribute('class', "highlightSpan");
    current_range.surroundContents(newNode);

    $("#" + spanID).css("background-color", color);

    $("#" + spanID).on("dblclick", function() {
      removeThisHighlight(spanID, key);
    });
  }

// to be totally redone
function separateIntoColumns() {
  d3.selectAll("span").each(function() {
    let spanClass = d3.select(this).class().split("-")
    if (spanClass[0] == "topic") {
      if (spanClass[1] == 1) {
        // pan left
      } else if (spanClass[1] == 2) {
        // pan center
      } else if (spanClass[1] == 3) {
        // pan right
      }
    }
  });
    // temporarily wrap all other text in ignore spans
}

//removes the highlighted text given an index and an id
function removeThisHighlight(spanID, key) {
    $("#" + spanID).contents().unwrap();
    let category = toneMap.get(key).tone;
    let desc = toneMap.get(key).description;
    let color = toneMap.get(key).color;
    let index = toneMap.get(key).number;
    toneMap.set(key, {"tone": category, "description": desc, "color": color, "number": index - 1});
    // later - delete from wherever it is stored
}

/*
* Creaes an annotation
*/
function createAnnotation(part, top) {
  let annotation = d3.select("#right_column").append("div")
    .attr("class", "annotation")
    .attr("id", "annotation-" + part + "-" + top)
    .style("top", top + "px");


  let text = annotation.append("div")
    .attr("id", "annotation-" + part + "-" + top + "-text")
    .html("Click 'Edit' to write in this annotation");

  //save/update
  annotation.append("button")
    .attr("id", "annotation-" + part + "-" + top + "-save")
    //hide when not editing
    .style("display", "none")
    .html("Save")
    .on("click", function () {
        text.attr("contenteditable", false)
        .style("color", "black");
        d3.select("#annotation-" + part + "-" + top + "-save").style("display", "none");
        d3.select("#annotation-" + part + "-" + top + "-edit").style("display", "block");

      //if annotations are stored anywhere, update the data for this annotation
    });

    //edit
  annotation.append("button")
    .attr("id", "annotation-" + part + "-" + top + "-edit")
    .html("Edit")
    .on("click", function () {
      d3.select("#annotation-" + part + "-" + top + "-save").style("display", "block");
      d3.select("#annotation-" + part + "-" + top + "-edit").style("display", "none");
      text.attr("contenteditable", true)
      .style("color", "blue");
      //make the div contenteditable
    });

    //delete
  annotation.append("button")
    .attr("id", "annotation-" + part + "-" + top + "-delete")
    .html("Delete")
    .on("click", function () {
      annotation.remove();
    });

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


  /*
    rectangle visualization:

  */

})();
