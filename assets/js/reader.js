// upload word document
// use docx.js to display this as html || have user save as .html, read, load into div
// allow user to select section by highlighting a section of the text

var result;

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
  d3.select("#selection").style("opacity", 1);

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
  d3.select("#control_container").html("");

  // create array with :
    // 





}
