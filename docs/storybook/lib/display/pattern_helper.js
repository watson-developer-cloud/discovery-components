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
exports.getShadingPatternFromIR = getShadingPatternFromIR;
exports.TilingPattern = void 0;

var _util = require("../shared/util.js");

var ShadingIRs = {};

function applyBoundingBox(ctx, bbox) {
  if (!bbox || typeof Path2D === "undefined") {
    return;
  }

  const width = bbox[2] - bbox[0];
  const height = bbox[3] - bbox[1];
  const region = new Path2D();
  region.rect(bbox[0], bbox[1], width, height);
  ctx.clip(region);
}

ShadingIRs.RadialAxial = {
  fromIR: function RadialAxial_fromIR(raw) {
    var type = raw[1];
    var bbox = raw[2];
    var colorStops = raw[3];
    var p0 = raw[4];
    var p1 = raw[5];
    var r0 = raw[6];
    var r1 = raw[7];
    return {
      type: "Pattern",
      getPattern: function RadialAxial_getPattern(ctx) {
        applyBoundingBox(ctx, bbox);
        var grad;

        if (type === "axial") {
          grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        } else if (type === "radial") {
          grad = ctx.createRadialGradient(p0[0], p0[1], r0, p1[0], p1[1], r1);
        }

        for (var i = 0, ii = colorStops.length; i < ii; ++i) {
          var c = colorStops[i];
          grad.addColorStop(c[0], c[1]);
        }

        return grad;
      }
    };
  }
};

var createMeshCanvas = function createMeshCanvasClosure() {
  function drawTriangle(data, context, p1, p2, p3, c1, c2, c3) {
    var coords = context.coords,
        colors = context.colors;
    var bytes = data.data,
        rowSize = data.width * 4;
    var tmp;

    if (coords[p1 + 1] > coords[p2 + 1]) {
      tmp = p1;
      p1 = p2;
      p2 = tmp;
      tmp = c1;
      c1 = c2;
      c2 = tmp;
    }

    if (coords[p2 + 1] > coords[p3 + 1]) {
      tmp = p2;
      p2 = p3;
      p3 = tmp;
      tmp = c2;
      c2 = c3;
      c3 = tmp;
    }

    if (coords[p1 + 1] > coords[p2 + 1]) {
      tmp = p1;
      p1 = p2;
      p2 = tmp;
      tmp = c1;
      c1 = c2;
      c2 = tmp;
    }

    var x1 = (coords[p1] + context.offsetX) * context.scaleX;
    var y1 = (coords[p1 + 1] + context.offsetY) * context.scaleY;
    var x2 = (coords[p2] + context.offsetX) * context.scaleX;
    var y2 = (coords[p2 + 1] + context.offsetY) * context.scaleY;
    var x3 = (coords[p3] + context.offsetX) * context.scaleX;
    var y3 = (coords[p3 + 1] + context.offsetY) * context.scaleY;

    if (y1 >= y3) {
      return;
    }

    var c1r = colors[c1],
        c1g = colors[c1 + 1],
        c1b = colors[c1 + 2];
    var c2r = colors[c2],
        c2g = colors[c2 + 1],
        c2b = colors[c2 + 2];
    var c3r = colors[c3],
        c3g = colors[c3 + 1],
        c3b = colors[c3 + 2];
    var minY = Math.round(y1),
        maxY = Math.round(y3);
    var xa, car, cag, cab;
    var xb, cbr, cbg, cbb;

    for (var y = minY; y <= maxY; y++) {
      if (y < y2) {
        let k;

        if (y < y1) {
          k = 0;
        } else if (y1 === y2) {
          k = 1;
        } else {
          k = (y1 - y) / (y1 - y2);
        }

        xa = x1 - (x1 - x2) * k;
        car = c1r - (c1r - c2r) * k;
        cag = c1g - (c1g - c2g) * k;
        cab = c1b - (c1b - c2b) * k;
      } else {
        let k;

        if (y > y3) {
          k = 1;
        } else if (y2 === y3) {
          k = 0;
        } else {
          k = (y2 - y) / (y2 - y3);
        }

        xa = x2 - (x2 - x3) * k;
        car = c2r - (c2r - c3r) * k;
        cag = c2g - (c2g - c3g) * k;
        cab = c2b - (c2b - c3b) * k;
      }

      let k;

      if (y < y1) {
        k = 0;
      } else if (y > y3) {
        k = 1;
      } else {
        k = (y1 - y) / (y1 - y3);
      }

      xb = x1 - (x1 - x3) * k;
      cbr = c1r - (c1r - c3r) * k;
      cbg = c1g - (c1g - c3g) * k;
      cbb = c1b - (c1b - c3b) * k;
      var x1_ = Math.round(Math.min(xa, xb));
      var x2_ = Math.round(Math.max(xa, xb));
      var j = rowSize * y + x1_ * 4;

      for (var x = x1_; x <= x2_; x++) {
        k = (xa - x) / (xa - xb);

        if (k < 0) {
          k = 0;
        } else if (k > 1) {
          k = 1;
        }

        bytes[j++] = car - (car - cbr) * k | 0;
        bytes[j++] = cag - (cag - cbg) * k | 0;
        bytes[j++] = cab - (cab - cbb) * k | 0;
        bytes[j++] = 255;
      }
    }
  }

  function drawFigure(data, figure, context) {
    var ps = figure.coords;
    var cs = figure.colors;
    var i, ii;

    switch (figure.type) {
      case "lattice":
        var verticesPerRow = figure.verticesPerRow;
        var rows = Math.floor(ps.length / verticesPerRow) - 1;
        var cols = verticesPerRow - 1;

        for (i = 0; i < rows; i++) {
          var q = i * verticesPerRow;

          for (var j = 0; j < cols; j++, q++) {
            drawTriangle(data, context, ps[q], ps[q + 1], ps[q + verticesPerRow], cs[q], cs[q + 1], cs[q + verticesPerRow]);
            drawTriangle(data, context, ps[q + verticesPerRow + 1], ps[q + 1], ps[q + verticesPerRow], cs[q + verticesPerRow + 1], cs[q + 1], cs[q + verticesPerRow]);
          }
        }

        break;

      case "triangles":
        for (i = 0, ii = ps.length; i < ii; i += 3) {
          drawTriangle(data, context, ps[i], ps[i + 1], ps[i + 2], cs[i], cs[i + 1], cs[i + 2]);
        }

        break;

      default:
        throw new Error("illegal figure");
    }
  }

  function createMeshCanvas(bounds, combinesScale, coords, colors, figures, backgroundColor, cachedCanvases, webGLContext) {
    var EXPECTED_SCALE = 1.1;
    var MAX_PATTERN_SIZE = 3000;
    var BORDER_SIZE = 2;
    var offsetX = Math.floor(bounds[0]);
    var offsetY = Math.floor(bounds[1]);
    var boundsWidth = Math.ceil(bounds[2]) - offsetX;
    var boundsHeight = Math.ceil(bounds[3]) - offsetY;
    var width = Math.min(Math.ceil(Math.abs(boundsWidth * combinesScale[0] * EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var height = Math.min(Math.ceil(Math.abs(boundsHeight * combinesScale[1] * EXPECTED_SCALE)), MAX_PATTERN_SIZE);
    var scaleX = boundsWidth / width;
    var scaleY = boundsHeight / height;
    var context = {
      coords,
      colors,
      offsetX: -offsetX,
      offsetY: -offsetY,
      scaleX: 1 / scaleX,
      scaleY: 1 / scaleY
    };
    var paddedWidth = width + BORDER_SIZE * 2;
    var paddedHeight = height + BORDER_SIZE * 2;
    var canvas, tmpCanvas, i, ii;

    if (webGLContext.isEnabled) {
      canvas = webGLContext.drawFigures({
        width,
        height,
        backgroundColor,
        figures,
        context
      });
      tmpCanvas = cachedCanvases.getCanvas("mesh", paddedWidth, paddedHeight, false);
      tmpCanvas.context.drawImage(canvas, BORDER_SIZE, BORDER_SIZE);
      canvas = tmpCanvas.canvas;
    } else {
      tmpCanvas = cachedCanvases.getCanvas("mesh", paddedWidth, paddedHeight, false);
      var tmpCtx = tmpCanvas.context;
      var data = tmpCtx.createImageData(width, height);

      if (backgroundColor) {
        var bytes = data.data;

        for (i = 0, ii = bytes.length; i < ii; i += 4) {
          bytes[i] = backgroundColor[0];
          bytes[i + 1] = backgroundColor[1];
          bytes[i + 2] = backgroundColor[2];
          bytes[i + 3] = 255;
        }
      }

      for (i = 0; i < figures.length; i++) {
        drawFigure(data, figures[i], context);
      }

      tmpCtx.putImageData(data, BORDER_SIZE, BORDER_SIZE);
      canvas = tmpCanvas.canvas;
    }

    return {
      canvas,
      offsetX: offsetX - BORDER_SIZE * scaleX,
      offsetY: offsetY - BORDER_SIZE * scaleY,
      scaleX,
      scaleY
    };
  }

  return createMeshCanvas;
}();

ShadingIRs.Mesh = {
  fromIR: function Mesh_fromIR(raw) {
    var coords = raw[2];
    var colors = raw[3];
    var figures = raw[4];
    var bounds = raw[5];
    var matrix = raw[6];
    var bbox = raw[7];
    var background = raw[8];
    return {
      type: "Pattern",
      getPattern: function Mesh_getPattern(ctx, owner, shadingFill) {
        applyBoundingBox(ctx, bbox);
        var scale;

        if (shadingFill) {
          scale = _util.Util.singularValueDecompose2dScale(ctx.mozCurrentTransform);
        } else {
          scale = _util.Util.singularValueDecompose2dScale(owner.baseTransform);

          if (matrix) {
            var matrixScale = _util.Util.singularValueDecompose2dScale(matrix);

            scale = [scale[0] * matrixScale[0], scale[1] * matrixScale[1]];
          }
        }

        var temporaryPatternCanvas = createMeshCanvas(bounds, scale, coords, colors, figures, shadingFill ? null : background, owner.cachedCanvases, owner.webGLContext);

        if (!shadingFill) {
          ctx.setTransform.apply(ctx, owner.baseTransform);

          if (matrix) {
            ctx.transform.apply(ctx, matrix);
          }
        }

        ctx.translate(temporaryPatternCanvas.offsetX, temporaryPatternCanvas.offsetY);
        ctx.scale(temporaryPatternCanvas.scaleX, temporaryPatternCanvas.scaleY);
        return ctx.createPattern(temporaryPatternCanvas.canvas, "no-repeat");
      }
    };
  }
};
ShadingIRs.Dummy = {
  fromIR: function Dummy_fromIR() {
    return {
      type: "Pattern",
      getPattern: function Dummy_fromIR_getPattern() {
        return "hotpink";
      }
    };
  }
};

function getShadingPatternFromIR(raw) {
  var shadingIR = ShadingIRs[raw[0]];

  if (!shadingIR) {
    throw new Error(`Unknown IR type: ${raw[0]}`);
  }

  return shadingIR.fromIR(raw);
}

var TilingPattern = function TilingPatternClosure() {
  var PaintType = {
    COLORED: 1,
    UNCOLORED: 2
  };
  var MAX_PATTERN_SIZE = 3000;

  function TilingPattern(IR, color, ctx, canvasGraphicsFactory, baseTransform) {
    this.operatorList = IR[2];
    this.matrix = IR[3] || [1, 0, 0, 1, 0, 0];
    this.bbox = IR[4];
    this.xstep = IR[5];
    this.ystep = IR[6];
    this.paintType = IR[7];
    this.tilingType = IR[8];
    this.color = color;
    this.canvasGraphicsFactory = canvasGraphicsFactory;
    this.baseTransform = baseTransform;
    this.type = "Pattern";
    this.ctx = ctx;
  }

  TilingPattern.prototype = {
    createPatternCanvas: function TilinPattern_createPatternCanvas(owner) {
      var operatorList = this.operatorList;
      var bbox = this.bbox;
      var xstep = this.xstep;
      var ystep = this.ystep;
      var paintType = this.paintType;
      var tilingType = this.tilingType;
      var color = this.color;
      var canvasGraphicsFactory = this.canvasGraphicsFactory;
      (0, _util.info)("TilingType: " + tilingType);
      var x0 = bbox[0],
          y0 = bbox[1],
          x1 = bbox[2],
          y1 = bbox[3];

      var matrixScale = _util.Util.singularValueDecompose2dScale(this.matrix);

      var curMatrixScale = _util.Util.singularValueDecompose2dScale(this.baseTransform);

      var combinedScale = [matrixScale[0] * curMatrixScale[0], matrixScale[1] * curMatrixScale[1]];
      var dimx = this.getSizeAndScale(xstep, this.ctx.canvas.width, combinedScale[0]);
      var dimy = this.getSizeAndScale(ystep, this.ctx.canvas.height, combinedScale[1]);
      var tmpCanvas = owner.cachedCanvases.getCanvas("pattern", dimx.size, dimy.size, true);
      var tmpCtx = tmpCanvas.context;
      var graphics = canvasGraphicsFactory.createCanvasGraphics(tmpCtx);
      graphics.groupLevel = owner.groupLevel;
      this.setFillAndStrokeStyleToContext(graphics, paintType, color);
      graphics.transform(dimx.scale, 0, 0, dimy.scale, 0, 0);
      graphics.transform(1, 0, 0, 1, -x0, -y0);
      this.clipBbox(graphics, bbox, x0, y0, x1, y1);
      graphics.executeOperatorList(operatorList);
      this.ctx.transform(1, 0, 0, 1, x0, y0);
      this.ctx.scale(1 / dimx.scale, 1 / dimy.scale);
      return tmpCanvas.canvas;
    },
    getSizeAndScale: function TilingPattern_getSizeAndScale(step, realOutputSize, scale) {
      step = Math.abs(step);
      var maxSize = Math.max(MAX_PATTERN_SIZE, realOutputSize);
      var size = Math.ceil(step * scale);

      if (size >= maxSize) {
        size = maxSize;
      } else {
        scale = size / step;
      }

      return {
        scale,
        size
      };
    },
    clipBbox: function clipBbox(graphics, bbox, x0, y0, x1, y1) {
      if (Array.isArray(bbox) && bbox.length === 4) {
        var bboxWidth = x1 - x0;
        var bboxHeight = y1 - y0;
        graphics.ctx.rect(x0, y0, bboxWidth, bboxHeight);
        graphics.clip();
        graphics.endPath();
      }
    },
    setFillAndStrokeStyleToContext: function setFillAndStrokeStyleToContext(graphics, paintType, color) {
      const context = graphics.ctx,
            current = graphics.current;

      switch (paintType) {
        case PaintType.COLORED:
          var ctx = this.ctx;
          context.fillStyle = ctx.fillStyle;
          context.strokeStyle = ctx.strokeStyle;
          current.fillColor = ctx.fillStyle;
          current.strokeColor = ctx.strokeStyle;
          break;

        case PaintType.UNCOLORED:
          var cssColor = _util.Util.makeCssRgb(color[0], color[1], color[2]);

          context.fillStyle = cssColor;
          context.strokeStyle = cssColor;
          current.fillColor = cssColor;
          current.strokeColor = cssColor;
          break;

        default:
          throw new _util.FormatError(`Unsupported paint type: ${paintType}`);
      }
    },
    getPattern: function TilingPattern_getPattern(ctx, owner) {
      ctx = this.ctx;
      ctx.setTransform.apply(ctx, this.baseTransform);
      ctx.transform.apply(ctx, this.matrix);
      var temporaryPatternCanvas = this.createPatternCanvas(owner);
      return ctx.createPattern(temporaryPatternCanvas, "repeat");
    }
  };
  return TilingPattern;
}();

exports.TilingPattern = TilingPattern;