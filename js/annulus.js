// add way to choose color and choose corresponding category

(function () {
var main_svg;

// data
var ring_data;
var currentFile;
var currentResult;

//numbers
var startSize = 7;
var incrSize = 9;
var size = 500;
var center = size / 2;

//colors
var category = "Politics";

var value1 = "traditional";
var value2 = "conservative";
var value3 = "conservative+liberal";
var value4 = "liberal";
var value5 = "libertarian";

var color1 = "#ff6600"; //traditional
var color2 = "#ff8c1a"; //conservative
var color3 = "#ffff66"; //conservative-liberal
var color4 = "#5cd65c"; //liberal
var color5 = "#99ccff"; //libertarian
var color0 = "black";

//reads the file uploaded and stores as currentFile
window.onload = function() {
  var fileupload = document.getElementById('fileupload');

    fileupload.addEventListener('change', function(e) {
      var file = fileupload.files[0];
      currentFile = fileupload.files[0];

      var reader = new FileReader();

      reader.onload = function(e) {
        //  console.log(reader.result);
          currentResult = reader.result;
      }
      reader.readAsDataURL(file);
    });
}

// setups up main svg area to append rings
function setupRings() {
  main_svg = d3.select("#main").append("svg")
  .attr("id", "svg_container")
  .attr("width", size)
  .attr("height", size);
  d3.select("#category-select").property("value", category);
  d3.select("#v1").property("value", value1);
  d3.select("#v2").property("value", value2);
  d3.select("#v3").property("value", value3);
  d3.select("#v4").property("value", value4);
  d3.select("#v5").property("value", value5);
  d3.select("#c1").property("value", color1);
  d3.select("#c2").property("value", color2);
  d3.select("#c3").property("value", color3);
  d3.select("#c4").property("value", color4);
  d3.select("#c5").property("value", color5);
  d3.select("#c0").property("value", color0);
}

function setupDemo() {
  category = "Politics";
  value1 = "traditional";
  value2 = "conservative";
  value3 = "conservative+liberal";
  value4 = "liberal";
  value5 = "libertarian";
  color1 = "#ff6600"; //traditional
  color2 = "#ff8c1a"; //conservative
  color3 = "#ffff66"; //conservative-liberal
  color4 = "#5cd65c"; //liberal
  color5 = "#99ccff"; //libertarian
  d3.select("#category-select").property("value", category);
  d3.select("#v1").property("value", value1);
  d3.select("#v2").property("value", value2);
  d3.select("#v3").property("value", value3);
  d3.select("#v4").property("value", value4);
  d3.select("#v5").property("value", value5);
  d3.select("#c1").property("value", color1);
  d3.select("#c2").property("value", color2);
  d3.select("#c3").property("value", color3);
  d3.select("#c4").property("value", color4);
  d3.select("#c5").property("value", color5);
}

// draws an individual ring, requires order (integer), a color, and the maximum order of all of the rings
function drawRings(order, value, max) {
      console.log(value);
      //draw a circle
      main_svg.append("circle")
          .attr("class", "ring")
          .attr("cx", center)
          .attr("cy", center)
          .attr("r", (max * incrSize + startSize) - incrSize * order)
          .style("fill", function() {
              if (value == value1) return color1;
              if (value == value2) return color2;
              if (value == value3) return color3;
              if (value == value4) return color4;
              if (value == value5) return color5;
              return color0;
          })
          .attr("stroke", "white")
          .style("animation-delay", order / 10 + "s");

    };

// does exactly that
function updateValuesAndColors() {
  if (d3.select("#v1").property("category-select") != "") category = d3.select("#category-select").property("value");
  if (d3.select("#v1").property("value") != "") value1 = d3.select("#v1").property("value");
  if (d3.select("#v2").property("value") != "") value2 = d3.select("#v2").property("value");
  if (d3.select("#v3").property("value") != "") value3 = d3.select("#v3").property("value");
  if (d3.select("#v4").property("value") != "") value4 = d3.select("#v4").property("value");
  if (d3.select("#v5").property("value") != "") value5 = d3.select("#v5").property("value");
  if (d3.select("#c1").property("value") != "") color1 = d3.select("#c1").property("value");
  if (d3.select("#c2").property("value") != "") color2 = d3.select("#c2").property("value");
  if (d3.select("#c3").property("value") != "") color3 = d3.select("#c3").property("value");
  if (d3.select("#c4").property("value") != "") color4 = d3.select("#c4").property("value");
  if (d3.select("#c5").property("value") != "") color5 = d3.select("#c5").property("value");
  if (d3.select("#c0").property("value") != "") color0 = d3.select("#c0").property("value");
}

setupRings();
document.getElementById("graph_button").addEventListener("click", function(){graphTSV()});
document.getElementById("submit").addEventListener("click", function(){updateValuesAndColors()});
document.getElementById("demo_button").addEventListener("click", function(){graphDemo()});


function graphDemo() {
  setupDemo();
  //passes the result of the file reader to d3
  d3.tsv("article10.tsv", function(data){
    // converts to integer
    data.forEach(function(d) {
      d.Sequence = +d.Sequence;
    })
    // finds number of entries
    var max = d3.max(data, function(d) { return d.Sequence; });
    data.forEach(function(d) {
      var value = d.Politics;
      drawRings(d.Sequence, value, max);
      var color;
      if (value == value1) color = color1;
      if (value == value2) color = color2;
      if (value == value3) color = color3;
      if (value == value4) color = color4;
      if (value == value5) color = color5;
      d3.select("#legend").append("p")
        .html("<p>" + d.Sequence + ". " + d.Name + " - " + value + "</p>")
        .style("color", color)
        .attr("class", "label")
        .style("animation-delay", d.Sequence / 10 + "s");
    })
  });
}

function graphTSV() {
  d3.tsv(currentResult, function(data){
    // converts to integer
    data.forEach(function(d) {
      d.Sequence = +d.Sequence;
    })
    // finds number of entries
    var max = d3.max(data, function(d) { return d.Sequence; });
    if (max > 30) {incrSize = 5;}

    data.forEach(function(d) {
        var value = d[category];

        drawRings(d.Sequence, value, max);
        var color;
        if (value == value1) color = color1;
        if (value == value2) color = color2;
        if (value == value3) color = color3;
        if (value == value4) color = color4;
        if (value == value5) color = color5;
        d3.select("#legend").append("p")
          .html("<p>" + d.Sequence + ". " + d.Name + " - " + value + "</p>")
          .style("color", color)
          .attr("class", "label")
          .style("animation-delay", d.Sequence / 10 + "s");
    })
  });
}

})();
