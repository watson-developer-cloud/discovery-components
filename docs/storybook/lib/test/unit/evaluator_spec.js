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

var _primitives = require("../../core/primitives.js");

var _util = require("../../shared/util.js");

var _stream = require("../../core/stream.js");

var _operator_list = require("../../core/operator_list.js");

var _evaluator = require("../../core/evaluator.js");

var _worker = require("../../core/worker.js");

describe("evaluator", function () {
  function HandlerMock() {
    this.inputs = [];
  }

  HandlerMock.prototype = {
    send(name, data) {
      this.inputs.push({
        name,
        data
      });
    }

  };

  function ResourcesMock() {}

  ResourcesMock.prototype = {
    get(name) {
      return this[name];
    }

  };

  function runOperatorListCheck(evaluator, stream, resources, callback) {
    var result = new _operator_list.OperatorList();
    var task = new _worker.WorkerTask("OperatorListCheck");
    evaluator.getOperatorList({
      stream,
      task,
      resources,
      operatorList: result
    }).then(function () {
      callback(result);
    }, function (reason) {
      callback(reason);
    });
  }

  var partialEvaluator;
  beforeAll(function (done) {
    partialEvaluator = new _evaluator.PartialEvaluator({
      xref: new _test_utils.XRefMock(),
      handler: new HandlerMock(),
      pageIndex: 0,
      idFactory: (0, _test_utils.createIdFactory)(0)
    });
    done();
  });
  afterAll(function () {
    partialEvaluator = null;
  });
  describe("splitCombinedOperations", function () {
    it("should reject unknown operations", function (done) {
      var stream = new _stream.StringStream("fTT");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(1);
        expect(result.fnArray[0]).toEqual(_util.OPS.fill);
        expect(result.argsArray[0]).toEqual(null);
        done();
      });
    });
    it("should handle one operation", function (done) {
      var stream = new _stream.StringStream("Q");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(1);
        expect(result.fnArray[0]).toEqual(_util.OPS.restore);
        done();
      });
    });
    it("should handle two glued operations", function (done) {
      const imgDict = new _primitives.Dict();
      imgDict.set("Subtype", _primitives.Name.get("Image"));
      imgDict.set("Width", 1);
      imgDict.set("Height", 1);
      const imgStream = new _stream.Stream([0]);
      imgStream.dict = imgDict;
      const xObject = new _primitives.Dict();
      xObject.set("Res1", imgStream);
      const resources = new ResourcesMock();
      resources.XObject = xObject;
      var stream = new _stream.StringStream("/Res1 DoQ");
      runOperatorListCheck(partialEvaluator, stream, resources, function (result) {
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.dependency);
        expect(result.fnArray[1]).toEqual(_util.OPS.paintImageXObject);
        expect(result.fnArray[2]).toEqual(_util.OPS.restore);
        expect(result.argsArray.length).toEqual(3);
        expect(result.argsArray[0]).toEqual(["img_p0_1"]);
        expect(result.argsArray[1]).toEqual(["img_p0_1", 1, 1]);
        expect(result.argsArray[2]).toEqual(null);
        done();
      });
    });
    it("should handle three glued operations", function (done) {
      var stream = new _stream.StringStream("fff");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.fill);
        expect(result.fnArray[1]).toEqual(_util.OPS.fill);
        expect(result.fnArray[2]).toEqual(_util.OPS.fill);
        done();
      });
    });
    it("should handle three glued operations #2", function (done) {
      var resources = new ResourcesMock();
      resources.Res1 = {};
      var stream = new _stream.StringStream("B*Bf*");
      runOperatorListCheck(partialEvaluator, stream, resources, function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.eoFillStroke);
        expect(result.fnArray[1]).toEqual(_util.OPS.fillStroke);
        expect(result.fnArray[2]).toEqual(_util.OPS.eoFill);
        done();
      });
    });
    it("should handle glued operations and operands", function (done) {
      var stream = new _stream.StringStream("f5 Ts");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(2);
        expect(result.fnArray[0]).toEqual(_util.OPS.fill);
        expect(result.fnArray[1]).toEqual(_util.OPS.setTextRise);
        expect(result.argsArray.length).toEqual(2);
        expect(result.argsArray[1].length).toEqual(1);
        expect(result.argsArray[1][0]).toEqual(5);
        done();
      });
    });
    it("should handle glued operations and literals", function (done) {
      var stream = new _stream.StringStream("trueifalserinulln");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.setFlatness);
        expect(result.fnArray[1]).toEqual(_util.OPS.setRenderingIntent);
        expect(result.fnArray[2]).toEqual(_util.OPS.endPath);
        expect(result.argsArray.length).toEqual(3);
        expect(result.argsArray[0].length).toEqual(1);
        expect(result.argsArray[0][0]).toEqual(true);
        expect(result.argsArray[1].length).toEqual(1);
        expect(result.argsArray[1][0]).toEqual(false);
        expect(result.argsArray[2]).toEqual(null);
        done();
      });
    });
  });
  describe("validateNumberOfArgs", function () {
    it("should execute if correct number of arguments", function (done) {
      var stream = new _stream.StringStream("5 1 d0");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(result.argsArray[0][0]).toEqual(5);
        expect(result.argsArray[0][1]).toEqual(1);
        expect(result.fnArray[0]).toEqual(_util.OPS.setCharWidth);
        done();
      });
    });
    it("should execute if too many arguments", function (done) {
      var stream = new _stream.StringStream("5 1 4 d0");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(result.argsArray[0][0]).toEqual(1);
        expect(result.argsArray[0][1]).toEqual(4);
        expect(result.fnArray[0]).toEqual(_util.OPS.setCharWidth);
        done();
      });
    });
    it("should execute if nested commands", function (done) {
      const gState = new _primitives.Dict();
      gState.set("LW", 2);
      gState.set("CA", 0.5);
      const extGState = new _primitives.Dict();
      extGState.set("GS2", gState);
      const resources = new ResourcesMock();
      resources.ExtGState = extGState;
      var stream = new _stream.StringStream("/F2 /GS2 gs 5.711 Tf");
      runOperatorListCheck(partialEvaluator, stream, resources, function (result) {
        expect(result.fnArray.length).toEqual(3);
        expect(result.fnArray[0]).toEqual(_util.OPS.setGState);
        expect(result.fnArray[1]).toEqual(_util.OPS.dependency);
        expect(result.fnArray[2]).toEqual(_util.OPS.setFont);
        expect(result.argsArray.length).toEqual(3);
        expect(result.argsArray[0]).toEqual([[["LW", 2], ["CA", 0.5]]]);
        expect(result.argsArray[1]).toEqual(["g_font_error"]);
        expect(result.argsArray[2]).toEqual(["g_font_error", 5.711]);
        done();
      });
    });
    it("should skip if too few arguments", function (done) {
      var stream = new _stream.StringStream("5 d0");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(result.argsArray).toEqual([]);
        expect(result.fnArray).toEqual([]);
        done();
      });
    });
    it("should error if (many) path operators have too few arguments " + "(bug 1443140)", function (done) {
      const NUM_INVALID_OPS = 25;
      const tempArr = new Array(NUM_INVALID_OPS + 1);
      const invalidMoveText = tempArr.join("10 Td\n");
      const moveTextStream = new _stream.StringStream(invalidMoveText);
      runOperatorListCheck(partialEvaluator, moveTextStream, new ResourcesMock(), function (result) {
        expect(result.argsArray).toEqual([]);
        expect(result.fnArray).toEqual([]);
        done();
      });
      const invalidLineTo = tempArr.join("20 l\n");
      const lineToStream = new _stream.StringStream(invalidLineTo);
      runOperatorListCheck(partialEvaluator, lineToStream, new ResourcesMock(), function (error) {
        expect(error instanceof _util.FormatError).toEqual(true);
        expect(error.message).toEqual("Invalid command l: expected 2 args, but received 1 args.");
        done();
      });
    });
    it("should close opened saves", function (done) {
      var stream = new _stream.StringStream("qq");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(4);
        expect(result.fnArray[0]).toEqual(_util.OPS.save);
        expect(result.fnArray[1]).toEqual(_util.OPS.save);
        expect(result.fnArray[2]).toEqual(_util.OPS.restore);
        expect(result.fnArray[3]).toEqual(_util.OPS.restore);
        done();
      });
    });
    it("should error on paintXObject if name is missing", function (done) {
      var stream = new _stream.StringStream("/ Do");
      runOperatorListCheck(partialEvaluator, stream, new ResourcesMock(), function (result) {
        expect(result instanceof _util.FormatError).toEqual(true);
        expect(result.message).toEqual("XObject must be referred to by name.");
        done();
      });
    });
    it("should skip paintXObject if subtype is PS", function (done) {
      var xobjStreamDict = new _primitives.Dict();
      xobjStreamDict.set("Subtype", _primitives.Name.get("PS"));
      var xobjStream = new _stream.Stream([], 0, 0, xobjStreamDict);
      var xobjs = new _primitives.Dict();
      xobjs.set("Res1", xobjStream);
      var resources = new _primitives.Dict();
      resources.set("XObject", xobjs);
      var stream = new _stream.StringStream("/Res1 Do");
      runOperatorListCheck(partialEvaluator, stream, resources, function (result) {
        expect(result.argsArray).toEqual([]);
        expect(result.fnArray).toEqual([]);
        done();
      });
    });
  });
  describe("thread control", function () {
    it("should abort operator list parsing", function (done) {
      var stream = new _stream.StringStream("qqQQ");
      var resources = new ResourcesMock();
      var result = new _operator_list.OperatorList();
      var task = new _worker.WorkerTask("OperatorListAbort");
      task.terminate();
      partialEvaluator.getOperatorList({
        stream,
        task,
        resources,
        operatorList: result
      }).catch(function () {
        expect(!!result.fnArray && !!result.argsArray).toEqual(true);
        expect(result.fnArray.length).toEqual(0);
        done();
      });
    });
    it("should abort text parsing parsing", function (done) {
      var resources = new ResourcesMock();
      var stream = new _stream.StringStream("qqQQ");
      var task = new _worker.WorkerTask("TextContentAbort");
      task.terminate();
      partialEvaluator.getTextContent({
        stream,
        task,
        resources
      }).catch(function () {
        expect(true).toEqual(true);
        done();
      });
    });
  });
  describe("operator list", function () {
    class StreamSinkMock {
      enqueue() {}

    }

    it("should get correct total length after flushing", function () {
      var operatorList = new _operator_list.OperatorList(null, new StreamSinkMock());
      operatorList.addOp(_util.OPS.save, null);
      operatorList.addOp(_util.OPS.restore, null);
      expect(operatorList.totalLength).toEqual(2);
      expect(operatorList.length).toEqual(2);
      operatorList.flush();
      expect(operatorList.totalLength).toEqual(2);
      expect(operatorList.length).toEqual(0);
    });
  });
});