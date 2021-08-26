import { path2Absolute, path2Segments, path2Curve } from '@antv/path-util';
import { Cubic as CubicUtil } from '@antv/g-math';
import type { DisplayObject } from '../DisplayObject';
import type { PathCommand } from '../types';
import type { ParsedPathStyleProps } from '../display-objects';
import { isString } from '@antv/util';

export function parsePath(path: string, displayObject: DisplayObject | null): ParsedPathStyleProps {
  const absolutePath = path2Absolute(path) as PathCommand[];
  const hasArc = hasArcOrBezier(absolutePath);
  const segments = path2Segments(absolutePath);
  const { polygons, polylines } = extractPolygons(absolutePath);

  // convert to curves to do morphing later
  // @see http://thednp.github.io/kute.js/svgCubicMorph.html
  const curve = path2Curve(absolutePath);
  const { totalLength, curveSegments } = calcLength(curve);

  // console.log(curve, curveSegments)

  return {
    absolutePath,
    hasArc,
    segments,
    polygons,
    polylines,
    curve,
    totalLength,
    curveSegments,
  };
}

function hasArcOrBezier(path: PathCommand[]) {
  let hasArc = false;
  const count = path.length;
  for (let i = 0; i < count; i++) {
    const params = path[i];
    const cmd = params[0];
    if (cmd === 'C' || cmd === 'A' || cmd === 'Q') {
      hasArc = true;
      break;
    }
  }
  return hasArc;
}

function extractPolygons(path: any[]) {
  const count = path.length;
  const polygons = [];
  const polylines = [];
  let points = []; // 防止第一个命令不是 'M'
  for (let i = 0; i < count; i++) {
    const params = path[i];
    const cmd = params[0];
    if (cmd === 'M') {
      // 遇到 'M' 判定是否是新数组，新数组中没有点
      if (points.length) {
        // 如果存在点，则说明没有遇到 'Z'，开始了一个新的多边形
        polylines.push(points);
        points = []; // 创建新的点
      }
      points.push([params[1], params[2]]);
    } else if (cmd === 'Z') {
      if (points.length) {
        // 存在点
        polygons.push(points);
        points = []; // 开始新的点集合
      }
      // 如果不存在点，同时 'Z'，则说明是错误，不处理
    } else {
      points.push([params[1], params[2]]);
    }
  }
  // 说明 points 未放入 polygons 或者 polyline
  // 仅当只有一个 M，没有 Z 时会发生这种情况
  if (points.length > 0) {
    polylines.push(points);
  }
  return {
    polygons,
    polylines,
  };
}

function calcLength(curve: any[]) {
  let totalLength = 0;
  let tempLength = 0;
  // 每段 curve 对应起止点的长度比例列表，形如: [[0, 0.25], [0.25, 0.6]. [0.6, 0.9], [0.9, 1]]
  const curveSegments: number[][] = [];
  let segmentT;
  let segmentL;
  let segmentN;
  let l;

  if (!curve) {
    return {
      curveSegments: [],
      totalLength,
    };
  }

  curve.forEach((segment, i) => {
    segmentN = curve[i + 1];
    l = segment.length;
    if (segmentN) {
      totalLength +=
        CubicUtil.length(
          segment[l - 2],
          segment[l - 1],
          segmentN[1],
          segmentN[2],
          segmentN[3],
          segmentN[4],
          segmentN[5],
          segmentN[6],
        ) || 0;
    }
  });

  if (totalLength === 0) {
    return {
      curveSegments: [],
      totalLength,
    };
  }

  curve.forEach((segment, i) => {
    segmentN = curve[i + 1];
    l = segment.length;
    if (segmentN) {
      segmentT = [];
      segmentT[0] = tempLength / totalLength;
      segmentL = CubicUtil.length(
        segment[l - 2],
        segment[l - 1],
        segmentN[1],
        segmentN[2],
        segmentN[3],
        segmentN[4],
        segmentN[5],
        segmentN[6],
      );
      // 当 path 不连续时，segmentL 可能为空，为空时需要作为 0 处理
      tempLength += segmentL || 0;
      segmentT[1] = tempLength / totalLength;
      curveSegments.push(segmentT);
    }
  });

  return {
    curveSegments,
    totalLength,
  };
}

export function mergePaths(
  left: ParsedPathStyleProps,
  right: ParsedPathStyleProps,
  displayObject: DisplayObject | null,
) {
  // const curve1 = left.;
  // const curve2 = right.curve;
  // if (curve1.length !== curve2.length) {
  // }
  // equalizeSegments();
  // return [
  // ];
}
