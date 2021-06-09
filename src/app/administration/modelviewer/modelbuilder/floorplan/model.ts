import { none, some, getOrElse, map, Option, isSome, chain } from "fp-ts/lib/Option";
import { IModel, IVertex, IPoint } from 'src/app/services/geometry.service';
import { mapToOptionMap, OptionMap } from 'src/app/utility/optionmap';
import { block, ifblock } from 'src/app/utility/functional';

export class Model {

  public getFloorplan = (model: IModel): IFLoorplan => {
    const height = 1.2;

    const vertexMap = mapToOptionMap<IVertex, string, IPoint>(
      (vertex: IVertex) => [vertex.id, vertex.point]
    )(model.data.model.vertices);

    return {
      walls: model.data.model.faces.map((face) => {
        const order = (
          start: IPoint2D
        ): ((p1: IPoint2D, p2: IPoint2D) => number) => {
          return (p1: IPoint2D, p2: IPoint2D) => {
            const dist1 = Math.sqrt(
              (start.x - p1.x) * (start.x - p1.x) +
              (start.y - p1.y) * (start.y - p1.y)
            );
            const dist2 = Math.sqrt(
              (start.x - p2.x) * (start.x - p2.x) +
              (start.y - p2.y) * (start.y - p2.y)
            );
            return dist1 - dist2;
          };
        };
        const wall = getOrElse(() => null)(
          this.getSection(vertexMap, height)(face.vertices)
        );
        const doors = face.doors
          ? face.doors
            .map((door) =>
              getOrElse(() => null)(
                map((x: [IPoint2D, IPoint2D]) => x.sort(order(wall[0])))(
                  this.getSection(vertexMap, height)(door)
                )
              )
            )
            .filter((x) => x !== null)
          : [];
        const windows = face.windows
          ? face.windows
            .map((window) =>
              getOrElse(() => null)(
                map((x: [IPoint2D, IPoint2D]) => x.sort(order(wall[0])))(
                  this.getSection(vertexMap, height)(window)
                )
              )
            )
            .filter((x) => x !== null)
          : [];

        const order2 = (
          start: IPoint2D
        ): ((o1: [IPoint2D, IPoint2D], o2: [IPoint2D, IPoint2D]) => number) => {
          return (o1: [IPoint2D, IPoint2D], o2: [IPoint2D, IPoint2D]) => {
            const p1 = o1[0];
            const p2 = o2[0];
            const dist1 = Math.sqrt(
              (start.x - p1.x) * (start.x - p1.x) +
              (start.y - p1.y) * (start.y - p1.y)
            );
            const dist2 = Math.sqrt(
              (start.x - p2.x) * (start.x - p2.x) +
              (start.y - p2.y) * (start.y - p2.y)
            );
            return dist1 - dist2;
          };
        };

        const orifices = doors.concat(windows).sort(order2(wall[0]));

        const sections: Array<[IPoint2D, IPoint2D]> = [];
        let start = wall[0];
        orifices.forEach((orifice) => {
          sections.push([start, orifice[0]]);
          start = orifice[1];
        });
        sections.push([start, wall[1]]);

        return {
          wall: wall,
          doors: doors,
          windows: windows,
          sections,
        };
      }),
    };
  };

  public getDisplacementMap = (model: IFLoorplan) => {
    const getClosest = (
      set: Set<[IPoint2D, IPoint2D]>
    ): ((
      point: IPoint2D
    ) => { value: [IPoint2D, IPoint2D]; near: IPoint2D; far: IPoint2D }) => {
      return (point: IPoint2D) => {
        let retValue: {
          dist: number;
          value: [IPoint2D, IPoint2D];
          near: IPoint2D;
          far: IPoint2D;
        } = null;
        set.forEach((value) => {
          const newValue = ((value: [IPoint2D, IPoint2D]) => {
            const getDistance = (point1: IPoint2D, point2: IPoint2D) =>
              Math.sqrt(
                (point1.x - point2.x) * (point1.x - point2.x) +
                (point1.y - point2.y) * (point1.y - point2.y)
              );
            const dist1 = getDistance(point, value[0]);
            const dist2 = getDistance(point, value[1]);
            return dist1 < dist2
              ? { dist: dist1, value: value, near: value[0], far: value[1] }
              : { dist: dist1, value: value, near: value[1], far: value[0] };
          })(value);
          if (retValue === null || retValue.dist > newValue.dist) {
            retValue = newValue;
            return;
          }
        });
        return retValue;
      };
    };

    const set = new Set(model.walls.map((wall) => wall.wall));

    const buildChain = (set: Set<[IPoint2D, IPoint2D]>): Array<IPoint2D> => {
      const chain: Array<IPoint2D> = [];

      const recursivly = (point: IPoint2D) => {
        if (set.size === 0) {
          return;
        }
        chain.push(point);
        const closest = getClosest(set)(point);
        set.delete(closest.value);

        if (closest.near.id !== point.id) {
          chain.push(closest.near);
        }
        recursivly(closest.far);
      };

      const start = set.values().next().value[0];
      //set.delete(start);
      recursivly(start);
      return chain;
    };

    const chain = buildChain(set);

    const retMap = block<
      Array<{ id: string; x: number; y: number }>,
      OptionMap<string, { x: number; y: number }>
    >((points: Array<{ id: string; x: number; y: number }>) => {
      const outerSign = Math.sign(
        points
          .map((node: { id: string; x: number; y: number }, index: number) => {
            const point = node;
            const previousPoint =
              points[(index - 1 + points.length) % points.length];
            const nextPoint =
              points[(index + 1 + points.length) % points.length];
            const v1 = normalize(subtract(point)(previousPoint));
            const v2 = normalize(subtract(nextPoint)(point));
            return v1.x * v2.y - v1.y * v2.x;
          })
          .reduce((a, b) => a + b, 0)
      );
      return mapToOptionMap<unknown, string, IPoint2D>((x: any) => x
      )(
        points.map(
          (node: { id: string; x: number; y: number }, index: number) => {
            const point = node;
            const previousPoint =
              points[(index - 1 + points.length) % points.length];
            const nextPoint =
              points[(index + 1 + points.length) % points.length];
            const v1 = normalize(subtract(point)(previousPoint));
            const v2 = normalize(subtract(nextPoint)(point));
            return ifblock<[string, { x: number; y: number }]>(
              () => {
                return [
                  node.id,
                  scale(0.15 * outerSign)({ x: v1.y, y: -v1.x }),
                ];
              },
              () => {
                const v3 = normalize(subtract(v1)(v2));
                const _scale = 0.15 / Math.abs(v3.x * v2.y - v3.y * v2.x);
                return [
                  node.id,
                  scale(
                    _scale * outerSign * Math.sign(v1.x * v2.y - v1.y * v2.x)
                  )(v3),
                ];
              }
            )(v1.x === v2.x && v1.y === v2.y);
          }
        ))
    })(chain);

    model.walls.forEach((wall) => {
      map((displacement: { x: number; y: number }) => {
        wall.doors.map((door) => {
          const normal = normalize({
            x: door[0].y - door[1].y,
            y: door[1].x - door[0].x,
          });
          const disp = scale(
            normal.x * displacement.x + normal.y * displacement.y
          )(normal);
          retMap.set(door[0].id, disp);
          retMap.set(door[1].id, disp);
        });
        wall.windows.map((window) => {
          const normal = normalize({
            x: window[0].y - window[1].y,
            y: window[1].x - window[0].x,
          });
          const disp = scale(
            normal.x * displacement.x + normal.y * displacement.y
          )(normal);
          retMap.set(window[0].id, disp);
          retMap.set(window[1].id, disp);
        });
      })(retMap.get(wall.wall[0].id));
    });

    return retMap;
  };

  private getSection = (
    vertexMap: OptionMap<string, IPoint>,
    sectionHeight: number
  ): ((vertices: Array<string>) => Option<[IPoint2D, IPoint2D]>) => {
    return (_vertices: Array<string>) => {
      const vertices: Array<{ id: string; point: IPoint }> = _vertices
        .map((vertex) => {
          const point = vertexMap.get(vertex);
          return map((point) => {
            return { id: vertex, point: point };
          })(point);
        })
        .filter((x) => isSome(x))
        .map((x) => getOrElse(() => null)(x));

      const length = vertices.length;

      const retArray = vertices
        .map((vertex1: { id: string; point: IPoint }, index: number) => {
          const vertex2: { id: string; point: IPoint } =
            vertices[(index + 1) % length];
          const n =
            (sectionHeight - vertex2.point.y) /
            (vertex1.point.y - vertex2.point.y);
          if (n > 0 && n < 1) {
            return {
              id:
                vertex1.id > vertex2.id
                  ? `${vertex1.id}-${vertex2.id}`
                  : `${vertex2.id}-${vertex1.id}`,
              x: vertex2.point.x + n * (vertex1.point.x - vertex2.point.x),
              y: -(vertex2.point.z + n * (vertex1.point.z - vertex2.point.z)),
            };
          }
          return null;
        })
        .filter((x) => x !== null);

      return retArray.length === 2
        ? some(
          retArray as [
            { id: string; x: number; y: number },
            { id: string; x: number; y: number }
          ]
        )
        : none;
    };
  };

  public getDirection = (wall: [IPoint2D, IPoint2D],
    displacements: OptionMap<string, { x: number, y: number }>): Option<Direction> => {
    return chain((disp: { x: number, y: number }) => {
      const up = { x: 0, y: -1 };
      const down = { x: 0, y: 1 };
      const left = { x: -1, y: 0 };
      const right = { x: 1, y: 0 };
      const normal = normalize(scale(dot({ x: wall[0].y - wall[1].y, y: wall[1].x - wall[0].x })
        (disp))({ x: wall[0].y - wall[1].y, y: wall[1].x - wall[0].x }));
      const normal_dot = dot(normal);
      if (normal_dot(up) > 0.99) {
        return some(Direction.North);
      }
      if (normal_dot(down) > 0.99) {
        return some(Direction.South);
      }
      if (normal_dot(left) > 0.99) {
        return some(Direction.East);
      }
      if (normal_dot(right) > 0.99) {
        return some(Direction.West);
      }
      return none;
    })(displacements.get(wall[0].id))

  }

}

export interface IPoint2D {
  id: string;
  x: number;
  y: number;
}

export interface IFLoorplan {
  walls: Array<{
    wall: [IPoint2D, IPoint2D];
    sections: [IPoint2D, IPoint2D][];
    doors: [IPoint2D, IPoint2D][];
    windows: [IPoint2D, IPoint2D][];
  }>;
}

export enum Direction {
  North,
  South,
  West,
  East
}

const normalize = (point: { x: number; y: number }): ({ x: number; y: number }) => {
  const length = Math.sqrt(point.x * point.x + point.y * point.y);
  return { x: point.x / length, y: point.y / length };
};

const subtract = (point1: {
  x: number;
  y: number;
}): ((point2: { x: number; y: number }) => { x: number; y: number }) => {
  return (point2: { x: number; y: number }) => {
    return { x: point1.x - point2.x, y: point1.y - point2.y };
  };
};

const scale = (
  scale: number
): ((point: { x: number; y: number }) => { x: number; y: number }) => {
  return (point: { x: number; y: number }) => {
    return { x: point.x * scale, y: point.y * scale };
  };
};

const dot = (point1: {
  x: number;
  y: number;
}): ((point2: { x: number; y: number }) => number) => {
  return (point2: { x: number; y: number }) => {
    return point1.x * point2.x + point1.y * point2.y;
  };
};