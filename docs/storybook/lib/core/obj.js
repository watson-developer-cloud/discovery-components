/**
 * @licstart The following is the entire license notice for the
 * Javascript code in this page
 *
 * Copyright 2020 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @licend The above is the entire license notice for the
 * Javascript code in this page
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileSpec = exports.XRef = exports.ObjectLoader = exports.Catalog = void 0;

var _util = require("../shared/util.js");

var _primitives = require("./primitives.js");

var _parser = require("./parser.js");

var _core_utils = require("./core_utils.js");

var _crypto = require("./crypto.js");

var _colorspace = require("./colorspace.js");

var _image_utils = require("./image_utils.js");

function fetchDestination(dest) {
  return (0, _primitives.isDict)(dest) ? dest.get("D") : dest;
}

class Catalog {
  constructor(pdfManager, xref) {
    this.pdfManager = pdfManager;
    this.xref = xref;
    this._catDict = xref.getCatalogObj();

    if (!(0, _primitives.isDict)(this._catDict)) {
      throw new _util.FormatError("Catalog object is not a dictionary.");
    }

    this.fontCache = new _primitives.RefSetCache();
    this.builtInCMapCache = new Map();
    this.globalImageCache = new _image_utils.GlobalImageCache();
    this.pageKidsCountCache = new _primitives.RefSetCache();
  }

  get version() {
    const version = this._catDict.get("Version");

    if (!(0, _primitives.isName)(version)) {
      return (0, _util.shadow)(this, "version", null);
    }

    return (0, _util.shadow)(this, "version", version.name);
  }

  get collection() {
    let collection = null;

    try {
      const obj = this._catDict.get("Collection");

      if ((0, _primitives.isDict)(obj) && obj.size > 0) {
        collection = obj;
      }
    } catch (ex) {
      if (ex instanceof _core_utils.MissingDataException) {
        throw ex;
      }

      (0, _util.info)("Cannot fetch Collection entry; assuming no collection is present.");
    }

    return (0, _util.shadow)(this, "collection", collection);
  }

  get acroForm() {
    let acroForm = null;

    try {
      const obj = this._catDict.get("AcroForm");

      if ((0, _primitives.isDict)(obj) && obj.size > 0) {
        acroForm = obj;
      }
    } catch (ex) {
      if (ex instanceof _core_utils.MissingDataException) {
        throw ex;
      }

      (0, _util.info)("Cannot fetch AcroForm entry; assuming no forms are present.");
    }

    return (0, _util.shadow)(this, "acroForm", acroForm);
  }

  get metadata() {
    const streamRef = this._catDict.getRaw("Metadata");

    if (!(0, _primitives.isRef)(streamRef)) {
      return (0, _util.shadow)(this, "metadata", null);
    }

    const suppressEncryption = !(this.xref.encrypt && this.xref.encrypt.encryptMetadata);
    const stream = this.xref.fetch(streamRef, suppressEncryption);
    let metadata;

    if (stream && (0, _primitives.isDict)(stream.dict)) {
      const type = stream.dict.get("Type");
      const subtype = stream.dict.get("Subtype");

      if ((0, _primitives.isName)(type, "Metadata") && (0, _primitives.isName)(subtype, "XML")) {
        try {
          metadata = (0, _util.stringToUTF8String)((0, _util.bytesToString)(stream.getBytes()));
        } catch (e) {
          if (e instanceof _core_utils.MissingDataException) {
            throw e;
          }

          (0, _util.info)("Skipping invalid metadata.");
        }
      }
    }

    return (0, _util.shadow)(this, "metadata", metadata);
  }

  get toplevelPagesDict() {
    const pagesObj = this._catDict.get("Pages");

    if (!(0, _primitives.isDict)(pagesObj)) {
      throw new _util.FormatError("Invalid top-level pages dictionary.");
    }

    return (0, _util.shadow)(this, "toplevelPagesDict", pagesObj);
  }

  get documentOutline() {
    let obj = null;

    try {
      obj = this._readDocumentOutline();
    } catch (ex) {
      if (ex instanceof _core_utils.MissingDataException) {
        throw ex;
      }

      (0, _util.warn)("Unable to read document outline.");
    }

    return (0, _util.shadow)(this, "documentOutline", obj);
  }

  _readDocumentOutline() {
    let obj = this._catDict.get("Outlines");

    if (!(0, _primitives.isDict)(obj)) {
      return null;
    }

    obj = obj.getRaw("First");

    if (!(0, _primitives.isRef)(obj)) {
      return null;
    }

    const root = {
      items: []
    };
    const queue = [{
      obj,
      parent: root
    }];
    const processed = new _primitives.RefSet();
    processed.put(obj);
    const xref = this.xref,
          blackColor = new Uint8ClampedArray(3);

    while (queue.length > 0) {
      const i = queue.shift();
      const outlineDict = xref.fetchIfRef(i.obj);

      if (outlineDict === null) {
        continue;
      }

      if (!outlineDict.has("Title")) {
        throw new _util.FormatError("Invalid outline item encountered.");
      }

      const data = {
        url: null,
        dest: null
      };
      Catalog.parseDestDictionary({
        destDict: outlineDict,
        resultObj: data,
        docBaseUrl: this.pdfManager.docBaseUrl
      });
      const title = outlineDict.get("Title");
      const flags = outlineDict.get("F") || 0;
      const color = outlineDict.getArray("C");
      const count = outlineDict.get("Count");
      let rgbColor = blackColor;

      if (Array.isArray(color) && color.length === 3 && (color[0] !== 0 || color[1] !== 0 || color[2] !== 0)) {
        rgbColor = _colorspace.ColorSpace.singletons.rgb.getRgb(color, 0);
      }

      const outlineItem = {
        dest: data.dest,
        url: data.url,
        unsafeUrl: data.unsafeUrl,
        newWindow: data.newWindow,
        title: (0, _util.stringToPDFString)(title),
        color: rgbColor,
        count: Number.isInteger(count) ? count : undefined,
        bold: !!(flags & 2),
        italic: !!(flags & 1),
        items: []
      };
      i.parent.items.push(outlineItem);
      obj = outlineDict.getRaw("First");

      if ((0, _primitives.isRef)(obj) && !processed.has(obj)) {
        queue.push({
          obj,
          parent: outlineItem
        });
        processed.put(obj);
      }

      obj = outlineDict.getRaw("Next");

      if ((0, _primitives.isRef)(obj) && !processed.has(obj)) {
        queue.push({
          obj,
          parent: i.parent
        });
        processed.put(obj);
      }
    }

    return root.items.length > 0 ? root.items : null;
  }

  get permissions() {
    let permissions = null;

    try {
      permissions = this._readPermissions();
    } catch (ex) {
      if (ex instanceof _core_utils.MissingDataException) {
        throw ex;
      }

      (0, _util.warn)("Unable to read permissions.");
    }

    return (0, _util.shadow)(this, "permissions", permissions);
  }

  _readPermissions() {
    const encrypt = this.xref.trailer.get("Encrypt");

    if (!(0, _primitives.isDict)(encrypt)) {
      return null;
    }

    let flags = encrypt.get("P");

    if (!(0, _util.isNum)(flags)) {
      return null;
    }

    flags += 2 ** 32;
    const permissions = [];

    for (const key in _util.PermissionFlag) {
      const value = _util.PermissionFlag[key];

      if (flags & value) {
        permissions.push(value);
      }
    }

    return permissions;
  }

  get optionalContentConfig() {
    let config = null;

    try {
      const properties = this._catDict.get("OCProperties");

      if (!properties) {
        return (0, _util.shadow)(this, "optionalContentConfig", null);
      }

      const defaultConfig = properties.get("D");

      if (!defaultConfig) {
        return (0, _util.shadow)(this, "optionalContentConfig", null);
      }

      const groupsData = properties.get("OCGs");

      if (!Array.isArray(groupsData)) {
        return (0, _util.shadow)(this, "optionalContentConfig", null);
      }

      const groups = [];
      const groupRefs = [];

      for (const groupRef of groupsData) {
        if (!(0, _primitives.isRef)(groupRef)) {
          continue;
        }

        groupRefs.push(groupRef);
        const group = this.xref.fetchIfRef(groupRef);
        groups.push({
          id: groupRef.toString(),
          name: (0, _util.isString)(group.get("Name")) ? (0, _util.stringToPDFString)(group.get("Name")) : null,
          intent: (0, _util.isString)(group.get("Intent")) ? (0, _util.stringToPDFString)(group.get("Intent")) : null
        });
      }

      config = this._readOptionalContentConfig(defaultConfig, groupRefs);
      config.groups = groups;
    } catch (ex) {
      if (ex instanceof _core_utils.MissingDataException) {
        throw ex;
      }

      (0, _util.warn)(`Unable to read optional content config: ${ex}`);
    }

    return (0, _util.shadow)(this, "optionalContentConfig", config);
  }

  _readOptionalContentConfig(config, contentGroupRefs) {
    function parseOnOff(refs) {
      const onParsed = [];

      if (Array.isArray(refs)) {
        for (const value of refs) {
          if (!(0, _primitives.isRef)(value)) {
            continue;
          }

          if (contentGroupRefs.includes(value)) {
            onParsed.push(value.toString());
          }
        }
      }

      return onParsed;
    }

    function parseOrder(refs, nestedLevels = 0) {
      if (!Array.isArray(refs)) {
        return null;
      }

      const order = [];

      for (const value of refs) {
        if ((0, _primitives.isRef)(value) && contentGroupRefs.includes(value)) {
          parsedOrderRefs.put(value);
          order.push(value.toString());
          continue;
        }

        const nestedOrder = parseNestedOrder(value, nestedLevels);

        if (nestedOrder) {
          order.push(nestedOrder);
        }
      }

      if (nestedLevels > 0) {
        return order;
      }

      const hiddenGroups = [];

      for (const groupRef of contentGroupRefs) {
        if (parsedOrderRefs.has(groupRef)) {
          continue;
        }

        hiddenGroups.push(groupRef.toString());
      }

      if (hiddenGroups.length) {
        order.push({
          name: null,
          order: hiddenGroups
        });
      }

      return order;
    }

    function parseNestedOrder(ref, nestedLevels) {
      if (++nestedLevels > MAX_NESTED_LEVELS) {
        (0, _util.warn)("parseNestedOrder - reached MAX_NESTED_LEVELS.");
        return null;
      }

      const value = xref.fetchIfRef(ref);

      if (!Array.isArray(value)) {
        return null;
      }

      const nestedName = xref.fetchIfRef(value[0]);

      if (typeof nestedName !== "string") {
        return null;
      }

      const nestedOrder = parseOrder(value.slice(1), nestedLevels);

      if (!nestedOrder || !nestedOrder.length) {
        return null;
      }

      return {
        name: (0, _util.stringToPDFString)(nestedName),
        order: nestedOrder
      };
    }

    const xref = this.xref,
          parsedOrderRefs = new _primitives.RefSet(),
          MAX_NESTED_LEVELS = 10;
    return {
      name: (0, _util.isString)(config.get("Name")) ? (0, _util.stringToPDFString)(config.get("Name")) : null,
      creator: (0, _util.isString)(config.get("Creator")) ? (0, _util.stringToPDFString)(config.get("Creator")) : null,
      baseState: (0, _primitives.isName)(config.get("BaseState")) ? config.get("BaseState").name : null,
      on: parseOnOff(config.get("ON")),
      off: parseOnOff(config.get("OFF")),
      order: parseOrder(config.get("Order")),
      groups: null
    };
  }

  get numPages() {
    const obj = this.toplevelPagesDict.get("Count");

    if (!Number.isInteger(obj)) {
      throw new _util.FormatError("Page count in top-level pages dictionary is not an integer.");
    }

    return (0, _util.shadow)(this, "numPages", obj);
  }

  get destinations() {
    const obj = this._readDests(),
          dests = Object.create(null);

    if (obj instanceof NameTree) {
      const names = obj.getAll();

      for (const name in names) {
        dests[name] = fetchDestination(names[name]);
      }
    } else if (obj instanceof _primitives.Dict) {
      obj.forEach(function (key, value) {
        if (value) {
          dests[key] = fetchDestination(value);
        }
      });
    }

    return (0, _util.shadow)(this, "destinations", dests);
  }

  getDestination(destinationId) {
    const obj = this._readDests();

    if (obj instanceof NameTree || obj instanceof _primitives.Dict) {
      return fetchDestination(obj.get(destinationId) || null);
    }

    return null;
  }

  _readDests() {
    const obj = this._catDict.get("Names");

    if (obj && obj.has("Dests")) {
      return new NameTree(obj.getRaw("Dests"), this.xref);
    } else if (this._catDict.has("Dests")) {
      return this._catDict.get("Dests");
    }

    return undefined;
  }

  get pageLabels() {
    let obj = null;

    try {
      obj = this._readPageLabels();
    } catch (ex) {
      if (ex instanceof _core_utils.MissingDataException) {
        throw ex;
      }

      (0, _util.warn)("Unable to read page labels.");
    }

    return (0, _util.shadow)(this, "pageLabels", obj);
  }

  _readPageLabels() {
    const obj = this._catDict.getRaw("PageLabels");

    if (!obj) {
      return null;
    }

    const pageLabels = new Array(this.numPages);
    let style = null,
        prefix = "";
    const numberTree = new NumberTree(obj, this.xref);
    const nums = numberTree.getAll();
    let currentLabel = "",
        currentIndex = 1;

    for (let i = 0, ii = this.numPages; i < ii; i++) {
      if (i in nums) {
        const labelDict = nums[i];

        if (!(0, _primitives.isDict)(labelDict)) {
          throw new _util.FormatError("PageLabel is not a dictionary.");
        }

        if (labelDict.has("Type") && !(0, _primitives.isName)(labelDict.get("Type"), "PageLabel")) {
          throw new _util.FormatError("Invalid type in PageLabel dictionary.");
        }

        if (labelDict.has("S")) {
          const s = labelDict.get("S");

          if (!(0, _primitives.isName)(s)) {
            throw new _util.FormatError("Invalid style in PageLabel dictionary.");
          }

          style = s.name;
        } else {
          style = null;
        }

        if (labelDict.has("P")) {
          const p = labelDict.get("P");

          if (!(0, _util.isString)(p)) {
            throw new _util.FormatError("Invalid prefix in PageLabel dictionary.");
          }

          prefix = (0, _util.stringToPDFString)(p);
        } else {
          prefix = "";
        }

        if (labelDict.has("St")) {
          const st = labelDict.get("St");

          if (!(Number.isInteger(st) && st >= 1)) {
            throw new _util.FormatError("Invalid start in PageLabel dictionary.");
          }

          currentIndex = st;
        } else {
          currentIndex = 1;
        }
      }

      switch (style) {
        case "D":
          currentLabel = currentIndex;
          break;

        case "R":
        case "r":
          currentLabel = (0, _core_utils.toRomanNumerals)(currentIndex, style === "r");
          break;

        case "A":
        case "a":
          const LIMIT = 26;
          const A_UPPER_CASE = 0x41,
                A_LOWER_CASE = 0x61;
          const baseCharCode = style === "a" ? A_LOWER_CASE : A_UPPER_CASE;
          const letterIndex = currentIndex - 1;
          const character = String.fromCharCode(baseCharCode + letterIndex % LIMIT);
          const charBuf = [];

          for (let j = 0, jj = letterIndex / LIMIT | 0; j <= jj; j++) {
            charBuf.push(character);
          }

          currentLabel = charBuf.join("");
          break;

        default:
          if (style) {
            throw new _util.FormatError(`Invalid style "${style}" in PageLabel dictionary.`);
          }

          currentLabel = "";
      }

      pageLabels[i] = prefix + currentLabel;
      currentIndex++;
    }

    return pageLabels;
  }

  get pageLayout() {
    const obj = this._catDict.get("PageLayout");

    let pageLayout = "";

    if ((0, _primitives.isName)(obj)) {
      switch (obj.name) {
        case "SinglePage":
        case "OneColumn":
        case "TwoColumnLeft":
        case "TwoColumnRight":
        case "TwoPageLeft":
        case "TwoPageRight":
          pageLayout = obj.name;
      }
    }

    return (0, _util.shadow)(this, "pageLayout", pageLayout);
  }

  get pageMode() {
    const obj = this._catDict.get("PageMode");

    let pageMode = "UseNone";

    if ((0, _primitives.isName)(obj)) {
      switch (obj.name) {
        case "UseNone":
        case "UseOutlines":
        case "UseThumbs":
        case "FullScreen":
        case "UseOC":
        case "UseAttachments":
          pageMode = obj.name;
      }
    }

    return (0, _util.shadow)(this, "pageMode", pageMode);
  }

  get viewerPreferences() {
    const ViewerPreferencesValidators = {
      HideToolbar: _util.isBool,
      HideMenubar: _util.isBool,
      HideWindowUI: _util.isBool,
      FitWindow: _util.isBool,
      CenterWindow: _util.isBool,
      DisplayDocTitle: _util.isBool,
      NonFullScreenPageMode: _primitives.isName,
      Direction: _primitives.isName,
      ViewArea: _primitives.isName,
      ViewClip: _primitives.isName,
      PrintArea: _primitives.isName,
      PrintClip: _primitives.isName,
      PrintScaling: _primitives.isName,
      Duplex: _primitives.isName,
      PickTrayByPDFSize: _util.isBool,
      PrintPageRange: Array.isArray,
      NumCopies: Number.isInteger
    };

    const obj = this._catDict.get("ViewerPreferences");

    let prefs = null;

    if ((0, _primitives.isDict)(obj)) {
      for (const key in ViewerPreferencesValidators) {
        if (!obj.has(key)) {
          continue;
        }

        const value = obj.get(key);

        if (!ViewerPreferencesValidators[key](value)) {
          (0, _util.info)(`Bad value in ViewerPreferences for "${key}".`);
          continue;
        }

        let prefValue;

        switch (key) {
          case "NonFullScreenPageMode":
            switch (value.name) {
              case "UseNone":
              case "UseOutlines":
              case "UseThumbs":
              case "UseOC":
                prefValue = value.name;
                break;

              default:
                prefValue = "UseNone";
            }

            break;

          case "Direction":
            switch (value.name) {
              case "L2R":
              case "R2L":
                prefValue = value.name;
                break;

              default:
                prefValue = "L2R";
            }

            break;

          case "ViewArea":
          case "ViewClip":
          case "PrintArea":
          case "PrintClip":
            switch (value.name) {
              case "MediaBox":
              case "CropBox":
              case "BleedBox":
              case "TrimBox":
              case "ArtBox":
                prefValue = value.name;
                break;

              default:
                prefValue = "CropBox";
            }

            break;

          case "PrintScaling":
            switch (value.name) {
              case "None":
              case "AppDefault":
                prefValue = value.name;
                break;

              default:
                prefValue = "AppDefault";
            }

            break;

          case "Duplex":
            switch (value.name) {
              case "Simplex":
              case "DuplexFlipShortEdge":
              case "DuplexFlipLongEdge":
                prefValue = value.name;
                break;

              default:
                prefValue = "None";
            }

            break;

          case "PrintPageRange":
            const length = value.length;

            if (length % 2 !== 0) {
              break;
            }

            const isValid = value.every((page, i, arr) => {
              return Number.isInteger(page) && page > 0 && (i === 0 || page >= arr[i - 1]) && page <= this.numPages;
            });

            if (isValid) {
              prefValue = value;
            }

            break;

          case "NumCopies":
            if (value > 0) {
              prefValue = value;
            }

            break;

          default:
            if (typeof value !== "boolean") {
              throw new _util.FormatError(`viewerPreferences - expected a boolean value for: ${key}`);
            }

            prefValue = value;
        }

        if (prefValue !== undefined) {
          if (!prefs) {
            prefs = Object.create(null);
          }

          prefs[key] = prefValue;
        } else {
          (0, _util.info)(`Bad value in ViewerPreferences for "${key}".`);
        }
      }
    }

    return (0, _util.shadow)(this, "viewerPreferences", prefs);
  }

  get openAction() {
    const obj = this._catDict.get("OpenAction");

    let openAction = null;

    if ((0, _primitives.isDict)(obj)) {
      const destDict = new _primitives.Dict(this.xref);
      destDict.set("A", obj);
      const resultObj = {
        url: null,
        dest: null,
        action: null
      };
      Catalog.parseDestDictionary({
        destDict,
        resultObj
      });

      if (Array.isArray(resultObj.dest)) {
        if (!openAction) {
          openAction = Object.create(null);
        }

        openAction.dest = resultObj.dest;
      } else if (resultObj.action) {
        if (!openAction) {
          openAction = Object.create(null);
        }

        openAction.action = resultObj.action;
      }
    } else if (Array.isArray(obj)) {
      if (!openAction) {
        openAction = Object.create(null);
      }

      openAction.dest = obj;
    }

    return (0, _util.shadow)(this, "openAction", openAction);
  }

  get attachments() {
    const obj = this._catDict.get("Names");

    let attachments = null;

    if (obj && obj.has("EmbeddedFiles")) {
      const nameTree = new NameTree(obj.getRaw("EmbeddedFiles"), this.xref);
      const names = nameTree.getAll();

      for (const name in names) {
        const fs = new FileSpec(names[name], this.xref);

        if (!attachments) {
          attachments = Object.create(null);
        }

        attachments[(0, _util.stringToPDFString)(name)] = fs.serializable;
      }
    }

    return (0, _util.shadow)(this, "attachments", attachments);
  }

  get javaScript() {
    const obj = this._catDict.get("Names");

    let javaScript = null;

    function appendIfJavaScriptDict(jsDict) {
      const type = jsDict.get("S");

      if (!(0, _primitives.isName)(type, "JavaScript")) {
        return;
      }

      let js = jsDict.get("JS");

      if ((0, _primitives.isStream)(js)) {
        js = (0, _util.bytesToString)(js.getBytes());
      } else if (!(0, _util.isString)(js)) {
        return;
      }

      if (!javaScript) {
        javaScript = [];
      }

      javaScript.push((0, _util.stringToPDFString)(js));
    }

    if (obj && obj.has("JavaScript")) {
      const nameTree = new NameTree(obj.getRaw("JavaScript"), this.xref);
      const names = nameTree.getAll();

      for (const name in names) {
        const jsDict = names[name];

        if ((0, _primitives.isDict)(jsDict)) {
          appendIfJavaScriptDict(jsDict);
        }
      }
    }

    const openAction = this._catDict.get("OpenAction");

    if ((0, _primitives.isDict)(openAction) && (0, _primitives.isName)(openAction.get("S"), "JavaScript")) {
      appendIfJavaScriptDict(openAction);
    }

    return (0, _util.shadow)(this, "javaScript", javaScript);
  }

  fontFallback(id, handler) {
    const promises = [];
    this.fontCache.forEach(function (promise) {
      promises.push(promise);
    });
    return Promise.all(promises).then(translatedFonts => {
      for (const translatedFont of translatedFonts) {
        if (translatedFont.loadedName === id) {
          translatedFont.fallback(handler);
          return;
        }
      }
    });
  }

  cleanup(manuallyTriggered = false) {
    (0, _primitives.clearPrimitiveCaches)();
    this.globalImageCache.clear(manuallyTriggered);
    this.pageKidsCountCache.clear();
    const promises = [];
    this.fontCache.forEach(function (promise) {
      promises.push(promise);
    });
    return Promise.all(promises).then(translatedFonts => {
      for (const {
        dict
      } of translatedFonts) {
        delete dict.translated;
      }

      this.fontCache.clear();
      this.builtInCMapCache.clear();
    });
  }

  getPageDict(pageIndex) {
    const capability = (0, _util.createPromiseCapability)();
    const nodesToVisit = [this._catDict.getRaw("Pages")];
    const visitedNodes = new _primitives.RefSet();
    const xref = this.xref,
          pageKidsCountCache = this.pageKidsCountCache;
    let count,
        currentPageIndex = 0;

    function next() {
      while (nodesToVisit.length) {
        const currentNode = nodesToVisit.pop();

        if ((0, _primitives.isRef)(currentNode)) {
          count = pageKidsCountCache.get(currentNode);

          if (count > 0 && currentPageIndex + count < pageIndex) {
            currentPageIndex += count;
            continue;
          }

          if (visitedNodes.has(currentNode)) {
            capability.reject(new _util.FormatError("Pages tree contains circular reference."));
            return;
          }

          visitedNodes.put(currentNode);
          xref.fetchAsync(currentNode).then(function (obj) {
            if ((0, _primitives.isDict)(obj, "Page") || (0, _primitives.isDict)(obj) && !obj.has("Kids")) {
              if (pageIndex === currentPageIndex) {
                if (currentNode && !pageKidsCountCache.has(currentNode)) {
                  pageKidsCountCache.put(currentNode, 1);
                }

                capability.resolve([obj, currentNode]);
              } else {
                currentPageIndex++;
                next();
              }

              return;
            }

            nodesToVisit.push(obj);
            next();
          }, capability.reject);
          return;
        }

        if (!(0, _primitives.isDict)(currentNode)) {
          capability.reject(new _util.FormatError("Page dictionary kid reference points to wrong type of object."));
          return;
        }

        count = currentNode.get("Count");

        if (Number.isInteger(count) && count >= 0) {
          const objId = currentNode.objId;

          if (objId && !pageKidsCountCache.has(objId)) {
            pageKidsCountCache.put(objId, count);
          }

          if (currentPageIndex + count <= pageIndex) {
            currentPageIndex += count;
            continue;
          }
        }

        const kids = currentNode.get("Kids");

        if (!Array.isArray(kids)) {
          if ((0, _primitives.isName)(currentNode.get("Type"), "Page") || !currentNode.has("Type") && currentNode.has("Contents")) {
            if (currentPageIndex === pageIndex) {
              capability.resolve([currentNode, null]);
              return;
            }

            currentPageIndex++;
            continue;
          }

          capability.reject(new _util.FormatError("Page dictionary kids object is not an array."));
          return;
        }

        for (let last = kids.length - 1; last >= 0; last--) {
          nodesToVisit.push(kids[last]);
        }
      }

      capability.reject(new Error(`Page index ${pageIndex} not found.`));
    }

    next();
    return capability.promise;
  }

  getPageIndex(pageRef) {
    const xref = this.xref;

    function pagesBeforeRef(kidRef) {
      let total = 0,
          parentRef;
      return xref.fetchAsync(kidRef).then(function (node) {
        if ((0, _primitives.isRefsEqual)(kidRef, pageRef) && !(0, _primitives.isDict)(node, "Page") && !((0, _primitives.isDict)(node) && !node.has("Type") && node.has("Contents"))) {
          throw new _util.FormatError("The reference does not point to a /Page dictionary.");
        }

        if (!node) {
          return null;
        }

        if (!(0, _primitives.isDict)(node)) {
          throw new _util.FormatError("Node must be a dictionary.");
        }

        parentRef = node.getRaw("Parent");
        return node.getAsync("Parent");
      }).then(function (parent) {
        if (!parent) {
          return null;
        }

        if (!(0, _primitives.isDict)(parent)) {
          throw new _util.FormatError("Parent must be a dictionary.");
        }

        return parent.getAsync("Kids");
      }).then(function (kids) {
        if (!kids) {
          return null;
        }

        const kidPromises = [];
        let found = false;

        for (let i = 0, ii = kids.length; i < ii; i++) {
          const kid = kids[i];

          if (!(0, _primitives.isRef)(kid)) {
            throw new _util.FormatError("Kid must be a reference.");
          }

          if ((0, _primitives.isRefsEqual)(kid, kidRef)) {
            found = true;
            break;
          }

          kidPromises.push(xref.fetchAsync(kid).then(function (obj) {
            if (!(0, _primitives.isDict)(obj)) {
              throw new _util.FormatError("Kid node must be a dictionary.");
            }

            if (obj.has("Count")) {
              total += obj.get("Count");
            } else {
              total++;
            }
          }));
        }

        if (!found) {
          throw new _util.FormatError("Kid reference not found in parent's kids.");
        }

        return Promise.all(kidPromises).then(function () {
          return [total, parentRef];
        });
      });
    }

    let total = 0;

    function next(ref) {
      return pagesBeforeRef(ref).then(function (args) {
        if (!args) {
          return total;
        }

        const [count, parentRef] = args;
        total += count;
        return next(parentRef);
      });
    }

    return next(pageRef);
  }

  static parseDestDictionary(params) {
    function addDefaultProtocolToUrl(url) {
      return url.startsWith("www.") ? `http://${url}` : url;
    }

    function tryConvertUrlEncoding(url) {
      try {
        return (0, _util.stringToUTF8String)(url);
      } catch (e) {
        return url;
      }
    }

    const destDict = params.destDict;

    if (!(0, _primitives.isDict)(destDict)) {
      (0, _util.warn)("parseDestDictionary: `destDict` must be a dictionary.");
      return;
    }

    const resultObj = params.resultObj;

    if (typeof resultObj !== "object") {
      (0, _util.warn)("parseDestDictionary: `resultObj` must be an object.");
      return;
    }

    const docBaseUrl = params.docBaseUrl || null;
    let action = destDict.get("A"),
        url,
        dest;

    if (!(0, _primitives.isDict)(action) && destDict.has("Dest")) {
      action = destDict.get("Dest");
    }

    if ((0, _primitives.isDict)(action)) {
      const actionType = action.get("S");

      if (!(0, _primitives.isName)(actionType)) {
        (0, _util.warn)("parseDestDictionary: Invalid type in Action dictionary.");
        return;
      }

      const actionName = actionType.name;

      switch (actionName) {
        case "URI":
          url = action.get("URI");

          if ((0, _primitives.isName)(url)) {
            url = "/" + url.name;
          } else if ((0, _util.isString)(url)) {
            url = addDefaultProtocolToUrl(url);
          }

          break;

        case "GoTo":
          dest = action.get("D");
          break;

        case "Launch":
        case "GoToR":
          const urlDict = action.get("F");

          if ((0, _primitives.isDict)(urlDict)) {
            url = urlDict.get("F") || null;
          } else if ((0, _util.isString)(urlDict)) {
            url = urlDict;
          }

          let remoteDest = action.get("D");

          if (remoteDest) {
            if ((0, _primitives.isName)(remoteDest)) {
              remoteDest = remoteDest.name;
            }

            if ((0, _util.isString)(url)) {
              const baseUrl = url.split("#")[0];

              if ((0, _util.isString)(remoteDest)) {
                url = baseUrl + "#" + remoteDest;
              } else if (Array.isArray(remoteDest)) {
                url = baseUrl + "#" + JSON.stringify(remoteDest);
              }
            }
          }

          const newWindow = action.get("NewWindow");

          if ((0, _util.isBool)(newWindow)) {
            resultObj.newWindow = newWindow;
          }

          break;

        case "Named":
          const namedAction = action.get("N");

          if ((0, _primitives.isName)(namedAction)) {
            resultObj.action = namedAction.name;
          }

          break;

        case "JavaScript":
          const jsAction = action.get("JS");
          let js;

          if ((0, _primitives.isStream)(jsAction)) {
            js = (0, _util.bytesToString)(jsAction.getBytes());
          } else if ((0, _util.isString)(jsAction)) {
            js = jsAction;
          }

          if (js) {
            const URL_OPEN_METHODS = ["app.launchURL", "window.open"];
            const regex = new RegExp("^\\s*(" + URL_OPEN_METHODS.join("|").split(".").join("\\.") + ")\\((?:'|\")([^'\"]*)(?:'|\")(?:,\\s*(\\w+)\\)|\\))", "i");
            const jsUrl = regex.exec((0, _util.stringToPDFString)(js));

            if (jsUrl && jsUrl[2]) {
              url = jsUrl[2];

              if (jsUrl[3] === "true" && jsUrl[1] === "app.launchURL") {
                resultObj.newWindow = true;
              }

              break;
            }
          }

        default:
          (0, _util.warn)(`parseDestDictionary: unsupported action type "${actionName}".`);
          break;
      }
    } else if (destDict.has("Dest")) {
      dest = destDict.get("Dest");
    }

    if ((0, _util.isString)(url)) {
      url = tryConvertUrlEncoding(url);
      const absoluteUrl = (0, _util.createValidAbsoluteUrl)(url, docBaseUrl);

      if (absoluteUrl) {
        resultObj.url = absoluteUrl.href;
      }

      resultObj.unsafeUrl = url;
    }

    if (dest) {
      if ((0, _primitives.isName)(dest)) {
        dest = dest.name;
      }

      if ((0, _util.isString)(dest) || Array.isArray(dest)) {
        resultObj.dest = dest;
      }
    }
  }

}

exports.Catalog = Catalog;

var XRef = function XRefClosure() {
  function XRef(stream, pdfManager) {
    this.stream = stream;
    this.pdfManager = pdfManager;
    this.entries = [];
    this.xrefstms = Object.create(null);
    this._cacheMap = new Map();
    this.stats = {
      streamTypes: Object.create(null),
      fontTypes: Object.create(null)
    };
    this._newRefNum = null;
  }

  XRef.prototype = {
    getNewRef: function XRef_getNewRef() {
      if (this._newRefNum === null) {
        this._newRefNum = this.entries.length;
      }

      return _primitives.Ref.get(this._newRefNum++, 0);
    },
    resetNewRef: function XRef_resetNewRef() {
      this._newRefNum = null;
    },
    setStartXRef: function XRef_setStartXRef(startXRef) {
      this.startXRefQueue = [startXRef];
    },
    parse: function XRef_parse(recoveryMode) {
      var trailerDict;

      if (!recoveryMode) {
        trailerDict = this.readXRef();
      } else {
        (0, _util.warn)("Indexing all PDF objects");
        trailerDict = this.indexObjects();
      }

      trailerDict.assignXref(this);
      this.trailer = trailerDict;
      let encrypt;

      try {
        encrypt = trailerDict.get("Encrypt");
      } catch (ex) {
        if (ex instanceof _core_utils.MissingDataException) {
          throw ex;
        }

        (0, _util.warn)(`XRef.parse - Invalid "Encrypt" reference: "${ex}".`);
      }

      if ((0, _primitives.isDict)(encrypt)) {
        var ids = trailerDict.get("ID");
        var fileId = ids && ids.length ? ids[0] : "";
        encrypt.suppressEncryption = true;
        this.encrypt = new _crypto.CipherTransformFactory(encrypt, fileId, this.pdfManager.password);
      }

      let root;

      try {
        root = trailerDict.get("Root");
      } catch (ex) {
        if (ex instanceof _core_utils.MissingDataException) {
          throw ex;
        }

        (0, _util.warn)(`XRef.parse - Invalid "Root" reference: "${ex}".`);
      }

      if ((0, _primitives.isDict)(root) && root.has("Pages")) {
        this.root = root;
      } else {
        if (!recoveryMode) {
          throw new _core_utils.XRefParseException();
        }

        throw new _util.FormatError("Invalid root reference");
      }
    },
    processXRefTable: function XRef_processXRefTable(parser) {
      if (!("tableState" in this)) {
        this.tableState = {
          entryNum: 0,
          streamPos: parser.lexer.stream.pos,
          parserBuf1: parser.buf1,
          parserBuf2: parser.buf2
        };
      }

      var obj = this.readXRefTable(parser);

      if (!(0, _primitives.isCmd)(obj, "trailer")) {
        throw new _util.FormatError("Invalid XRef table: could not find trailer dictionary");
      }

      var dict = parser.getObj();

      if (!(0, _primitives.isDict)(dict) && dict.dict) {
        dict = dict.dict;
      }

      if (!(0, _primitives.isDict)(dict)) {
        throw new _util.FormatError("Invalid XRef table: could not parse trailer dictionary");
      }

      delete this.tableState;
      return dict;
    },
    readXRefTable: function XRef_readXRefTable(parser) {
      var stream = parser.lexer.stream;
      var tableState = this.tableState;
      stream.pos = tableState.streamPos;
      parser.buf1 = tableState.parserBuf1;
      parser.buf2 = tableState.parserBuf2;
      var obj;

      while (true) {
        if (!("firstEntryNum" in tableState) || !("entryCount" in tableState)) {
          if ((0, _primitives.isCmd)(obj = parser.getObj(), "trailer")) {
            break;
          }

          tableState.firstEntryNum = obj;
          tableState.entryCount = parser.getObj();
        }

        var first = tableState.firstEntryNum;
        var count = tableState.entryCount;

        if (!Number.isInteger(first) || !Number.isInteger(count)) {
          throw new _util.FormatError("Invalid XRef table: wrong types in subsection header");
        }

        for (var i = tableState.entryNum; i < count; i++) {
          tableState.streamPos = stream.pos;
          tableState.entryNum = i;
          tableState.parserBuf1 = parser.buf1;
          tableState.parserBuf2 = parser.buf2;
          var entry = {};
          entry.offset = parser.getObj();
          entry.gen = parser.getObj();
          var type = parser.getObj();

          if (type instanceof _primitives.Cmd) {
            switch (type.cmd) {
              case "f":
                entry.free = true;
                break;

              case "n":
                entry.uncompressed = true;
                break;
            }
          }

          if (!Number.isInteger(entry.offset) || !Number.isInteger(entry.gen) || !(entry.free || entry.uncompressed)) {
            throw new _util.FormatError(`Invalid entry in XRef subsection: ${first}, ${count}`);
          }

          if (i === 0 && entry.free && first === 1) {
            first = 0;
          }

          if (!this.entries[i + first]) {
            this.entries[i + first] = entry;
          }
        }

        tableState.entryNum = 0;
        tableState.streamPos = stream.pos;
        tableState.parserBuf1 = parser.buf1;
        tableState.parserBuf2 = parser.buf2;
        delete tableState.firstEntryNum;
        delete tableState.entryCount;
      }

      if (this.entries[0] && !this.entries[0].free) {
        throw new _util.FormatError("Invalid XRef table: unexpected first object");
      }

      return obj;
    },
    processXRefStream: function XRef_processXRefStream(stream) {
      if (!("streamState" in this)) {
        var streamParameters = stream.dict;
        var byteWidths = streamParameters.get("W");
        var range = streamParameters.get("Index");

        if (!range) {
          range = [0, streamParameters.get("Size")];
        }

        this.streamState = {
          entryRanges: range,
          byteWidths,
          entryNum: 0,
          streamPos: stream.pos
        };
      }

      this.readXRefStream(stream);
      delete this.streamState;
      return stream.dict;
    },
    readXRefStream: function XRef_readXRefStream(stream) {
      var i, j;
      var streamState = this.streamState;
      stream.pos = streamState.streamPos;
      var byteWidths = streamState.byteWidths;
      var typeFieldWidth = byteWidths[0];
      var offsetFieldWidth = byteWidths[1];
      var generationFieldWidth = byteWidths[2];
      var entryRanges = streamState.entryRanges;

      while (entryRanges.length > 0) {
        var first = entryRanges[0];
        var n = entryRanges[1];

        if (!Number.isInteger(first) || !Number.isInteger(n)) {
          throw new _util.FormatError(`Invalid XRef range fields: ${first}, ${n}`);
        }

        if (!Number.isInteger(typeFieldWidth) || !Number.isInteger(offsetFieldWidth) || !Number.isInteger(generationFieldWidth)) {
          throw new _util.FormatError(`Invalid XRef entry fields length: ${first}, ${n}`);
        }

        for (i = streamState.entryNum; i < n; ++i) {
          streamState.entryNum = i;
          streamState.streamPos = stream.pos;
          var type = 0,
              offset = 0,
              generation = 0;

          for (j = 0; j < typeFieldWidth; ++j) {
            type = type << 8 | stream.getByte();
          }

          if (typeFieldWidth === 0) {
            type = 1;
          }

          for (j = 0; j < offsetFieldWidth; ++j) {
            offset = offset << 8 | stream.getByte();
          }

          for (j = 0; j < generationFieldWidth; ++j) {
            generation = generation << 8 | stream.getByte();
          }

          var entry = {};
          entry.offset = offset;
          entry.gen = generation;

          switch (type) {
            case 0:
              entry.free = true;
              break;

            case 1:
              entry.uncompressed = true;
              break;

            case 2:
              break;

            default:
              throw new _util.FormatError(`Invalid XRef entry type: ${type}`);
          }

          if (!this.entries[first + i]) {
            this.entries[first + i] = entry;
          }
        }

        streamState.entryNum = 0;
        streamState.streamPos = stream.pos;
        entryRanges.splice(0, 2);
      }
    },
    indexObjects: function XRef_indexObjects() {
      var TAB = 0x9,
          LF = 0xa,
          CR = 0xd,
          SPACE = 0x20;
      var PERCENT = 0x25,
          LT = 0x3c;

      function readToken(data, offset) {
        var token = "",
            ch = data[offset];

        while (ch !== LF && ch !== CR && ch !== LT) {
          if (++offset >= data.length) {
            break;
          }

          token += String.fromCharCode(ch);
          ch = data[offset];
        }

        return token;
      }

      function skipUntil(data, offset, what) {
        var length = what.length,
            dataLength = data.length;
        var skipped = 0;

        while (offset < dataLength) {
          var i = 0;

          while (i < length && data[offset + i] === what[i]) {
            ++i;
          }

          if (i >= length) {
            break;
          }

          offset++;
          skipped++;
        }

        return skipped;
      }

      var objRegExp = /^(\d+)\s+(\d+)\s+obj\b/;
      const endobjRegExp = /\bendobj[\b\s]$/;
      const nestedObjRegExp = /\s+(\d+\s+\d+\s+obj[\b\s<])$/;
      const CHECK_CONTENT_LENGTH = 25;
      var trailerBytes = new Uint8Array([116, 114, 97, 105, 108, 101, 114]);
      var startxrefBytes = new Uint8Array([115, 116, 97, 114, 116, 120, 114, 101, 102]);
      const objBytes = new Uint8Array([111, 98, 106]);
      var xrefBytes = new Uint8Array([47, 88, 82, 101, 102]);
      this.entries.length = 0;
      var stream = this.stream;
      stream.pos = 0;
      var buffer = stream.getBytes();
      var position = stream.start,
          length = buffer.length;
      var trailers = [],
          xrefStms = [];

      while (position < length) {
        var ch = buffer[position];

        if (ch === TAB || ch === LF || ch === CR || ch === SPACE) {
          ++position;
          continue;
        }

        if (ch === PERCENT) {
          do {
            ++position;

            if (position >= length) {
              break;
            }

            ch = buffer[position];
          } while (ch !== LF && ch !== CR);

          continue;
        }

        var token = readToken(buffer, position);
        var m;

        if (token.startsWith("xref") && (token.length === 4 || /\s/.test(token[4]))) {
          position += skipUntil(buffer, position, trailerBytes);
          trailers.push(position);
          position += skipUntil(buffer, position, startxrefBytes);
        } else if (m = objRegExp.exec(token)) {
          const num = m[1] | 0,
                gen = m[2] | 0;

          if (!this.entries[num] || this.entries[num].gen === gen) {
            this.entries[num] = {
              offset: position - stream.start,
              gen,
              uncompressed: true
            };
          }

          let contentLength,
              startPos = position + token.length;

          while (startPos < buffer.length) {
            const endPos = startPos + skipUntil(buffer, startPos, objBytes) + 4;
            contentLength = endPos - position;
            const checkPos = Math.max(endPos - CHECK_CONTENT_LENGTH, startPos);
            const tokenStr = (0, _util.bytesToString)(buffer.subarray(checkPos, endPos));

            if (endobjRegExp.test(tokenStr)) {
              break;
            } else {
              const objToken = nestedObjRegExp.exec(tokenStr);

              if (objToken && objToken[1]) {
                (0, _util.warn)('indexObjects: Found new "obj" inside of another "obj", ' + 'caused by missing "endobj" -- trying to recover.');
                contentLength -= objToken[1].length;
                break;
              }
            }

            startPos = endPos;
          }

          const content = buffer.subarray(position, position + contentLength);
          var xrefTagOffset = skipUntil(content, 0, xrefBytes);

          if (xrefTagOffset < contentLength && content[xrefTagOffset + 5] < 64) {
            xrefStms.push(position - stream.start);
            this.xrefstms[position - stream.start] = 1;
          }

          position += contentLength;
        } else if (token.startsWith("trailer") && (token.length === 7 || /\s/.test(token[7]))) {
          trailers.push(position);
          position += skipUntil(buffer, position, startxrefBytes);
        } else {
          position += token.length + 1;
        }
      }

      var i, ii;

      for (i = 0, ii = xrefStms.length; i < ii; ++i) {
        this.startXRefQueue.push(xrefStms[i]);
        this.readXRef(true);
      }

      let trailerDict;

      for (i = 0, ii = trailers.length; i < ii; ++i) {
        stream.pos = trailers[i];
        const parser = new _parser.Parser({
          lexer: new _parser.Lexer(stream),
          xref: this,
          allowStreams: true,
          recoveryMode: true
        });
        var obj = parser.getObj();

        if (!(0, _primitives.isCmd)(obj, "trailer")) {
          continue;
        }

        const dict = parser.getObj();

        if (!(0, _primitives.isDict)(dict)) {
          continue;
        }

        let rootDict;

        try {
          rootDict = dict.get("Root");
        } catch (ex) {
          if (ex instanceof _core_utils.MissingDataException) {
            throw ex;
          }

          continue;
        }

        if (!(0, _primitives.isDict)(rootDict) || !rootDict.has("Pages")) {
          continue;
        }

        if (dict.has("ID")) {
          return dict;
        }

        trailerDict = dict;
      }

      if (trailerDict) {
        return trailerDict;
      }

      throw new _util.InvalidPDFException("Invalid PDF structure.");
    },
    readXRef: function XRef_readXRef(recoveryMode) {
      var stream = this.stream;
      const startXRefParsedCache = Object.create(null);

      try {
        while (this.startXRefQueue.length) {
          var startXRef = this.startXRefQueue[0];

          if (startXRefParsedCache[startXRef]) {
            (0, _util.warn)("readXRef - skipping XRef table since it was already parsed.");
            this.startXRefQueue.shift();
            continue;
          }

          startXRefParsedCache[startXRef] = true;
          stream.pos = startXRef + stream.start;
          const parser = new _parser.Parser({
            lexer: new _parser.Lexer(stream),
            xref: this,
            allowStreams: true
          });
          var obj = parser.getObj();
          var dict;

          if ((0, _primitives.isCmd)(obj, "xref")) {
            dict = this.processXRefTable(parser);

            if (!this.topDict) {
              this.topDict = dict;
            }

            obj = dict.get("XRefStm");

            if (Number.isInteger(obj)) {
              var pos = obj;

              if (!(pos in this.xrefstms)) {
                this.xrefstms[pos] = 1;
                this.startXRefQueue.push(pos);
              }
            }
          } else if (Number.isInteger(obj)) {
            if (!Number.isInteger(parser.getObj()) || !(0, _primitives.isCmd)(parser.getObj(), "obj") || !(0, _primitives.isStream)(obj = parser.getObj())) {
              throw new _util.FormatError("Invalid XRef stream");
            }

            dict = this.processXRefStream(obj);

            if (!this.topDict) {
              this.topDict = dict;
            }

            if (!dict) {
              throw new _util.FormatError("Failed to read XRef stream");
            }
          } else {
            throw new _util.FormatError("Invalid XRef stream header");
          }

          obj = dict.get("Prev");

          if (Number.isInteger(obj)) {
            this.startXRefQueue.push(obj);
          } else if ((0, _primitives.isRef)(obj)) {
            this.startXRefQueue.push(obj.num);
          }

          this.startXRefQueue.shift();
        }

        return this.topDict;
      } catch (e) {
        if (e instanceof _core_utils.MissingDataException) {
          throw e;
        }

        (0, _util.info)("(while reading XRef): " + e);
      }

      if (recoveryMode) {
        return undefined;
      }

      throw new _core_utils.XRefParseException();
    },
    getEntry: function XRef_getEntry(i) {
      var xrefEntry = this.entries[i];

      if (xrefEntry && !xrefEntry.free && xrefEntry.offset) {
        return xrefEntry;
      }

      return null;
    },
    fetchIfRef: function XRef_fetchIfRef(obj, suppressEncryption) {
      if (obj instanceof _primitives.Ref) {
        return this.fetch(obj, suppressEncryption);
      }

      return obj;
    },
    fetch: function XRef_fetch(ref, suppressEncryption) {
      if (!(ref instanceof _primitives.Ref)) {
        throw new Error("ref object is not a reference");
      }

      const num = ref.num;

      const cacheEntry = this._cacheMap.get(num);

      if (cacheEntry !== undefined) {
        if (cacheEntry instanceof _primitives.Dict && !cacheEntry.objId) {
          cacheEntry.objId = ref.toString();
        }

        return cacheEntry;
      }

      let xrefEntry = this.getEntry(num);

      if (xrefEntry === null) {
        this._cacheMap.set(num, xrefEntry);

        return xrefEntry;
      }

      if (xrefEntry.uncompressed) {
        xrefEntry = this.fetchUncompressed(ref, xrefEntry, suppressEncryption);
      } else {
        xrefEntry = this.fetchCompressed(ref, xrefEntry, suppressEncryption);
      }

      if ((0, _primitives.isDict)(xrefEntry)) {
        xrefEntry.objId = ref.toString();
      } else if ((0, _primitives.isStream)(xrefEntry)) {
        xrefEntry.dict.objId = ref.toString();
      }

      return xrefEntry;
    },

    fetchUncompressed(ref, xrefEntry, suppressEncryption = false) {
      var gen = ref.gen;
      var num = ref.num;

      if (xrefEntry.gen !== gen) {
        throw new _core_utils.XRefEntryException(`Inconsistent generation in XRef: ${ref}`);
      }

      var stream = this.stream.makeSubStream(xrefEntry.offset + this.stream.start);
      const parser = new _parser.Parser({
        lexer: new _parser.Lexer(stream),
        xref: this,
        allowStreams: true
      });
      var obj1 = parser.getObj();
      var obj2 = parser.getObj();
      var obj3 = parser.getObj();

      if (obj1 !== num || obj2 !== gen || !(obj3 instanceof _primitives.Cmd)) {
        throw new _core_utils.XRefEntryException(`Bad (uncompressed) XRef entry: ${ref}`);
      }

      if (obj3.cmd !== "obj") {
        if (obj3.cmd.startsWith("obj")) {
          num = parseInt(obj3.cmd.substring(3), 10);

          if (!Number.isNaN(num)) {
            return num;
          }
        }

        throw new _core_utils.XRefEntryException(`Bad (uncompressed) XRef entry: ${ref}`);
      }

      if (this.encrypt && !suppressEncryption) {
        xrefEntry = parser.getObj(this.encrypt.createCipherTransform(num, gen));
      } else {
        xrefEntry = parser.getObj();
      }

      if (!(0, _primitives.isStream)(xrefEntry)) {
        this._cacheMap.set(num, xrefEntry);
      }

      return xrefEntry;
    },

    fetchCompressed(ref, xrefEntry, suppressEncryption = false) {
      const tableOffset = xrefEntry.offset;
      const stream = this.fetch(_primitives.Ref.get(tableOffset, 0));

      if (!(0, _primitives.isStream)(stream)) {
        throw new _util.FormatError("bad ObjStm stream");
      }

      const first = stream.dict.get("First");
      const n = stream.dict.get("N");

      if (!Number.isInteger(first) || !Number.isInteger(n)) {
        throw new _util.FormatError("invalid first and n parameters for ObjStm stream");
      }

      const parser = new _parser.Parser({
        lexer: new _parser.Lexer(stream),
        xref: this,
        allowStreams: true
      });
      const nums = new Array(n);

      for (let i = 0; i < n; ++i) {
        const num = parser.getObj();

        if (!Number.isInteger(num)) {
          throw new _util.FormatError(`invalid object number in the ObjStm stream: ${num}`);
        }

        const offset = parser.getObj();

        if (!Number.isInteger(offset)) {
          throw new _util.FormatError(`invalid object offset in the ObjStm stream: ${offset}`);
        }

        nums[i] = num;
      }

      const entries = new Array(n);

      for (let i = 0; i < n; ++i) {
        const obj = parser.getObj();
        entries[i] = obj;

        if (parser.buf1 instanceof _primitives.Cmd && parser.buf1.cmd === "endobj") {
          parser.shift();
        }

        if ((0, _primitives.isStream)(obj)) {
          continue;
        }

        const num = nums[i],
              entry = this.entries[num];

        if (entry && entry.offset === tableOffset && entry.gen === i) {
          this._cacheMap.set(num, obj);
        }
      }

      xrefEntry = entries[xrefEntry.gen];

      if (xrefEntry === undefined) {
        throw new _core_utils.XRefEntryException(`Bad (compressed) XRef entry: ${ref}`);
      }

      return xrefEntry;
    },

    async fetchIfRefAsync(obj, suppressEncryption) {
      if (obj instanceof _primitives.Ref) {
        return this.fetchAsync(obj, suppressEncryption);
      }

      return obj;
    },

    async fetchAsync(ref, suppressEncryption) {
      try {
        return this.fetch(ref, suppressEncryption);
      } catch (ex) {
        if (!(ex instanceof _core_utils.MissingDataException)) {
          throw ex;
        }

        await this.pdfManager.requestRange(ex.begin, ex.end);
        return this.fetchAsync(ref, suppressEncryption);
      }
    },

    getCatalogObj: function XRef_getCatalogObj() {
      return this.root;
    }
  };
  return XRef;
}();

exports.XRef = XRef;

class NameOrNumberTree {
  constructor(root, xref, type) {
    if (this.constructor === NameOrNumberTree) {
      (0, _util.unreachable)("Cannot initialize NameOrNumberTree.");
    }

    this.root = root;
    this.xref = xref;
    this._type = type;
  }

  getAll() {
    const dict = Object.create(null);

    if (!this.root) {
      return dict;
    }

    const xref = this.xref;
    const processed = new _primitives.RefSet();
    processed.put(this.root);
    const queue = [this.root];

    while (queue.length > 0) {
      const obj = xref.fetchIfRef(queue.shift());

      if (!(0, _primitives.isDict)(obj)) {
        continue;
      }

      if (obj.has("Kids")) {
        const kids = obj.get("Kids");

        for (let i = 0, ii = kids.length; i < ii; i++) {
          const kid = kids[i];

          if (processed.has(kid)) {
            throw new _util.FormatError(`Duplicate entry in "${this._type}" tree.`);
          }

          queue.push(kid);
          processed.put(kid);
        }

        continue;
      }

      const entries = obj.get(this._type);

      if (Array.isArray(entries)) {
        for (let i = 0, ii = entries.length; i < ii; i += 2) {
          dict[xref.fetchIfRef(entries[i])] = xref.fetchIfRef(entries[i + 1]);
        }
      }
    }

    return dict;
  }

  get(key) {
    if (!this.root) {
      return null;
    }

    const xref = this.xref;
    let kidsOrEntries = xref.fetchIfRef(this.root);
    let loopCount = 0;
    const MAX_LEVELS = 10;

    while (kidsOrEntries.has("Kids")) {
      if (++loopCount > MAX_LEVELS) {
        (0, _util.warn)(`Search depth limit reached for "${this._type}" tree.`);
        return null;
      }

      const kids = kidsOrEntries.get("Kids");

      if (!Array.isArray(kids)) {
        return null;
      }

      let l = 0,
          r = kids.length - 1;

      while (l <= r) {
        const m = l + r >> 1;
        const kid = xref.fetchIfRef(kids[m]);
        const limits = kid.get("Limits");

        if (key < xref.fetchIfRef(limits[0])) {
          r = m - 1;
        } else if (key > xref.fetchIfRef(limits[1])) {
          l = m + 1;
        } else {
          kidsOrEntries = xref.fetchIfRef(kids[m]);
          break;
        }
      }

      if (l > r) {
        return null;
      }
    }

    const entries = kidsOrEntries.get(this._type);

    if (Array.isArray(entries)) {
      let l = 0,
          r = entries.length - 2;

      while (l <= r) {
        const tmp = l + r >> 1,
              m = tmp + (tmp & 1);
        const currentKey = xref.fetchIfRef(entries[m]);

        if (key < currentKey) {
          r = m - 2;
        } else if (key > currentKey) {
          l = m + 2;
        } else {
          return xref.fetchIfRef(entries[m + 1]);
        }
      }

      (0, _util.info)(`Falling back to an exhaustive search, for key "${key}", ` + `in "${this._type}" tree.`);

      for (let m = 0, mm = entries.length; m < mm; m += 2) {
        const currentKey = xref.fetchIfRef(entries[m]);

        if (currentKey === key) {
          (0, _util.warn)(`The "${key}" key was found at an incorrect, ` + `i.e. out-of-order, position in "${this._type}" tree.`);
          return xref.fetchIfRef(entries[m + 1]);
        }
      }
    }

    return null;
  }

}

class NameTree extends NameOrNumberTree {
  constructor(root, xref) {
    super(root, xref, "Names");
  }

}

class NumberTree extends NameOrNumberTree {
  constructor(root, xref) {
    super(root, xref, "Nums");
  }

}

var FileSpec = function FileSpecClosure() {
  function FileSpec(root, xref) {
    if (!root || !(0, _primitives.isDict)(root)) {
      return;
    }

    this.xref = xref;
    this.root = root;

    if (root.has("FS")) {
      this.fs = root.get("FS");
    }

    this.description = root.has("Desc") ? (0, _util.stringToPDFString)(root.get("Desc")) : "";

    if (root.has("RF")) {
      (0, _util.warn)("Related file specifications are not supported");
    }

    this.contentAvailable = true;

    if (!root.has("EF")) {
      this.contentAvailable = false;
      (0, _util.warn)("Non-embedded file specifications are not supported");
    }
  }

  function pickPlatformItem(dict) {
    if (dict.has("UF")) {
      return dict.get("UF");
    } else if (dict.has("F")) {
      return dict.get("F");
    } else if (dict.has("Unix")) {
      return dict.get("Unix");
    } else if (dict.has("Mac")) {
      return dict.get("Mac");
    } else if (dict.has("DOS")) {
      return dict.get("DOS");
    }

    return null;
  }

  FileSpec.prototype = {
    get filename() {
      if (!this._filename && this.root) {
        var filename = pickPlatformItem(this.root) || "unnamed";
        this._filename = (0, _util.stringToPDFString)(filename).replace(/\\\\/g, "\\").replace(/\\\//g, "/").replace(/\\/g, "/");
      }

      return this._filename;
    },

    get content() {
      if (!this.contentAvailable) {
        return null;
      }

      if (!this.contentRef && this.root) {
        this.contentRef = pickPlatformItem(this.root.get("EF"));
      }

      var content = null;

      if (this.contentRef) {
        var xref = this.xref;
        var fileObj = xref.fetchIfRef(this.contentRef);

        if (fileObj && (0, _primitives.isStream)(fileObj)) {
          content = fileObj.getBytes();
        } else {
          (0, _util.warn)("Embedded file specification points to non-existing/invalid " + "content");
        }
      } else {
        (0, _util.warn)("Embedded file specification does not have a content");
      }

      return content;
    },

    get serializable() {
      return {
        filename: this.filename,
        content: this.content
      };
    }

  };
  return FileSpec;
}();

exports.FileSpec = FileSpec;

const ObjectLoader = function () {
  function mayHaveChildren(value) {
    return value instanceof _primitives.Ref || value instanceof _primitives.Dict || Array.isArray(value) || (0, _primitives.isStream)(value);
  }

  function addChildren(node, nodesToVisit) {
    if (node instanceof _primitives.Dict) {
      node = node.getRawValues();
    } else if ((0, _primitives.isStream)(node)) {
      node = node.dict.getRawValues();
    } else if (!Array.isArray(node)) {
      return;
    }

    for (const rawValue of node) {
      if (mayHaveChildren(rawValue)) {
        nodesToVisit.push(rawValue);
      }
    }
  }

  function ObjectLoader(dict, keys, xref) {
    this.dict = dict;
    this.keys = keys;
    this.xref = xref;
    this.refSet = null;
  }

  ObjectLoader.prototype = {
    async load() {
      if (!this.xref.stream.allChunksLoaded || this.xref.stream.allChunksLoaded()) {
        return undefined;
      }

      const {
        keys,
        dict
      } = this;
      this.refSet = new _primitives.RefSet();
      const nodesToVisit = [];

      for (let i = 0, ii = keys.length; i < ii; i++) {
        const rawValue = dict.getRaw(keys[i]);

        if (rawValue !== undefined) {
          nodesToVisit.push(rawValue);
        }
      }

      return this._walk(nodesToVisit);
    },

    async _walk(nodesToVisit) {
      const nodesToRevisit = [];
      const pendingRequests = [];

      while (nodesToVisit.length) {
        let currentNode = nodesToVisit.pop();

        if (currentNode instanceof _primitives.Ref) {
          if (this.refSet.has(currentNode)) {
            continue;
          }

          try {
            this.refSet.put(currentNode);
            currentNode = this.xref.fetch(currentNode);
          } catch (ex) {
            if (!(ex instanceof _core_utils.MissingDataException)) {
              throw ex;
            }

            nodesToRevisit.push(currentNode);
            pendingRequests.push({
              begin: ex.begin,
              end: ex.end
            });
          }
        }

        if (currentNode && currentNode.getBaseStreams) {
          const baseStreams = currentNode.getBaseStreams();
          let foundMissingData = false;

          for (let i = 0, ii = baseStreams.length; i < ii; i++) {
            const stream = baseStreams[i];

            if (stream.allChunksLoaded && !stream.allChunksLoaded()) {
              foundMissingData = true;
              pendingRequests.push({
                begin: stream.start,
                end: stream.end
              });
            }
          }

          if (foundMissingData) {
            nodesToRevisit.push(currentNode);
          }
        }

        addChildren(currentNode, nodesToVisit);
      }

      if (pendingRequests.length) {
        await this.xref.stream.manager.requestRanges(pendingRequests);

        for (let i = 0, ii = nodesToRevisit.length; i < ii; i++) {
          const node = nodesToRevisit[i];

          if (node instanceof _primitives.Ref) {
            this.refSet.remove(node);
          }
        }

        return this._walk(nodesToRevisit);
      }

      this.refSet = null;
      return undefined;
    }

  };
  return ObjectLoader;
}();

exports.ObjectLoader = ObjectLoader;