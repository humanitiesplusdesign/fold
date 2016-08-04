New name for the application: Fold

##Overview

With Fold we consider documents in terms of ORDER, STRUCTURE, and TONE.

ORDER = The organization of a text according to nested hierarchical headings: Heading 1, Heading 2, Heading 3, etc. 
STRUCTURE = A parsing of the text into a limited number of categories or topics. One category that exists by default is “Ignore”. Up to four additional categories can be defined by the user.  
TONE = A further categorization of text that can happen at the level of Order, Structure, sentence, phrase or individual word. We use color and opacity to identify tone. Up to four hues can be defined by the user + up to five levels of opacity, effectively providing a palette of 20 colors.
ANNOTATION = Text note applied to a word, phrase, sentence, tone-piece, structure-piece, heading, or part.

##Data In
TBD. At the early stage we assume some basic formatting that we can read in. Markdown for heading levels? The Order of the document would be determined based on imported formatting. Otherwise we will need to include formatting of the text in some way to add paragraph breaks and heading levels.

##Data Encoding

###Settings

in the Settings panel, the Structure topics/categories are defined. Also the Tone categories and colors are assigned. These need to be modifiable such that we can edit the label or the color without losing whatever text has already been assigned that category.

###Navigation  

The generated TOC provides navigation. We do not assume any pagination, but one “Part” is viewable at a time. Use the TOC (in a side slide panel) to navigate between Parts.

The graphic representation of the structure of each part also appears to the right of the document. Blocks of text proportional to relative text size are defined by Topic breaks (? TBD) and tone appears as color as it is applied to the text. A box around this graphic cue shows which part of the text currently fills the Text view on the page.


###Views

####Table of Contents  
ORDER defines a parsing of the text into PARTS based on a Heading 1 encoding. If the imported text does not include titles for the H1/Part, a default ordered title will be applied “Part 1 to Part X). These parts (H1) provide the highest level in the Table of Contents (TOC) view. The TOC view 

####Default Text View
Specific styling TBD (maybe optional formatting layouts) but the basic formatting follows the rules of the heading levels and paragraph breaks.

####Structured View
The text can be divided into 2-4 columns (one of the four is “ignore”). The arrangement is defined by the topic or Structure category. Type the name of the pre-defined topic at the top of the column. Columns can be collapsed. Reordering either by changing the column label or drag (?).


##Data Export
Export to PDF with TOC appended to text with Structure, Tone and annotation applied (columns and color). and export JSON project (to be reloaded).

