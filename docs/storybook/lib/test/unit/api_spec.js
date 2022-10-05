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

var _test_utils = require("./test_utils.js");

var _util = require("../../shared/util.js");

var _display_utils = require("../../display/display_utils.js");

var _api = require("../../display/api.js");

var _ui_utils = require("../../web/ui_utils.js");

var _image_utils = require("../../core/image_utils.js");

var _worker_options = require("../../display/worker_options.js");

var _is_node = require("../../shared/is_node.js");

var _metadata = require("../../display/metadata.js");

var _node_utils = require("../../display/node_utils.js");

describe("api", function () {
  const basicApiFileName = "basicapi.pdf";
  const basicApiFileLength = 105779;
  const basicApiGetDocumentParams = (0, _test_utils.buildGetDocumentParams)(basicApiFileName);
  let CanvasFactory;
  beforeAll(function (done) {
    if (_is_node.isNodeJS) {
      CanvasFactory = new _node_utils.NodeCanvasFactory();
    } else {
      CanvasFactory = new _display_utils.DOMCanvasFactory();
    }

    done();
  });
  afterAll(function (done) {
    CanvasFactory = null;
    done();
  });

  function waitSome(callback) {
    var WAIT_TIMEOUT = 10;
    setTimeout(function () {
      callback();
    }, WAIT_TIMEOUT);
  }

  describe("getDocument", function () {
    it("creates pdf doc from URL", function (done) {
      var loadingTask = (0, _api.getDocument)(basicApiGetDocumentParams);
      var progressReportedCapability = (0, _util.createPromiseCapability)();

      loadingTask.onProgress = function (progressData) {
        if (!progressReportedCapability.settled) {
          progressReportedCapability.resolve(progressData);
        }
      };

      var promises = [progressReportedCapability.promise, loadingTask.promise];
      Promise.all(promises).then(function (data) {
        expect(data[0].loaded / data[0].total >= 0).toEqual(true);
        expect(data[1] instanceof _api.PDFDocumentProxy).toEqual(true);
        expect(loadingTask).toEqual(data[1].loadingTask);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("creates pdf doc from URL and aborts before worker initialized", function (done) {
      var loadingTask = (0, _api.getDocument)(basicApiGetDocumentParams);
      const destroyed = loadingTask.destroy();
      loadingTask.promise.then(function (reason) {
        done.fail("shall fail loading");
      }).catch(function (reason) {
        expect(true).toEqual(true);
        destroyed.then(done);
      });
    });
    it("creates pdf doc from URL and aborts loading after worker initialized", function (done) {
      var loadingTask = (0, _api.getDocument)(basicApiGetDocumentParams);

      var destroyed = loadingTask._worker.promise.then(function () {
        return loadingTask.destroy();
      });

      destroyed.then(function (data) {
        expect(true).toEqual(true);
        done();
      }).catch(done.fail);
    });
    it("creates pdf doc from typed array", function (done) {
      let typedArrayPdfPromise;

      if (_is_node.isNodeJS) {
        typedArrayPdfPromise = _test_utils.NodeFileReaderFactory.fetch({
          path: _test_utils.TEST_PDFS_PATH.node + basicApiFileName
        });
      } else {
        typedArrayPdfPromise = _test_utils.DOMFileReaderFactory.fetch({
          path: _test_utils.TEST_PDFS_PATH.dom + basicApiFileName
        });
      }

      typedArrayPdfPromise.then(typedArrayPdf => {
        expect(typedArrayPdf.length).toEqual(basicApiFileLength);
        const loadingTask = (0, _api.getDocument)(typedArrayPdf);
        const progressReportedCapability = (0, _util.createPromiseCapability)();

        loadingTask.onProgress = function (data) {
          progressReportedCapability.resolve(data);
        };

        return Promise.all([loadingTask.promise, progressReportedCapability.promise]).then(function (data) {
          expect(data[0] instanceof _api.PDFDocumentProxy).toEqual(true);
          expect(data[1].loaded / data[1].total).toEqual(1);
          loadingTask.destroy().then(done);
        });
      }).catch(done.fail);
    });
    it("creates pdf doc from invalid PDF file", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("bug1020226.pdf"));
      loadingTask.promise.then(function () {
        done.fail("shall fail loading");
      }).catch(function (reason) {
        expect(reason instanceof _util.InvalidPDFException).toEqual(true);
        expect(reason.message).toEqual("Invalid PDF structure.");
        loadingTask.destroy().then(done);
      });
    });
    it("creates pdf doc from non-existent URL", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("non-existent.pdf"));
      loadingTask.promise.then(function (error) {
        done.fail("shall fail loading");
      }).catch(function (error) {
        expect(error instanceof _util.MissingPDFException).toEqual(true);
        loadingTask.destroy().then(done);
      });
    });
    it("creates pdf doc from PDF file protected with user and owner password", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("pr6531_1.pdf"));
      var passwordNeededCapability = (0, _util.createPromiseCapability)();
      var passwordIncorrectCapability = (0, _util.createPromiseCapability)();

      loadingTask.onPassword = function (updatePassword, reason) {
        if (reason === _util.PasswordResponses.NEED_PASSWORD && !passwordNeededCapability.settled) {
          passwordNeededCapability.resolve();
          updatePassword("qwerty");
          return;
        }

        if (reason === _util.PasswordResponses.INCORRECT_PASSWORD && !passwordIncorrectCapability.settled) {
          passwordIncorrectCapability.resolve();
          updatePassword("asdfasdf");
          return;
        }

        expect(false).toEqual(true);
      };

      var promises = [passwordNeededCapability.promise, passwordIncorrectCapability.promise, loadingTask.promise];
      Promise.all(promises).then(function (data) {
        expect(data[2] instanceof _api.PDFDocumentProxy).toEqual(true);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("creates pdf doc from PDF file protected with only a user password", function (done) {
      var filename = "pr6531_2.pdf";
      var passwordNeededLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(filename, {
        password: ""
      }));
      var result1 = passwordNeededLoadingTask.promise.then(function () {
        done.fail("shall fail with no password");
        return Promise.reject(new Error("loadingTask should be rejected"));
      }, function (data) {
        expect(data instanceof _util.PasswordException).toEqual(true);
        expect(data.code).toEqual(_util.PasswordResponses.NEED_PASSWORD);
        return passwordNeededLoadingTask.destroy();
      });
      var passwordIncorrectLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(filename, {
        password: "qwerty"
      }));
      var result2 = passwordIncorrectLoadingTask.promise.then(function () {
        done.fail("shall fail with wrong password");
        return Promise.reject(new Error("loadingTask should be rejected"));
      }, function (data) {
        expect(data instanceof _util.PasswordException).toEqual(true);
        expect(data.code).toEqual(_util.PasswordResponses.INCORRECT_PASSWORD);
        return passwordIncorrectLoadingTask.destroy();
      });
      var passwordAcceptedLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(filename, {
        password: "asdfasdf"
      }));
      var result3 = passwordAcceptedLoadingTask.promise.then(function (data) {
        expect(data instanceof _api.PDFDocumentProxy).toEqual(true);
        return passwordAcceptedLoadingTask.destroy();
      });
      Promise.all([result1, result2, result3]).then(function () {
        done();
      }).catch(done.fail);
    });
    it("creates pdf doc from password protected PDF file and aborts/throws " + "in the onPassword callback (issue 7806)", function (done) {
      var filename = "issue3371.pdf";
      var passwordNeededLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(filename));
      var passwordIncorrectLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(filename, {
        password: "qwerty"
      }));
      let passwordNeededDestroyed;

      passwordNeededLoadingTask.onPassword = function (callback, reason) {
        if (reason === _util.PasswordResponses.NEED_PASSWORD) {
          passwordNeededDestroyed = passwordNeededLoadingTask.destroy();
          return;
        }

        expect(false).toEqual(true);
      };

      var result1 = passwordNeededLoadingTask.promise.then(function () {
        done.fail("shall fail since the loadingTask should be destroyed");
        return Promise.reject(new Error("loadingTask should be rejected"));
      }, function (reason) {
        expect(reason instanceof _util.PasswordException).toEqual(true);
        expect(reason.code).toEqual(_util.PasswordResponses.NEED_PASSWORD);
        return passwordNeededDestroyed;
      });

      passwordIncorrectLoadingTask.onPassword = function (callback, reason) {
        if (reason === _util.PasswordResponses.INCORRECT_PASSWORD) {
          throw new Error("Incorrect password");
        }

        expect(false).toEqual(true);
      };

      var result2 = passwordIncorrectLoadingTask.promise.then(function () {
        done.fail("shall fail since the onPassword callback should throw");
        return Promise.reject(new Error("loadingTask should be rejected"));
      }, function (reason) {
        expect(reason instanceof _util.PasswordException).toEqual(true);
        expect(reason.code).toEqual(_util.PasswordResponses.INCORRECT_PASSWORD);
        return passwordIncorrectLoadingTask.destroy();
      });
      Promise.all([result1, result2]).then(function () {
        done();
      }).catch(done.fail);
    });
    it("creates pdf doc from empty typed array", function (done) {
      const loadingTask = (0, _api.getDocument)(new Uint8Array(0));
      loadingTask.promise.then(function () {
        done.fail("shall not open empty file");
      }, function (reason) {
        expect(reason instanceof _util.InvalidPDFException);
        expect(reason.message).toEqual("The PDF file is empty, i.e. its size is zero bytes.");
        loadingTask.destroy().then(done);
      });
    });
  });
  describe("PDFWorker", function () {
    it("worker created or destroyed", function (done) {
      if (_is_node.isNodeJS) {
        pending("Worker is not supported in Node.js.");
      }

      var worker = new _api.PDFWorker({
        name: "test1"
      });
      worker.promise.then(function () {
        expect(worker.name).toEqual("test1");
        expect(!!worker.port).toEqual(true);
        expect(worker.destroyed).toEqual(false);
        expect(!!worker._webWorker).toEqual(true);
        expect(worker.port === worker._webWorker).toEqual(true);
        worker.destroy();
        expect(!!worker.port).toEqual(false);
        expect(worker.destroyed).toEqual(true);
        done();
      }).catch(done.fail);
    });
    it("worker created or destroyed by getDocument", function (done) {
      if (_is_node.isNodeJS) {
        pending("Worker is not supported in Node.js.");
      }

      var loadingTask = (0, _api.getDocument)(basicApiGetDocumentParams);
      var worker;
      loadingTask.promise.then(function () {
        worker = loadingTask._worker;
        expect(!!worker).toEqual(true);
      });
      var destroyPromise = loadingTask.promise.then(function () {
        return loadingTask.destroy();
      });
      destroyPromise.then(function () {
        var destroyedWorker = loadingTask._worker;
        expect(!!destroyedWorker).toEqual(false);
        expect(worker.destroyed).toEqual(true);
        done();
      }).catch(done.fail);
    });
    it("worker created and can be used in getDocument", function (done) {
      if (_is_node.isNodeJS) {
        pending("Worker is not supported in Node.js.");
      }

      var worker = new _api.PDFWorker({
        name: "test1"
      });
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(basicApiFileName, {
        worker
      }));
      loadingTask.promise.then(function () {
        var docWorker = loadingTask._worker;
        expect(!!docWorker).toEqual(false);
        var messageHandlerPort = loadingTask._transport.messageHandler.comObj;
        expect(messageHandlerPort === worker.port).toEqual(true);
      });
      var destroyPromise = loadingTask.promise.then(function () {
        return loadingTask.destroy();
      });
      destroyPromise.then(function () {
        expect(worker.destroyed).toEqual(false);
        worker.destroy();
        done();
      }).catch(done.fail);
    });
    it("creates more than one worker", function (done) {
      if (_is_node.isNodeJS) {
        pending("Worker is not supported in Node.js.");
      }

      var worker1 = new _api.PDFWorker({
        name: "test1"
      });
      var worker2 = new _api.PDFWorker({
        name: "test2"
      });
      var worker3 = new _api.PDFWorker({
        name: "test3"
      });
      var ready = Promise.all([worker1.promise, worker2.promise, worker3.promise]);
      ready.then(function () {
        expect(worker1.port !== worker2.port && worker1.port !== worker3.port && worker2.port !== worker3.port).toEqual(true);
        worker1.destroy();
        worker2.destroy();
        worker3.destroy();
        done();
      }).catch(done.fail);
    });
    it("gets current workerSrc", function () {
      if (_is_node.isNodeJS) {
        pending("Worker is not supported in Node.js.");
      }

      const workerSrc = _api.PDFWorker.getWorkerSrc();

      expect(typeof workerSrc).toEqual("string");
      expect(workerSrc).toEqual(_worker_options.GlobalWorkerOptions.workerSrc);
    });
  });
  describe("PDFDocument", function () {
    let pdfLoadingTask, pdfDocument;
    beforeAll(function (done) {
      pdfLoadingTask = (0, _api.getDocument)(basicApiGetDocumentParams);
      pdfLoadingTask.promise.then(function (data) {
        pdfDocument = data;
        done();
      });
    });
    afterAll(function (done) {
      pdfLoadingTask.destroy().then(done);
    });
    it("gets number of pages", function () {
      expect(pdfDocument.numPages).toEqual(3);
    });
    it("gets fingerprint", function () {
      expect(pdfDocument.fingerprint).toEqual("ea8b35919d6279a369e835bde778611b");
    });
    it("gets page", function (done) {
      var promise = pdfDocument.getPage(1);
      promise.then(function (data) {
        expect(data instanceof _api.PDFPageProxy).toEqual(true);
        expect(data.pageNumber).toEqual(1);
        done();
      }).catch(done.fail);
    });
    it("gets non-existent page", function (done) {
      var outOfRangePromise = pdfDocument.getPage(100);
      var nonIntegerPromise = pdfDocument.getPage(2.5);
      var nonNumberPromise = pdfDocument.getPage("1");
      outOfRangePromise = outOfRangePromise.then(function () {
        throw new Error("shall fail for out-of-range pageNumber parameter");
      }, function (reason) {
        expect(reason instanceof Error).toEqual(true);
      });
      nonIntegerPromise = nonIntegerPromise.then(function () {
        throw new Error("shall fail for non-integer pageNumber parameter");
      }, function (reason) {
        expect(reason instanceof Error).toEqual(true);
      });
      nonNumberPromise = nonNumberPromise.then(function () {
        throw new Error("shall fail for non-number pageNumber parameter");
      }, function (reason) {
        expect(reason instanceof Error).toEqual(true);
      });
      Promise.all([outOfRangePromise, nonIntegerPromise, nonNumberPromise]).then(function () {
        done();
      }).catch(done.fail);
    });
    it("gets page, from /Pages tree with circular reference", function (done) {
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("Pages-tree-refs.pdf"));
      const page1 = loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getPage(1).then(function (pdfPage) {
          expect(pdfPage instanceof _api.PDFPageProxy).toEqual(true);
          expect(pdfPage.ref).toEqual({
            num: 6,
            gen: 0
          });
        }, function (reason) {
          throw new Error("shall not fail for valid page");
        });
      });
      const page2 = loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getPage(2).then(function (pdfPage) {
          throw new Error("shall fail for invalid page");
        }, function (reason) {
          expect(reason instanceof Error).toEqual(true);
          expect(reason.message).toEqual("Pages tree contains circular reference.");
        });
      });
      Promise.all([page1, page2]).then(function () {
        loadingTask.destroy().then(done);
      }, done.fail);
    });
    it("gets page index", function (done) {
      var ref = {
        num: 17,
        gen: 0
      };
      var promise = pdfDocument.getPageIndex(ref);
      promise.then(function (pageIndex) {
        expect(pageIndex).toEqual(1);
        done();
      }).catch(done.fail);
    });
    it("gets invalid page index", function (done) {
      var ref = {
        num: 3,
        gen: 0
      };
      var promise = pdfDocument.getPageIndex(ref);
      promise.then(function () {
        done.fail("shall fail for invalid page reference.");
      }).catch(function (reason) {
        expect(reason instanceof Error).toEqual(true);
        done();
      });
    });
    it("gets destinations, from /Dests dictionary", function (done) {
      var promise = pdfDocument.getDestinations();
      promise.then(function (data) {
        expect(data).toEqual({
          chapter1: [{
            gen: 0,
            num: 17
          }, {
            name: "XYZ"
          }, 0, 841.89, null]
        });
        done();
      }).catch(done.fail);
    });
    it("gets a destination, from /Dests dictionary", function (done) {
      var promise = pdfDocument.getDestination("chapter1");
      promise.then(function (data) {
        expect(data).toEqual([{
          gen: 0,
          num: 17
        }, {
          name: "XYZ"
        }, 0, 841.89, null]);
        done();
      }).catch(done.fail);
    });
    it("gets a non-existent destination, from /Dests dictionary", function (done) {
      var promise = pdfDocument.getDestination("non-existent-named-destination");
      promise.then(function (data) {
        expect(data).toEqual(null);
        done();
      }).catch(done.fail);
    });
    it("gets destinations, from /Names (NameTree) dictionary", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue6204.pdf"));
      var promise = loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getDestinations();
      });
      promise.then(function (destinations) {
        expect(destinations).toEqual({
          "Page.1": [{
            num: 1,
            gen: 0
          }, {
            name: "XYZ"
          }, 0, 375, null],
          "Page.2": [{
            num: 6,
            gen: 0
          }, {
            name: "XYZ"
          }, 0, 375, null]
        });
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets a destination, from /Names (NameTree) dictionary", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue6204.pdf"));
      var promise = loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getDestination("Page.1");
      });
      promise.then(function (destination) {
        expect(destination).toEqual([{
          num: 1,
          gen: 0
        }, {
          name: "XYZ"
        }, 0, 375, null]);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets a non-existent destination, from /Names (NameTree) dictionary", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue6204.pdf"));
      var promise = loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getDestination("non-existent-named-destination");
      });
      promise.then(function (destination) {
        expect(destination).toEqual(null);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets non-string destination", function (done) {
      let numberPromise = pdfDocument.getDestination(4.3);
      let booleanPromise = pdfDocument.getDestination(true);
      let arrayPromise = pdfDocument.getDestination([{
        num: 17,
        gen: 0
      }, {
        name: "XYZ"
      }, 0, 841.89, null]);
      numberPromise = numberPromise.then(function () {
        throw new Error("shall fail for non-string destination.");
      }, function (reason) {
        expect(reason instanceof Error).toEqual(true);
      });
      booleanPromise = booleanPromise.then(function () {
        throw new Error("shall fail for non-string destination.");
      }, function (reason) {
        expect(reason instanceof Error).toEqual(true);
      });
      arrayPromise = arrayPromise.then(function () {
        throw new Error("shall fail for non-string destination.");
      }, function (reason) {
        expect(reason instanceof Error).toEqual(true);
      });
      Promise.all([numberPromise, booleanPromise, arrayPromise]).then(done, done.fail);
    });
    it("gets non-existent page labels", function (done) {
      var promise = pdfDocument.getPageLabels();
      promise.then(function (data) {
        expect(data).toEqual(null);
        done();
      }).catch(done.fail);
    });
    it("gets page labels", function (done) {
      var loadingTask0 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("bug793632.pdf"));
      var promise0 = loadingTask0.promise.then(function (pdfDoc) {
        return pdfDoc.getPageLabels();
      });
      var loadingTask1 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue1453.pdf"));
      var promise1 = loadingTask1.promise.then(function (pdfDoc) {
        return pdfDoc.getPageLabels();
      });
      var loadingTask2 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("rotation.pdf"));
      var promise2 = loadingTask2.promise.then(function (pdfDoc) {
        return pdfDoc.getPageLabels();
      });
      var loadingTask3 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("bad-PageLabels.pdf"));
      var promise3 = loadingTask3.promise.then(function (pdfDoc) {
        return pdfDoc.getPageLabels();
      });
      Promise.all([promise0, promise1, promise2, promise3]).then(function (pageLabels) {
        expect(pageLabels[0]).toEqual(["i", "ii", "iii", "1"]);
        expect(pageLabels[1]).toEqual(["Front Page1"]);
        expect(pageLabels[2]).toEqual(["1", "2"]);
        expect(pageLabels[3]).toEqual(["X3"]);
        Promise.all([loadingTask0.destroy(), loadingTask1.destroy(), loadingTask2.destroy(), loadingTask3.destroy()]).then(done);
      }).catch(done.fail);
    });
    it("gets default page layout", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("tracemonkey.pdf"));
      loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getPageLayout();
      }).then(function (mode) {
        expect(mode).toEqual("");
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets non-default page layout", function (done) {
      pdfDocument.getPageLayout().then(function (mode) {
        expect(mode).toEqual("SinglePage");
        done();
      }).catch(done.fail);
    });
    it("gets default page mode", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("tracemonkey.pdf"));
      loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getPageMode();
      }).then(function (mode) {
        expect(mode).toEqual("UseNone");
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets non-default page mode", function (done) {
      pdfDocument.getPageMode().then(function (mode) {
        expect(mode).toEqual("UseOutlines");
        done();
      }).catch(done.fail);
    });
    it("gets default viewer preferences", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("tracemonkey.pdf"));
      loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getViewerPreferences();
      }).then(function (prefs) {
        expect(prefs).toEqual(null);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets non-default viewer preferences", function (done) {
      pdfDocument.getViewerPreferences().then(function (prefs) {
        expect(prefs).toEqual({
          Direction: "L2R"
        });
        done();
      }).catch(done.fail);
    });
    it("gets default open action", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("tracemonkey.pdf"));
      loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getOpenAction();
      }).then(function (openAction) {
        expect(openAction).toEqual(null);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets non-default open action (with destination)", function (done) {
      pdfDocument.getOpenAction().then(function (openAction) {
        expect(openAction.dest).toEqual([{
          num: 15,
          gen: 0
        }, {
          name: "FitH"
        }, null]);
        expect(openAction.action).toBeUndefined();
        done();
      }).catch(done.fail);
    });
    it("gets non-default open action (with Print action)", function (done) {
      const loadingTask1 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("bug1001080.pdf"));
      const loadingTask2 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue11442_reduced.pdf"));
      const promise1 = loadingTask1.promise.then(function (pdfDoc) {
        return pdfDoc.getOpenAction();
      }).then(function (openAction) {
        expect(openAction.dest).toBeUndefined();
        expect(openAction.action).toEqual("Print");
        return loadingTask1.destroy();
      });
      const promise2 = loadingTask2.promise.then(function (pdfDoc) {
        return pdfDoc.getOpenAction();
      }).then(function (openAction) {
        expect(openAction.dest).toBeUndefined();
        expect(openAction.action).toEqual("Print");
        return loadingTask2.destroy();
      });
      Promise.all([promise1, promise2]).then(done, done.fail);
    });
    it("gets non-existent attachments", function (done) {
      var promise = pdfDocument.getAttachments();
      promise.then(function (data) {
        expect(data).toEqual(null);
        done();
      }).catch(done.fail);
    });
    it("gets attachments", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("attachment.pdf"));
      var promise = loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getAttachments();
      });
      promise.then(function (data) {
        var attachment = data["foo.txt"];
        expect(attachment.filename).toEqual("foo.txt");
        expect(attachment.content).toEqual(new Uint8Array([98, 97, 114, 32, 98, 97, 122, 32, 10]));
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets javascript", function (done) {
      var promise = pdfDocument.getJavaScript();
      promise.then(function (data) {
        expect(data).toEqual(null);
        done();
      }).catch(done.fail);
    });
    it("gets javascript with printing instructions (JS action)", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue6106.pdf"));
      var promise = loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getJavaScript();
      });
      promise.then(function (data) {
        expect(data).toEqual(["this.print({bUI:true,bSilent:false,bShrinkToFit:true});"]);
        expect(data[0]).toMatch(_ui_utils.AutoPrintRegExp);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets non-existent outline", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("tracemonkey.pdf"));
      var promise = loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getOutline();
      });
      promise.then(function (outline) {
        expect(outline).toEqual(null);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets outline", function (done) {
      var promise = pdfDocument.getOutline();
      promise.then(function (outline) {
        expect(Array.isArray(outline)).toEqual(true);
        expect(outline.length).toEqual(2);
        var outlineItem = outline[1];
        expect(outlineItem.title).toEqual("Chapter 1");
        expect(Array.isArray(outlineItem.dest)).toEqual(true);
        expect(outlineItem.url).toEqual(null);
        expect(outlineItem.unsafeUrl).toBeUndefined();
        expect(outlineItem.newWindow).toBeUndefined();
        expect(outlineItem.bold).toEqual(true);
        expect(outlineItem.italic).toEqual(false);
        expect(outlineItem.color).toEqual(new Uint8ClampedArray([0, 64, 128]));
        expect(outlineItem.items.length).toEqual(1);
        expect(outlineItem.items[0].title).toEqual("Paragraph 1.1");
        done();
      }).catch(done.fail);
    });
    it("gets outline containing a url", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue3214.pdf"));
      loadingTask.promise.then(function (pdfDoc) {
        pdfDoc.getOutline().then(function (outline) {
          expect(Array.isArray(outline)).toEqual(true);
          expect(outline.length).toEqual(5);
          var outlineItemTwo = outline[2];
          expect(typeof outlineItemTwo.title).toEqual("string");
          expect(outlineItemTwo.dest).toEqual(null);
          expect(outlineItemTwo.url).toEqual("http://google.com/");
          expect(outlineItemTwo.unsafeUrl).toEqual("http://google.com");
          expect(outlineItemTwo.newWindow).toBeUndefined();
          var outlineItemOne = outline[1];
          expect(outlineItemOne.bold).toEqual(false);
          expect(outlineItemOne.italic).toEqual(true);
          expect(outlineItemOne.color).toEqual(new Uint8ClampedArray([0, 0, 0]));
          loadingTask.destroy().then(done);
        });
      }).catch(done.fail);
    });
    it("gets non-existent permissions", function (done) {
      pdfDocument.getPermissions().then(function (permissions) {
        expect(permissions).toEqual(null);
        done();
      }).catch(done.fail);
    });
    it("gets permissions", function (done) {
      const loadingTask0 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue9972-1.pdf"));
      const promise0 = loadingTask0.promise.then(function (pdfDoc) {
        return pdfDoc.getPermissions();
      });
      const loadingTask1 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue9972-2.pdf"));
      const promise1 = loadingTask1.promise.then(function (pdfDoc) {
        return pdfDoc.getPermissions();
      });
      const loadingTask2 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue9972-3.pdf"));
      const promise2 = loadingTask2.promise.then(function (pdfDoc) {
        return pdfDoc.getPermissions();
      });
      const totalPermissionCount = Object.keys(_util.PermissionFlag).length;
      Promise.all([promise0, promise1, promise2]).then(function (permissions) {
        expect(permissions[0].length).toEqual(totalPermissionCount - 1);
        expect(permissions[0].includes(_util.PermissionFlag.MODIFY_CONTENTS)).toBeFalsy();
        expect(permissions[1].length).toEqual(totalPermissionCount - 2);
        expect(permissions[1].includes(_util.PermissionFlag.PRINT)).toBeFalsy();
        expect(permissions[1].includes(_util.PermissionFlag.PRINT_HIGH_QUALITY)).toBeFalsy();
        expect(permissions[2].length).toEqual(totalPermissionCount - 1);
        expect(permissions[2].includes(_util.PermissionFlag.COPY)).toBeFalsy();
        Promise.all([loadingTask0.destroy(), loadingTask1.destroy(), loadingTask2.destroy()]).then(done);
      }).catch(done.fail);
    });
    it("gets metadata", function (done) {
      var promise = pdfDocument.getMetadata();
      promise.then(function ({
        info,
        metadata,
        contentDispositionFilename
      }) {
        expect(info.Title).toEqual("Basic API Test");
        expect(info.Custom).toEqual(undefined);
        expect(info.PDFFormatVersion).toEqual("1.7");
        expect(info.IsLinearized).toEqual(false);
        expect(info.IsAcroFormPresent).toEqual(false);
        expect(info.IsXFAPresent).toEqual(false);
        expect(info.IsCollectionPresent).toEqual(false);
        expect(metadata instanceof _metadata.Metadata).toEqual(true);
        expect(metadata.get("dc:title")).toEqual("Basic API Test");
        expect(contentDispositionFilename).toEqual(null);
        done();
      }).catch(done.fail);
    });
    it("gets metadata, with custom info dict entries", function (done) {
      var loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("tracemonkey.pdf"));
      loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getMetadata();
      }).then(function ({
        info,
        metadata,
        contentDispositionFilename
      }) {
        expect(info.Creator).toEqual("TeX");
        expect(info.Producer).toEqual("pdfeTeX-1.21a");
        expect(info.CreationDate).toEqual("D:20090401163925-07'00'");
        const custom = info.Custom;
        expect(typeof custom === "object" && custom !== null).toEqual(true);
        expect(custom["PTEX.Fullbanner"]).toEqual("This is pdfeTeX, " + "Version 3.141592-1.21a-2.2 (Web2C 7.5.4) kpathsea version 3.5.6");
        expect(info.PDFFormatVersion).toEqual("1.4");
        expect(info.IsLinearized).toEqual(false);
        expect(info.IsAcroFormPresent).toEqual(false);
        expect(info.IsXFAPresent).toEqual(false);
        expect(info.IsCollectionPresent).toEqual(false);
        expect(metadata).toEqual(null);
        expect(contentDispositionFilename).toEqual(null);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets metadata, with missing PDF header (bug 1606566)", function (done) {
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("bug1606566.pdf"));
      loadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getMetadata();
      }).then(function ({
        info,
        metadata,
        contentDispositionFilename
      }) {
        expect(info.PDFFormatVersion).toEqual(null);
        expect(info.IsLinearized).toEqual(false);
        expect(info.IsAcroFormPresent).toEqual(false);
        expect(info.IsXFAPresent).toEqual(false);
        expect(info.IsCollectionPresent).toEqual(false);
        expect(metadata).toEqual(null);
        expect(contentDispositionFilename).toEqual(null);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("gets data", function (done) {
      var promise = pdfDocument.getData();
      promise.then(function (data) {
        expect(data instanceof Uint8Array).toEqual(true);
        expect(data.length).toEqual(basicApiFileLength);
        done();
      }).catch(done.fail);
    });
    it("gets download info", function (done) {
      var promise = pdfDocument.getDownloadInfo();
      promise.then(function (data) {
        expect(data).toEqual({
          length: basicApiFileLength
        });
        done();
      }).catch(done.fail);
    });
    it("gets document stats", function (done) {
      var promise = pdfDocument.getStats();
      promise.then(function (stats) {
        expect(stats).toEqual({
          streamTypes: {},
          fontTypes: {}
        });
        done();
      }).catch(done.fail);
    });
    it("cleans up document resources", function (done) {
      const promise = pdfDocument.cleanup();
      promise.then(function () {
        expect(true).toEqual(true);
        done();
      }, done.fail);
    });
    it("checks that fingerprints are unique", function (done) {
      const loadingTask1 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue4436r.pdf"));
      const loadingTask2 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue4575.pdf"));
      Promise.all([loadingTask1.promise, loadingTask2.promise]).then(function (data) {
        const fingerprint1 = data[0].fingerprint;
        const fingerprint2 = data[1].fingerprint;
        expect(fingerprint1).not.toEqual(fingerprint2);
        expect(fingerprint1).toEqual("2f695a83d6e7553c24fc08b7ac69712d");
        expect(fingerprint2).toEqual("04c7126b34a46b6d4d6e7a1eff7edcb6");
        Promise.all([loadingTask1.destroy(), loadingTask2.destroy()]).then(done);
      }).catch(done.fail);
    });
    describe("Cross-origin", function () {
      var loadingTask;

      function _checkCanLoad(expectSuccess, filename, options) {
        if (_is_node.isNodeJS) {
          pending("Cannot simulate cross-origin requests in Node.js");
        }

        var params = (0, _test_utils.buildGetDocumentParams)(filename, options);
        var url = new URL(params.url);

        if (url.hostname === "localhost") {
          url.hostname = "127.0.0.1";
        } else if (params.url.hostname === "127.0.0.1") {
          url.hostname = "localhost";
        } else {
          pending("Can only run cross-origin test on localhost!");
        }

        params.url = url.href;
        loadingTask = (0, _api.getDocument)(params);
        return loadingTask.promise.then(function (pdf) {
          return pdf.destroy();
        }).then(function () {
          expect(expectSuccess).toEqual(true);
        }, function (error) {
          if (expectSuccess) {
            expect(error).toEqual("There should not be any error");
          }

          expect(expectSuccess).toEqual(false);
        });
      }

      function testCanLoad(filename, options) {
        return _checkCanLoad(true, filename, options);
      }

      function testCannotLoad(filename, options) {
        return _checkCanLoad(false, filename, options);
      }

      afterEach(function (done) {
        if (loadingTask && !loadingTask.destroyed) {
          loadingTask.destroy().then(done);
        } else {
          done();
        }
      });
      it("server disallows cors", function (done) {
        testCannotLoad("basicapi.pdf").then(done);
      });
      it("server allows cors without credentials, default withCredentials", function (done) {
        testCanLoad("basicapi.pdf?cors=withoutCredentials").then(done);
      });
      it("server allows cors without credentials, and withCredentials=false", function (done) {
        testCanLoad("basicapi.pdf?cors=withoutCredentials", {
          withCredentials: false
        }).then(done);
      });
      it("server allows cors without credentials, but withCredentials=true", function (done) {
        testCannotLoad("basicapi.pdf?cors=withoutCredentials", {
          withCredentials: true
        }).then(done);
      });
      it("server allows cors with credentials, and withCredentials=true", function (done) {
        testCanLoad("basicapi.pdf?cors=withCredentials", {
          withCredentials: true
        }).then(done);
      });
      it("server allows cors with credentials, and withCredentials=false", function (done) {
        testCanLoad("basicapi.pdf?cors=withCredentials", {
          withCredentials: false
        }).then(done);
      });
    });
  });
  describe("Page", function () {
    let pdfLoadingTask, pdfDocument, page;
    beforeAll(function (done) {
      pdfLoadingTask = (0, _api.getDocument)(basicApiGetDocumentParams);
      pdfLoadingTask.promise.then(function (doc) {
        pdfDocument = doc;
        pdfDocument.getPage(1).then(function (data) {
          page = data;
          done();
        });
      }).catch(done.fail);
    });
    afterAll(function (done) {
      pdfLoadingTask.destroy().then(done);
    });
    it("gets page number", function () {
      expect(page.pageNumber).toEqual(1);
    });
    it("gets rotate", function () {
      expect(page.rotate).toEqual(0);
    });
    it("gets ref", function () {
      expect(page.ref).toEqual({
        num: 15,
        gen: 0
      });
    });
    it("gets userUnit", function () {
      expect(page.userUnit).toEqual(1.0);
    });
    it("gets view", function () {
      expect(page.view).toEqual([0, 0, 595.28, 841.89]);
    });
    it("gets view, with empty/invalid bounding boxes", function (done) {
      const viewLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("boundingBox_invalid.pdf"));
      viewLoadingTask.promise.then(pdfDoc => {
        const numPages = pdfDoc.numPages;
        expect(numPages).toEqual(3);
        const viewPromises = [];

        for (let i = 0; i < numPages; i++) {
          viewPromises[i] = pdfDoc.getPage(i + 1).then(pdfPage => {
            return pdfPage.view;
          });
        }

        Promise.all(viewPromises).then(([page1, page2, page3]) => {
          expect(page1).toEqual([0, 0, 612, 792]);
          expect(page2).toEqual([0, 0, 800, 600]);
          expect(page3).toEqual([0, 0, 600, 800]);
          viewLoadingTask.destroy().then(done);
        });
      }).catch(done.fail);
    });
    it("gets viewport", function () {
      var viewport = page.getViewport({
        scale: 1.5,
        rotation: 90
      });
      expect(viewport.viewBox).toEqual(page.view);
      expect(viewport.scale).toEqual(1.5);
      expect(viewport.rotation).toEqual(90);
      expect(viewport.transform).toEqual([0, 1.5, 1.5, 0, 0, 0]);
      expect(viewport.width).toEqual(1262.835);
      expect(viewport.height).toEqual(892.92);
    });
    it('gets viewport with "offsetX/offsetY" arguments', function () {
      const viewport = page.getViewport({
        scale: 1,
        rotation: 0,
        offsetX: 100,
        offsetY: -100
      });
      expect(viewport.transform).toEqual([1, 0, 0, -1, 100, 741.89]);
    });
    it('gets viewport respecting "dontFlip" argument', function () {
      const scale = 1,
            rotation = 0;
      const viewport = page.getViewport({
        scale,
        rotation
      });
      const dontFlipViewport = page.getViewport({
        scale,
        rotation,
        dontFlip: true
      });
      expect(dontFlipViewport).not.toEqual(viewport);
      expect(dontFlipViewport).toEqual(viewport.clone({
        dontFlip: true
      }));
      expect(viewport.transform).toEqual([1, 0, 0, -1, 0, 841.89]);
      expect(dontFlipViewport.transform).toEqual([1, 0, -0, 1, 0, 0]);
    });
    it("gets viewport with invalid rotation", function () {
      expect(function () {
        page.getViewport({
          scale: 1,
          rotation: 45
        });
      }).toThrow(new Error("PageViewport: Invalid rotation, must be a multiple of 90 degrees."));
    });
    it("gets annotations", function (done) {
      var defaultPromise = page.getAnnotations().then(function (data) {
        expect(data.length).toEqual(4);
      });
      var displayPromise = page.getAnnotations({
        intent: "display"
      }).then(function (data) {
        expect(data.length).toEqual(4);
      });
      var printPromise = page.getAnnotations({
        intent: "print"
      }).then(function (data) {
        expect(data.length).toEqual(4);
      });
      Promise.all([defaultPromise, displayPromise, printPromise]).then(function () {
        done();
      }).catch(done.fail);
    });
    it("gets annotations containing relative URLs (bug 766086)", function (done) {
      var filename = "bug766086.pdf";
      var defaultLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(filename));
      var defaultPromise = defaultLoadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getPage(1).then(function (pdfPage) {
          return pdfPage.getAnnotations();
        });
      });
      var docBaseUrlLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(filename, {
        docBaseUrl: "http://www.example.com/test/pdfs/qwerty.pdf"
      }));
      var docBaseUrlPromise = docBaseUrlLoadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getPage(1).then(function (pdfPage) {
          return pdfPage.getAnnotations();
        });
      });
      var invalidDocBaseUrlLoadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(filename, {
        docBaseUrl: "qwerty.pdf"
      }));
      var invalidDocBaseUrlPromise = invalidDocBaseUrlLoadingTask.promise.then(function (pdfDoc) {
        return pdfDoc.getPage(1).then(function (pdfPage) {
          return pdfPage.getAnnotations();
        });
      });
      Promise.all([defaultPromise, docBaseUrlPromise, invalidDocBaseUrlPromise]).then(function (data) {
        var defaultAnnotations = data[0];
        var docBaseUrlAnnotations = data[1];
        var invalidDocBaseUrlAnnotations = data[2];
        expect(defaultAnnotations[0].url).toBeUndefined();
        expect(defaultAnnotations[0].unsafeUrl).toEqual("../../0021/002156/215675E.pdf#15");
        expect(docBaseUrlAnnotations[0].url).toEqual("http://www.example.com/0021/002156/215675E.pdf#15");
        expect(docBaseUrlAnnotations[0].unsafeUrl).toEqual("../../0021/002156/215675E.pdf#15");
        expect(invalidDocBaseUrlAnnotations[0].url).toBeUndefined();
        expect(invalidDocBaseUrlAnnotations[0].unsafeUrl).toEqual("../../0021/002156/215675E.pdf#15");
        Promise.all([defaultLoadingTask.destroy(), docBaseUrlLoadingTask.destroy(), invalidDocBaseUrlLoadingTask.destroy()]).then(done);
      }).catch(done.fail);
    });
    it("gets text content", function (done) {
      var defaultPromise = page.getTextContent();
      var parametersPromise = page.getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: true
      });
      var promises = [defaultPromise, parametersPromise];
      Promise.all(promises).then(function (data) {
        expect(!!data[0].items).toEqual(true);
        expect(data[0].items.length).toEqual(7);
        expect(!!data[0].styles).toEqual(true);
        expect(JSON.stringify(data[0])).toEqual(JSON.stringify(data[1]));
        done();
      }).catch(done.fail);
    });
    it("gets text content, with correct properties (issue 8276)", function (done) {
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue8276_reduced.pdf"));
      loadingTask.promise.then(pdfDoc => {
        pdfDoc.getPage(1).then(pdfPage => {
          pdfPage.getTextContent().then(({
            items,
            styles
          }) => {
            expect(items.length).toEqual(1);
            expect(Object.keys(styles)).toEqual(["Times"]);
            expect(items[0]).toEqual({
              dir: "ltr",
              fontName: "Times",
              height: 18,
              str: "Issue 8276",
              transform: [18, 0, 0, 18, 441.81, 708.4499999999999],
              width: 77.49
            });
            expect(styles.Times).toEqual({
              fontFamily: "serif",
              ascent: NaN,
              descent: NaN,
              vertical: false
            });
            loadingTask.destroy().then(done);
          });
        });
      }).catch(done.fail);
    });
    it("gets operator list", function (done) {
      var promise = page.getOperatorList();
      promise.then(function (oplist) {
        expect(!!oplist.fnArray).toEqual(true);
        expect(!!oplist.argsArray).toEqual(true);
        expect(oplist.lastChunk).toEqual(true);
        done();
      }).catch(done.fail);
    });
    it("gets operatorList with JPEG image (issue 4888)", function (done) {
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("cmykjpeg.pdf"));
      loadingTask.promise.then(pdfDoc => {
        pdfDoc.getPage(1).then(pdfPage => {
          pdfPage.getOperatorList().then(opList => {
            const imgIndex = opList.fnArray.indexOf(_util.OPS.paintImageXObject);
            const imgArgs = opList.argsArray[imgIndex];
            const {
              data
            } = pdfPage.objs.get(imgArgs[0]);
            expect(data instanceof Uint8ClampedArray).toEqual(true);
            expect(data.length).toEqual(90000);
            loadingTask.destroy().then(done);
          });
        });
      }).catch(done.fail);
    });
    it("gets operatorList, from corrupt PDF file (issue 8702), " + "with/without `stopAtErrors` set", function (done) {
      const loadingTask1 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue8702.pdf", {
        stopAtErrors: false
      }));
      const loadingTask2 = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue8702.pdf", {
        stopAtErrors: true
      }));
      const result1 = loadingTask1.promise.then(pdfDoc => {
        return pdfDoc.getPage(1).then(pdfPage => {
          return pdfPage.getOperatorList().then(opList => {
            expect(opList.fnArray.length).toBeGreaterThan(100);
            expect(opList.argsArray.length).toBeGreaterThan(100);
            expect(opList.lastChunk).toEqual(true);
            return loadingTask1.destroy();
          });
        });
      });
      const result2 = loadingTask2.promise.then(pdfDoc => {
        return pdfDoc.getPage(1).then(pdfPage => {
          return pdfPage.getOperatorList().then(opList => {
            expect(opList.fnArray.length).toEqual(0);
            expect(opList.argsArray.length).toEqual(0);
            expect(opList.lastChunk).toEqual(true);
            return loadingTask2.destroy();
          });
        });
      });
      Promise.all([result1, result2]).then(done, done.fail);
    });
    it("gets document stats after parsing page", function (done) {
      var promise = page.getOperatorList().then(function () {
        return pdfDocument.getStats();
      });
      var expectedStreamTypes = {};
      expectedStreamTypes[_util.StreamType.FLATE] = true;
      var expectedFontTypes = {};
      expectedFontTypes[_util.FontType.TYPE1] = true;
      expectedFontTypes[_util.FontType.CIDFONTTYPE2] = true;
      promise.then(function (stats) {
        expect(stats).toEqual({
          streamTypes: expectedStreamTypes,
          fontTypes: expectedFontTypes
        });
        done();
      }).catch(done.fail);
    });
    it("gets page stats after parsing page, without `pdfBug` set", function (done) {
      page.getOperatorList().then(opList => {
        return page.stats;
      }).then(stats => {
        expect(stats).toEqual(null);
        done();
      }, done.fail);
    });
    it("gets page stats after parsing page, with `pdfBug` set", function (done) {
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(basicApiFileName, {
        pdfBug: true
      }));
      loadingTask.promise.then(pdfDoc => {
        return pdfDoc.getPage(1).then(pdfPage => {
          return pdfPage.getOperatorList().then(opList => {
            return pdfPage.stats;
          });
        });
      }).then(stats => {
        expect(stats instanceof _display_utils.StatTimer).toEqual(true);
        expect(stats.times.length).toEqual(1);
        const [statEntry] = stats.times;
        expect(statEntry.name).toEqual("Page Request");
        expect(statEntry.end - statEntry.start).toBeGreaterThanOrEqual(0);
        loadingTask.destroy().then(done);
      }, done.fail);
    });
    it("gets page stats after rendering page, with `pdfBug` set", function (done) {
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(basicApiFileName, {
        pdfBug: true
      }));
      let canvasAndCtx;
      loadingTask.promise.then(pdfDoc => {
        return pdfDoc.getPage(1).then(pdfPage => {
          const viewport = pdfPage.getViewport({
            scale: 1
          });
          canvasAndCtx = CanvasFactory.create(viewport.width, viewport.height);
          const renderTask = pdfPage.render({
            canvasContext: canvasAndCtx.context,
            canvasFactory: CanvasFactory,
            viewport
          });
          return renderTask.promise.then(() => {
            return pdfPage.stats;
          });
        });
      }).then(stats => {
        expect(stats instanceof _display_utils.StatTimer).toEqual(true);
        expect(stats.times.length).toEqual(3);
        const [statEntryOne, statEntryTwo, statEntryThree] = stats.times;
        expect(statEntryOne.name).toEqual("Page Request");
        expect(statEntryOne.end - statEntryOne.start).toBeGreaterThanOrEqual(0);
        expect(statEntryTwo.name).toEqual("Rendering");
        expect(statEntryTwo.end - statEntryTwo.start).toBeGreaterThan(0);
        expect(statEntryThree.name).toEqual("Overall");
        expect(statEntryThree.end - statEntryThree.start).toBeGreaterThan(0);
        CanvasFactory.destroy(canvasAndCtx);
        loadingTask.destroy().then(done);
      }, done.fail);
    });
    it("cancels rendering of page", function (done) {
      var viewport = page.getViewport({
        scale: 1
      });
      var canvasAndCtx = CanvasFactory.create(viewport.width, viewport.height);
      var renderTask = page.render({
        canvasContext: canvasAndCtx.context,
        canvasFactory: CanvasFactory,
        viewport
      });
      renderTask.cancel();
      renderTask.promise.then(function () {
        done.fail("shall cancel rendering");
      }).catch(function (error) {
        expect(error instanceof _display_utils.RenderingCancelledException).toEqual(true);
        expect(error.message).toEqual("Rendering cancelled, page 1");
        expect(error.type).toEqual("canvas");
        CanvasFactory.destroy(canvasAndCtx);
        done();
      });
    });
    it("re-render page, using the same canvas, after cancelling rendering", function (done) {
      const viewport = page.getViewport({
        scale: 1
      });
      const canvasAndCtx = CanvasFactory.create(viewport.width, viewport.height);
      const renderTask = page.render({
        canvasContext: canvasAndCtx.context,
        canvasFactory: CanvasFactory,
        viewport
      });
      renderTask.cancel();
      renderTask.promise.then(() => {
        throw new Error("shall cancel rendering");
      }, reason => {
        expect(reason instanceof _display_utils.RenderingCancelledException).toEqual(true);
      }).then(() => {
        const reRenderTask = page.render({
          canvasContext: canvasAndCtx.context,
          canvasFactory: CanvasFactory,
          viewport
        });
        return reRenderTask.promise;
      }).then(() => {
        CanvasFactory.destroy(canvasAndCtx);
        done();
      }, done.fail);
    });
    it("multiple render() on the same canvas", function (done) {
      const optionalContentConfigPromise = pdfDocument.getOptionalContentConfig();
      var viewport = page.getViewport({
        scale: 1
      });
      var canvasAndCtx = CanvasFactory.create(viewport.width, viewport.height);
      var renderTask1 = page.render({
        canvasContext: canvasAndCtx.context,
        canvasFactory: CanvasFactory,
        viewport,
        optionalContentConfigPromise
      });
      var renderTask2 = page.render({
        canvasContext: canvasAndCtx.context,
        canvasFactory: CanvasFactory,
        viewport,
        optionalContentConfigPromise
      });
      Promise.all([renderTask1.promise, renderTask2.promise.then(() => {
        done.fail("shall fail rendering");
      }, reason => {
        expect(/multiple render\(\)/.test(reason.message)).toEqual(true);
      })]).then(done);
    });
    it("cleans up document resources after rendering of page", function (done) {
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)(basicApiFileName));
      let canvasAndCtx;
      loadingTask.promise.then(pdfDoc => {
        return pdfDoc.getPage(1).then(pdfPage => {
          const viewport = pdfPage.getViewport({
            scale: 1
          });
          canvasAndCtx = CanvasFactory.create(viewport.width, viewport.height);
          const renderTask = pdfPage.render({
            canvasContext: canvasAndCtx.context,
            canvasFactory: CanvasFactory,
            viewport
          });
          return renderTask.promise.then(() => {
            return pdfDoc.cleanup();
          });
        });
      }).then(() => {
        expect(true).toEqual(true);
        CanvasFactory.destroy(canvasAndCtx);
        loadingTask.destroy().then(done);
      }, done.fail);
    });
    it("cleans up document resources during rendering of page", function (done) {
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("tracemonkey.pdf"));
      let canvasAndCtx;
      loadingTask.promise.then(pdfDoc => {
        return pdfDoc.getPage(1).then(pdfPage => {
          const viewport = pdfPage.getViewport({
            scale: 1
          });
          canvasAndCtx = CanvasFactory.create(viewport.width, viewport.height);
          const renderTask = pdfPage.render({
            canvasContext: canvasAndCtx.context,
            canvasFactory: CanvasFactory,
            viewport
          });

          renderTask.onContinue = function (cont) {
            waitSome(cont);
          };

          return pdfDoc.cleanup().then(() => {
            throw new Error("shall fail cleanup");
          }, reason => {
            expect(reason instanceof Error).toEqual(true);
            expect(reason.message).toEqual("startCleanup: Page 1 is currently rendering.");
          }).then(() => {
            return renderTask.promise;
          }).then(() => {
            CanvasFactory.destroy(canvasAndCtx);
            loadingTask.destroy().then(done);
          });
        });
      }).catch(done.fail);
    });
    it("caches image resources at the document/page level as expected (issue 11878)", async function (done) {
      const {
        NUM_PAGES_THRESHOLD
      } = _image_utils.GlobalImageCache,
            EXPECTED_WIDTH = 2550,
            EXPECTED_HEIGHT = 3300;
      const loadingTask = (0, _api.getDocument)((0, _test_utils.buildGetDocumentParams)("issue11878.pdf"));
      let firstImgData = null;

      try {
        const pdfDoc = await loadingTask.promise;

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const pdfPage = await pdfDoc.getPage(i);
          const opList = await pdfPage.getOperatorList();
          const {
            commonObjs,
            objs
          } = pdfPage;
          const imgIndex = opList.fnArray.indexOf(_util.OPS.paintImageXObject);
          const [objId, width, height] = opList.argsArray[imgIndex];

          if (i < NUM_PAGES_THRESHOLD) {
            expect(objId).toEqual(`img_p${i - 1}_1`);
            expect(objs.has(objId)).toEqual(true);
            expect(commonObjs.has(objId)).toEqual(false);
          } else {
            expect(objId).toEqual(`g_${loadingTask.docId}_img_p${NUM_PAGES_THRESHOLD - 1}_1`);
            expect(objs.has(objId)).toEqual(false);
            expect(commonObjs.has(objId)).toEqual(true);
          }

          expect(width).toEqual(EXPECTED_WIDTH);
          expect(height).toEqual(EXPECTED_HEIGHT);

          if (i === 1) {
            firstImgData = objs.get(objId);
            expect(firstImgData.width).toEqual(EXPECTED_WIDTH);
            expect(firstImgData.height).toEqual(EXPECTED_HEIGHT);
            expect(firstImgData.kind).toEqual(_util.ImageKind.RGB_24BPP);
            expect(firstImgData.data instanceof Uint8ClampedArray).toEqual(true);
            expect(firstImgData.data.length).toEqual(25245000);
          } else {
            const objsPool = i >= NUM_PAGES_THRESHOLD ? commonObjs : objs;
            const currentImgData = objsPool.get(objId);
            expect(currentImgData.width).toEqual(firstImgData.width);
            expect(currentImgData.height).toEqual(firstImgData.height);
            expect(currentImgData.kind).toEqual(firstImgData.kind);
            expect(currentImgData.data instanceof Uint8ClampedArray).toEqual(true);
            expect(currentImgData.data.every((value, index) => {
              return value === firstImgData.data[index];
            })).toEqual(true);
          }
        }

        await loadingTask.destroy();
        firstImgData = null;
        done();
      } catch (ex) {
        done.fail(ex);
      }
    });
  });
  describe("Multiple `getDocument` instances", function () {
    var pdf1 = (0, _test_utils.buildGetDocumentParams)("tracemonkey.pdf");
    var pdf2 = (0, _test_utils.buildGetDocumentParams)("TAMReview.pdf");
    var pdf3 = (0, _test_utils.buildGetDocumentParams)("issue6068.pdf");
    var loadingTasks = [];

    async function renderPDF(filename) {
      const loadingTask = (0, _api.getDocument)(filename);
      loadingTasks.push(loadingTask);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({
        scale: 1.2
      });
      const canvasAndCtx = CanvasFactory.create(viewport.width, viewport.height);
      const renderTask = page.render({
        canvasContext: canvasAndCtx.context,
        canvasFactory: CanvasFactory,
        viewport
      });
      await renderTask.promise;
      const data = canvasAndCtx.canvas.toDataURL();
      CanvasFactory.destroy(canvasAndCtx);
      return data;
    }

    afterEach(function (done) {
      const destroyPromises = loadingTasks.map(function (loadingTask) {
        return loadingTask.destroy();
      });
      Promise.all(destroyPromises).then(done);
    });
    it("should correctly render PDFs in parallel", function (done) {
      var baseline1, baseline2, baseline3;
      var promiseDone = renderPDF(pdf1).then(function (data1) {
        baseline1 = data1;
        return renderPDF(pdf2);
      }).then(function (data2) {
        baseline2 = data2;
        return renderPDF(pdf3);
      }).then(function (data3) {
        baseline3 = data3;
        return Promise.all([renderPDF(pdf1), renderPDF(pdf2), renderPDF(pdf3)]);
      }).then(function (dataUrls) {
        expect(dataUrls[0]).toEqual(baseline1);
        expect(dataUrls[1]).toEqual(baseline2);
        expect(dataUrls[2]).toEqual(baseline3);
        return true;
      });
      promiseDone.then(function () {
        done();
      }).catch(done.fail);
    });
  });
  describe("PDFDataRangeTransport", function () {
    let dataPromise;
    beforeAll(function (done) {
      const fileName = "tracemonkey.pdf";

      if (_is_node.isNodeJS) {
        dataPromise = _test_utils.NodeFileReaderFactory.fetch({
          path: _test_utils.TEST_PDFS_PATH.node + fileName
        });
      } else {
        dataPromise = _test_utils.DOMFileReaderFactory.fetch({
          path: _test_utils.TEST_PDFS_PATH.dom + fileName
        });
      }

      done();
    });
    afterAll(function () {
      dataPromise = null;
    });
    it("should fetch document info and page using ranges", function (done) {
      const initialDataLength = 4000;
      let fetches = 0,
          loadingTask;
      dataPromise.then(function (data) {
        const initialData = data.subarray(0, initialDataLength);
        const transport = new _api.PDFDataRangeTransport(data.length, initialData);

        transport.requestDataRange = function (begin, end) {
          fetches++;
          waitSome(function () {
            transport.onDataProgress(4000);
            transport.onDataRange(begin, data.subarray(begin, end));
          });
        };

        loadingTask = (0, _api.getDocument)(transport);
        return loadingTask.promise;
      }).then(function (pdfDocument) {
        expect(pdfDocument.numPages).toEqual(14);
        return pdfDocument.getPage(10);
      }).then(function (pdfPage) {
        expect(pdfPage.rotate).toEqual(0);
        expect(fetches).toBeGreaterThan(2);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
    it("should fetch document info and page using range and streaming", function (done) {
      const initialDataLength = 4000;
      let fetches = 0,
          loadingTask;
      dataPromise.then(function (data) {
        const initialData = data.subarray(0, initialDataLength);
        const transport = new _api.PDFDataRangeTransport(data.length, initialData);

        transport.requestDataRange = function (begin, end) {
          fetches++;

          if (fetches === 1) {
            transport.onDataProgressiveRead(data.subarray(initialDataLength));
          }

          waitSome(function () {
            transport.onDataRange(begin, data.subarray(begin, end));
          });
        };

        loadingTask = (0, _api.getDocument)(transport);
        return loadingTask.promise;
      }).then(function (pdfDocument) {
        expect(pdfDocument.numPages).toEqual(14);
        return pdfDocument.getPage(10);
      }).then(function (pdfPage) {
        expect(pdfPage.rotate).toEqual(0);
        expect(fetches).toEqual(1);
        waitSome(function () {
          loadingTask.destroy().then(done);
        });
      }).catch(done.fail);
    });
    it("should fetch document info and page, without range, " + "using complete initialData", function (done) {
      let fetches = 0,
          loadingTask;
      dataPromise.then(function (data) {
        const transport = new _api.PDFDataRangeTransport(data.length, data, true);

        transport.requestDataRange = function (begin, end) {
          fetches++;
        };

        loadingTask = (0, _api.getDocument)({
          disableRange: true,
          range: transport
        });
        return loadingTask.promise;
      }).then(function (pdfDocument) {
        expect(pdfDocument.numPages).toEqual(14);
        return pdfDocument.getPage(10);
      }).then(function (pdfPage) {
        expect(pdfPage.rotate).toEqual(0);
        expect(fetches).toEqual(0);
        loadingTask.destroy().then(done);
      }).catch(done.fail);
    });
  });
});