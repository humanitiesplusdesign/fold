/* To do:
  tooltips:
    improve removal behavior, style prettier

  column view:
    add 'active' tags of some sort on a top toolbar to let "columns" be collapsed (and ignored column expanded)

  highlights:
  create data strcuture to store and fix proper ordering from top to bottom

  annotations:
  attach to location in text (insert empty span with appropriate class)

  compare view:
    retrofit annulus visualization to fit new app - can be much less complicated than before
    work on rectange/linear visualization

  saving/loading
    plug in annotations and all spans into heirarchy
    create a load function for a json file liek heirarchy

*/
(function () {
const heirarchy = {
  "tree": [],
  "annulusArray": [],
  "categories": d3.map(),
  "title": "Project 1",
  "topicRects": []
}

let svg_width = 400;
let colorMap = d3.map();
// for storing data to generate annulus rings later
let annulusArray = [];

//topics, tones, and tooltips
let highlight_tip;
let topic_tip;
let toneMap = d3.map();
let topicMap = d3.map();
let numTopics = 0;
let numTones = 0;

// currently selected text
let current_range;
// current part being viewed
let activePart = 1;

// true if rectangle visualization, false if annulus visualization
let rectangles = true;
let left_svg = d3.select("#left_svg");

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
          $("#toggle-text_container").click();
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
    $("#text_container_right").css("height", $("#text_container").height());
    $("#text_container_left").css("height",  $("#text_container").height());
    displayOnlyThisPart(activePart);

    // account for missing sidebar margins
    // make sure to choose only approopriate partition
  });
  $('#toggle-annotate').on("click", function() {
    displayOnly("#text_container");
    refreshHighlightTip();
    $("#text_container_right").css("height", $("#text_container").height());
    $("#text_container_left").css("height",  $("#text_container").height());
    $("#text_container_right").css("display", "block");
    $("#text_container_left").css("display", "block");
    d3.select("#left_column").style("display", "block");
    d3.select("#right_column").style("display", "block");
    displayOnlyThisPart(activePart);
    displayAnnotationsOfPart(activePart);
    //display other stuff

    d3.selectAll("i").style("color", "gray");
    d3.select("#toggle-annotate").style("color", "black");
  });
  $('#toggle-tableOfContents').on("click", function() {
    displayOnly("#tableOfContents");
  });
  $('#toggle-columns').on("click", function() {
    displayOnly("#text_container");
    columns = true;
    displayOnlyThisPart(activePart);
    separateIntoColumns();
    d3.selectAll("i").style("color", "gray");
    d3.select("#toggle-columns").style("color", "black");
  });
  $('#toggle-compare').on("click", function() {
    displayOnly("#compare");
    compareView();
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
        topicMap.set(i, {"topic": d3.select("#topic-term-" + i).property("value"), "description": d3.select("#topic-des-" + i).property("value")});
        d3.select(this).style("display", "none");
      });
      $('#topic-term-' + i + ", #topic-des-" + i).on("keydown", function() {
        d3.select("#save-topic-" + i).style("display", "block");
      });
    }
    $('#save-tone-' + i).on("click", function() {
      if (toneMap.get(i).color != d3.select("#color-" + i).property("value")) {
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

/*
* Ensures that the tooltips display the correct topics, tones, and colors
*/
function refreshHighlightTip() {
  let tip = d3.select("#highlight_tip");
  tip.html("");
  toneMap.forEach(function(key, value) {
    tip.append("div")
      .attr("class", "tip-color-container")
      .attr("id", "tip-color-container-" + key)
      .html(function() {

        if (key == 1) {
          return value.tone + " " + "<i class='fa fa-paint-brush' aria-hidden='true' style='color: " + value.color +"!important;'></i>";
        } else {
          return "| " + value.tone + " " + "<i class='fa fa-paint-brush' aria-hidden='true' style='color: " + value.color +"!important;'></i>";
        }
      });

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
      .html(value.topic)
      .on("click", function() {
        highlightTopic(key);
      });
  });
}


/*
* Creates tooltips and adds functionality to them as well as to annotations
*/
function setupTooltips() {
  $("#text_container").on("mouseup", function() {
    if (window.getSelection().toString().length > 1) {
      current_range = window.getSelection().getRangeAt(0);
      $("#highlight_tip").css("display", "block")
        .css("top", current_range.getBoundingClientRect().top + $('body').scrollTop() + 20)
        .css("left", current_range.getBoundingClientRect().right + 20);
    } else {
      $("#highlight_tip").css("display", "none");
      $("#topic_tip").css("display", "none");
    }
  });

    $("#text_container_left").on("mouseover", function() {
      $("#topic_tip").css("display", "block")
        .css("top", current_range.getBoundingClientRect().bottom + $('body').scrollTop() - 10)
        .css("left", "12.5%");
    });

    $("#text_container_right").on("click", function() {
      let top = event.pageY + $('body').scrollTop();
      // to do - change this to require a selection when creating an annotation, then insert a <span class="annotation"></span> and store
      createAnnotation(activePart, top);
    });
}

/*
* does exactly that
*/
function hideTooltips() {
  $("#highlight_tip, #topic_tip").css("display", "none");
}
/*
* The write view displays only one h1 part at a time; this does that.
*/
function displayOnlyThisPart(part) {
  for (let i = 0; i < heirarchy.tree[0].sections.length; i++) {
    d3.select("#text-h1-" + i).style("display", "none");
    }
  d3.select("#text-h1-" + part).style("display", "block");
}

/*
* Shows only the annotations for the current part
*/
function displayAnnotationsOfPart(part) {
  d3.selectAll(".annotation").style("display", function() {
    if (d3.select(this).attr("id").split("-")[1] == part) {
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
  hideTooltips();
  resetColumns();
  d3.select("#intro").style("display", "none");
  d3.select("#text_container").style("display", "none");
  d3.select("#settings").style("display", "none");
  // add in everything that needs to be hidden
  d3.select("#tableOfContents").style("display", "none");
  d3.select("#left_column").style("display", "none");
  d3.select("#right_column").style("display", "none");
  d3.select("#compare").style("display", "none");

  d3.selectAll("i").style("color", "gray");

  $("#text_container_right").css("display", "none");
  $("#text_container_left").css("display", "none");
  d3.selectAll(".annotation").style("display", "none");

  d3.select(selection).style("display", "block");
  // not the best way to link things, but it works
  d3.select("#toggle-" + selection.substring(1)).style("color", "black");

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

    updateLeftRectangle();
  }

/*
* Similar to highlight(), but applies a topic span instead
*/
function highlightTopic(key) {
  let spanClass = "topic-" + key;
  let newNode = document.createElement("span");
  let selText = window.getSelection().toString();
  let id = spanClass + selText.substring(0,10).split(" ").join();

  newNode.setAttribute('class', spanClass);
  newNode.setAttribute('id', id);
  current_range.surroundContents(newNode);
  //to do - change from this gray highlight to something that fits nicole's design
  $('#' + id).on("mouseover", function() {
    $('#' + id).css("background-color", "gray");
  }).on("mouseout", function() {
    $('#' + id).css("background-color", "white");
  })

  updateLeftRectangle();
}

function updateLeftRectangle() {
  left_svg.selectAll("rect").remove();
  left_svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "lightgray");
  createRectangle(activePart, left_svg, 400, "100%");
}

/*
* Moves topic spans into columns
*/
function separateIntoColumns() {
  // temporary fix:
  let bottom = 100;
  d3.select("#text_container").style("font-size", "0");
  d3.select("#text-h1-" + activePart).selectAll("span").each(function() {
    let spanClass = d3.select(this).attr("class").split("-")
    if (spanClass[0] == "topic") {
      d3.select(this).style("width", "29%")
        .style("position", "absolute")
        .style("font-size", "1.6vw")
        .style("top", bottom + 'px');
      if (spanClass[1] == 1) {
          d3.select(this).transition().duration("3000").style("left", "3%");
      } else if (spanClass[1] == 2) {
          d3.select(this).transition().duration("3000").style("left", "33%");

      } else if (spanClass[1] == 3) {
          d3.select(this).transition().duration("3000").style("left", "63%");
      }
    }
    bottom = 100 + this.getBoundingClientRect().bottom;
  });

  //set back to static and no margin-left
}

/*
* Resets the columns, all text visible and joined
*/
function resetColumns() {
  d3.selectAll("span").each(function() {
    d3.select(this).style("position", "static").style("left", "0%");
  })

  d3.select("#text_container").style("font-size", "1.6vw");
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
    });

    //delete
  annotation.append("button")
    .attr("id", "annotation-" + part + "-" + top + "-delete")
    .html("Delete")
    .on("click", function () {
      annotation.remove();
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

function createAnnulus(part, svg, height) {

}


/*
* Creates the rectange/linear visualization used on both the side of the text and in the compare view
*/
function createRectangle(part, svg, height, width) {
  let mainTextLength = document.getElementById("text-h1-" + part).innerText.length; // should be equal to heirarchy.tree[0].sections[part].text.length
  let rectArray = [];
  d3.select("#text-h1-" + part).selectAll("span").each(function() {
    if (!d3.select(this).classed("highlightSpan") && !d3.select(this).classed("annotationSpan") ) {
      let start = 0;
          // find where the span starts relative to the part in order to determine y attr
      for (let i = 0; i < heirarchy.tree[0].sections[part].text.length - this.innerText.length; i++) {
        if (heirarchy.tree[0].sections[part].text.substring(i, i + this.innerText.length) == this.innerText) {
          start = i;
          break;
        }
      }
      let color = $(this).find("span").css("background-color");
      if (color == undefined || color == "") color = "gray";

        rectArray.push({"start": start, "length": this.innerText.length, "color": color});
    }
  })

  let heightFactor = height / mainTextLength;
  for (let i = 0; i < rectArray.length; i++) {
    svg.append("rect")
      .attr("y", rectArray[i].start * heightFactor)
      .attr("height", rectArray[i].length * heightFactor)
      .attr("width", width)
      .attr("fill", rectArray[i].color);
  }
}

function compareView() {
  let compare = d3.select("#compare")
  compare.html("")
    .append("h1")
    .text(heirarchy.title);

  if (rectangles) {
    for (let i = 0; i < heirarchy.tree[0].sections.length; i++) {
      let compareDiv = compare.append("div")
        .attr("id", "compare-part-" + i)
        .attr("class", "compare-part")
        .style("height", "500px")
        .style("width", (100 / (heirarchy.tree[0].sections.length * 1.3)) + "%");

      let compareSvg = compareDiv.append("svg")
        .attr("height", 400)
        .attr("width", "66%")
        .style("background-color", "lightgray");

        createRectangle(i, compareSvg, 400, "100%");
    }
  } else {
    for (let i = 0; i < heirarchy.tree[0].sections.length; i++) {
      let compareDiv = compare.append("div")
        .attr("id", "compare-part-" + i)
        .attr("class", "compare-part")
        .style("height", "500px")
        .style("width", (100 / (heirarchy.tree[0].sections.length)) + "%");

      let compareSvg = compareDiv.append("svg")
        .attr("height", 400)
        .attr("width", "80%")
        .attr("stroke", "2px black")
        .style("background-color", "lightgray");

        createAnnulus(i, compareSvg, 400);
    }
  }
}

})();
