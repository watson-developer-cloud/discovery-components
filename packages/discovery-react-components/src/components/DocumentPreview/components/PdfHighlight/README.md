## How highlighting works

### TextLayout

`TextLayout` shows that what text is placed where in a page. `TextLayout` has multiple `TextLayoutCells`. Each cell shows a particular text is rendered in a particular boundary box.

So, `metadata.text_mappings` is a kind of `TextLayout` because it bounds text to boundary boxes. `bbox`es stored in `html` field can also be a `TextLayout`. Text objects in a PDF page (`TextContentItem`s in `pdfjs-dist` npm package) can also be a `TextLayout`.

Depending on its source, each type of text layout has each granularity, i.e. text length and the size of boundary box in a `TextLayoutCell` are different. For example, a cell from `text_mappings` typically has longer text (sometimes it's a paragraph) and large boundary box. A cell from PDF text content item has shorter text (say it's word or short phrase) and small boundary box.

For highlighting, smaller boundary boxes produces more accurate highlight boundary box.

### Find smaller text layout cell using `TextBoxMappings`

So, we build mappings from larger cells to smaller cells. More detail, mapping from a span on a text in a large cell to a span on a text in a smaller cell.

To find highlight boundary box, we typically starts with cells from `text_mapping` because we can find a cell and a span on it from a span on a field. Then, use the mappings to find smaller cells, which are typically from PDF text content items.

However, calculation of the mapping is not straightforward. A smaller cell can be overlapped with two or more larger cells. The order of smaller cells may not be the same as the text in a larger cells. They make hard to find a smaller cell from a span on a text in a larger cell. `getTextBoxMappings` and it helpers `TextNormalizer`, `TextProvider`, `CellProvider` are used to calculate a good mapping even with the situation.

#### How to build mappings

`CellProvider` denotes fine-grained text layout. It provides small text layout cells with the text. `MappingTargetBoxProvider` wraps `CellProvider` mainly for normalizing text. Normalization is important because the text in original PDF can be refined in field text. For example, two consecutive spaces are normalized to one, and quotation marks can be normalized.

`TextProvider` provides text from course-grained text layout cells. User can consume spans on the text (i.e. mark the text span used) and the class manages text which is yet to be consumed. The class can find `match` to a given text in the remaining text and returns score of match. `MappingSourceTextProvider` wraps `TextProvider` for text normalization.

With these classes, `getTextBoxMappings` builds mappings as follow:

1. Load text from `CellProvider`. It may span on multiple text layout cells
2. Find match in `TextProvider`, and then consume the matched text
3. For each text layout cells in the matched text,
   1. associate the text layout cell and a span on the matched text
   2. mark the text layout cell consumed

### Text layout cell to boundary box

Now, we have small cells for highlighting.

Even with a small cell, text to highlight may be a span on a cell text. In the case, we have to calculate boundary box for the span. By default, cells approximate the boundary box by assigning width evenly to every characters in the cell text.

Some `TextLayoutCalls` has capability of calculating boundary box for a sub-span of its text. For example, cells for PDF text items `PdfTextContentTextLayoutCell` can calculate boundary boxes for given text spans. It internally uses DOM and DOM's `getBoundingClientRect` to get the result.

### Highlighter

`Highlighter` manages available information about a document and a page, and calculate boundary boxes for given spans on fields.
