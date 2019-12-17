---
layout: default
title: Creating Enrichments
nav_order: 1
parent: Example data
---

# Adding an enrichment to a collection

## create a collection and add documents to it
1. Create a new Project, and select the project type to be *document retrieval*
2. Select *Upload data*
3. Name the collection _Collection1_ and create the collection
4. Upload the sample document in this repo at _examples/discovery-search-app/data/watson-in-the-game.pdf_
5. Select done and wait for this PDF to be ingested, then move on to creating an enrichment

## create an enrichment
1. Select the project you like to create an enrichment in
2. Select the *Teach domain concepts* dropdown and then choose *Dictionaries*
3. Select *Upload*
4. Name the new enrichment, i.e., _dict-enrichment_
5. Set the Facet path to _my-facet_
6. Select *Upload* and then choose _examples/discovery-search-app/data/dictionary-enrichment.csv_
7. Select *Create*
8. When prompted to apply this enrichment to a collection, select _Collection1_
9. Click the *Select fields* drop down and choose *text*
10. Select *Apply* and wait for the recrawl to complete before using documents with this Dictionary enrichment applied
