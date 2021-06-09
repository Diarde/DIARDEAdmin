import * as svgBuilder from "svg-builder";
import { none, some, getOrElse, map, Option, isSome } from "fp-ts/lib/Option";
import { mapToOptionMap, OptionMap } from "src/app/utility/optionmap";
import { block, ifblock } from "src/app/utility/functional";
import { IVertex, IModel, IPoint } from "src/app/services/geometry.service";
import { fromCompare } from 'fp-ts/lib/Ord';
import { fromArray, NonEmptyArray, max, min } from 'fp-ts/lib/NonEmptyArray';
import { flatten, rotate } from "fp-ts/lib/Array";
import { Model } from './model';


export class FloorplanBuilder {
  private scale = 60;
  private offset = 350;
  private builder = svgBuilder.newInstance();



  constructor() {
    this.builder.width(700).height(700).rect({
      x: 0,
      y: 0,
      width: 701,
      height: 701,
      fill: "#000000",
      "stroke-width": 2,
    });



  }

  public build = (model: IModel): string => {
    const modeller = new Model();
    const floorplan: IFLoorplan = modeller.getFloorplan(model);
    const displacements = modeller.getDisplacementMap(floorplan);

    const builder = this.builder;

    this.makeDimensions(floorplan, this.getDirection(modeller, displacements));
    this.makeStructure(floorplan, displacements);

    builder.text({
      x: 0,
      y: 0,
      transform: "translate(100 100)",
      "font-family": "helvetica",
      "font-size": 9,
      "font-weight": "lighter",
      stroke: "#ff4500",
      fill: "#ff4500",
    },
      "DIARDE"
    );

    const retString = builder.render();
    const regexp = new RegExp('<svg' + '([^=,]*)=("[^"]*"|[^,"]*)');
    return retString.replace(regexp, '<svg viewBox="0 0 700 700"');
    return retString;
  };

  private makeDimensions = (floorplan: IFLoorplan, getDirection: ((wall: [IPoint2D, IPoint2D]) => Option<Direction>)) => {
    const builder = this.builder;
    const offset = this.offset;
    const scale = this.scale;

    const compareX = fromCompare<IPoint2D>((a, b) => (a.x > b.x ? 1 : -1));
    const compareY = fromCompare<IPoint2D>((a, b) => (a.y > b.y ? 1 : -1));
    const compareArray = fromArray(
      flatten(
        floorplan.walls.map((wall) => {
          return wall.wall;
        })
      )
    );

    const wallAndDirections = floorplan.walls.map(wall => ({ wall: wall, direction: getDirection(wall.wall) }));
    const wallsNorth = wallAndDirections.filter(wallAndDirection => {
      return getOrElse(() => false)(map((direction) => direction === Direction.North)(wallAndDirection.direction));
    });
    const wallsSouth = wallAndDirections.filter(wallAndDirection => {
      return getOrElse(() => false)(map((direction) => direction === Direction.South)(wallAndDirection.direction));
    });
    const wallsEast = wallAndDirections.filter(wallAndDirection => {
      return getOrElse(() => false)(map((direction) => direction === Direction.East)(wallAndDirection.direction));
    });
    const wallsWest = wallAndDirections.filter(wallAndDirection => {
      return getOrElse(() => false)(map((direction) => direction === Direction.West)(wallAndDirection.direction));
    });

    map((array: NonEmptyArray<IPoint2D>) => {
      const maxX = max(compareX)(array).x;
      const maxY = max(compareY)(array).y;
      const minX = min(compareX)(array).x;
      const minY = min(compareY)(array).y;

      const drawX = (walls: {
        wall: [IPoint2D, IPoint2D];
        sections: [IPoint2D, IPoint2D][];
        doors: [IPoint2D, IPoint2D][];
        windows: [IPoint2D, IPoint2D][];
      }[],
        start: number, step: number, rotation: number
      ) => {
        const hasDoorsOrWalls = (walls.filter(wall => wall.doors.length > 0 || wall.windows.length > 0).length > 0);
        const hasMultipleWalls = (walls.length > 1);

        let _offset = 1;

        if (hasDoorsOrWalls) {
          builder.line({
            x1: offset + scale * minX,
            y1: offset + scale * (start + step * (_offset)),
            x2: offset + scale * maxX,
            y2: offset + scale * (start + step * (_offset)),
            stroke: "#FF4500",
            "stroke-width": 1,
          });
          walls.forEach(wall => {
            flatten(wall.sections).forEach(section => {
              builder.line({
                x1: offset + scale * section.x,
                y1: offset + scale * (start + step * (_offset + 0.1)),
                x2: offset + scale * section.x,
                y2: offset + scale * (start + step * (_offset - 0.1)),
                stroke: "#FF4500",
                "stroke-width": 1,
              });
            });
            wall.sections.concat(wall.doors, wall.windows).forEach(section =>{
              builder.text({
                x: 0,
                y: 0,
                "transform": `translate(${offset + scale / 2 * (section[0].x + section[1].x)} ${offset + scale * (start + step * (_offset + 0.1))}) rotate(${rotation}) translate(-10)`,
                "font-family": "helvetica",
                "font-size": 9,
                "font-weight": "lighter",
                stroke: "#ff4500",
                fill: "#ff4500",
              },
                (Math.round(Math.abs(section[0].x - section[1].x) * 100) / 100).toString(10)
              );
            });
          });
          _offset += 0.5;
        }

        if (hasMultipleWalls) {
          builder.line({
            x1: offset + scale * minX,
            y1: offset + scale * (start + step * (_offset)),
            x2: offset + scale * maxX,
            y2: offset + scale * (start + step * (_offset)),
            stroke: "#FF4500",
            "stroke-width": 1,
          });
          walls.forEach(wall => {
            wall.wall.forEach(point =>               
              builder.line({
              x1: offset + scale * point.x,
              y1: offset + scale * (start + step * (_offset + 0.1)),
              x2: offset + scale * point.x,
              y2: offset + scale * (start + step * (_offset - 0.1)),
              stroke: "#FF4500",
              "stroke-width": 1,
            }));
            builder.text({
              x: 0,
              y: 0,
              "transform": `translate(${offset + scale / 2 * (wall.wall[0].x + wall.wall[1].x)} ${offset + scale * 
                    (start + step * (_offset + 0.1))}) rotate(${rotation}) translate(-10)`,
              "font-family": "helvetica",
              "font-size": 9,
              "font-weight": "lighter",
              stroke: "#ff4500",
              fill: "#ff4500",
            },
              (Math.round(Math.abs(wall.wall[0].x - wall.wall[1].x) * 100) / 100).toString(10)
            );
          });
          _offset += 0.5;
        }

        builder.line({
          x1: offset + scale * minX,
          y1: offset + scale * (start + step * (_offset)),
          x2: offset + scale * maxX,
          y2: offset + scale * (start + step * (_offset)),
          stroke: "#FF4500",
          "stroke-width": 1,
        });

        builder.line({
          x1: offset + scale * minX,
          y1: offset + scale * (start + step * (_offset+0.1)),
          x2: offset + scale * minX,
          y2: offset + scale * (start + step * (_offset-0.1)),
          stroke: "#FF4500",
          "stroke-width": 1,
        });

        builder.line({
          x1: offset + scale * maxX,
          y1: offset + scale * (start + step * (_offset+0.1)),
          x2: offset + scale * maxX,
          y2: offset + scale * (start + step * (_offset-0.1)),
          stroke: "#FF4500",
          "stroke-width": 1,
        });

        builder.text({
          x: 0,
          y: 0,
          "transform": `translate(${offset + scale / 2 * (minX + maxX)} ${offset + scale * (start + step * (_offset + 0.1))}) rotate(${rotation}) translate(-10)`,
          "font-family": "helvetica",
          "font-size": 9,
          "font-weight": "lighter",
          stroke: "#ff4500",
          fill: "#ff4500",
        },
          (Math.round(Math.abs(maxX-minX) * 100) / 100).toString(10)
        );
      }

      const drawY = (walls: {
        wall: [IPoint2D, IPoint2D];
        sections: [IPoint2D, IPoint2D][];
        doors: [IPoint2D, IPoint2D][];
        windows: [IPoint2D, IPoint2D][];
      }[],
        start: number, step: number, rotation: number
      ) => {
        const hasDoorsOrWalls = (walls.filter(wall => wall.doors.length > 0 || wall.windows.length > 0).length > 0);
        const hasMultipleWalls = (walls.length > 1);

        let _offset = 1;

        if (hasDoorsOrWalls) {
          builder.line({
            x1: offset + scale * (start + step * (_offset)),
            y1: offset + scale * minY,
            x2: offset + scale * (start + step * (_offset)),
            y2: offset + scale * maxY,
            stroke: "#FF4500",
            "stroke-width": 1,
          });
          walls.forEach(wall => {
            flatten(wall.sections).forEach(section => {
              builder.line({
                x1: offset + scale * (start + step * (_offset + 0.1)),
                y1: offset + scale * section.y,
                x2: offset + scale * (start + step * (_offset - 0.1)),
                y2: offset + scale * section.y,
                stroke: "#FF4500",
                "stroke-width": 1,
              });
            });
            wall.sections.concat(wall.doors, wall.windows).forEach(section =>{
              builder.text({
                x: 0,
                y: 0,
                "transform": `translate(${offset + scale * (start + step * (_offset + 0.1))} ${offset + scale / 2 * (section[0].y + section[1].y)}) rotate(${rotation}) translate(-10)`,
                "font-family": "helvetica",
                "font-size": 9,
                "font-weight": "lighter",
                stroke: "#ff4500",
                fill: "#ff4500",
              },
                (Math.round(Math.abs(section[0].y - section[1].y) * 100) / 100).toString(10)
              );
            });
          });
          _offset += 0.5;
        }

        if (hasMultipleWalls) {
          builder.line({
            x1: offset + scale * (start + step * (_offset)),
            y1: offset + scale * minY,
            x2: offset + scale * (start + step * (_offset)),
            y2: offset + scale * maxY,
            stroke: "#FF4500",
            "stroke-width": 1,
          });
          walls.forEach(wall => {
            wall.wall.forEach(point =>               
              builder.line({
              x1: offset + scale * (start + step * (_offset + 0.1)),
              y1: offset + scale * point.y,
              x2: offset + scale * (start + step * (_offset - 0.1)),
              y2: offset + scale * point.y,
              stroke: "#FF4500",
              "stroke-width": 1,
            }));
            builder.text({
              x: 0,
              y: 0,
              "transform": `translate(${offset + scale * (start + step * (_offset + 0.1))} ${offset + scale / 2 * (wall.wall[0].y + wall.wall[1].y)} ) rotate(${rotation}) translate(-10)`,
              "font-family": "helvetica",
              "font-size": 9,
              "font-weight": "lighter",
              stroke: "#ff4500",
              fill: "#ff4500",
            },
              (Math.round(Math.abs(wall.wall[0].y - wall.wall[1].y) * 100) / 100).toString(10)
            );
          });
          _offset += 0.5;
        }

        builder.line({
          x1: offset + scale * (start + step * (_offset)),
          y1: offset + scale * minY,
          x2: offset + scale * (start + step * (_offset)),
          y2: offset + scale * maxY,
          stroke: "#FF4500",
          "stroke-width": 1,
        });

        builder.line({
          x1: offset + scale * (start + step * (_offset+0.1)),
          y1: offset + scale * minY,
          x2: offset + scale * (start + step * (_offset-0.1)),
          y2: offset + scale * minY,
          stroke: "#FF4500",
          "stroke-width": 1,
        });

        builder.line({
          x1: offset + scale * (start + step * (_offset+0.1)),
          y1: offset + scale * maxY,
          x2: offset + scale * (start + step * (_offset-0.1)),
          y2: offset + scale * maxY,
          stroke: "#FF4500",
          "stroke-width": 1,
        });

        builder.text({
          x: 0,
          y: 0,
          "transform": `translate(${offset + scale * (start + step * (_offset + 0.1))} ${offset + scale / 2 * (minY + maxY)} ) rotate(${rotation}) translate(-10)`,
          "font-family": "helvetica",
          "font-size": 9,
          "font-weight": "lighter",
          stroke: "#ff4500",
          fill: "#ff4500",
        },
          (Math.round(Math.abs(maxY-minY) * 100) / 100).toString(10)
        );
      }

      drawX(wallsNorth.map(walls => walls.wall), minY, -1, 0);
      drawX(wallsSouth.map(walls => walls.wall), maxY, 1, 180);
      drawY(wallsEast.map(walls => walls.wall), minX, -1, -90);
      drawY(wallsWest.map(walls => walls.wall), maxX, 1, 90);

    })(compareArray);

   

  };

  private makeStructure = (
    floorplan: IFLoorplan,
    displacements: OptionMap<
      string,
      {
        x: number;
        y: number;
      }
    >
  ) => {
    const builder = this.builder;
    const offset = this.offset;
    const scale = this.scale;

    floorplan.walls.forEach((wall) => {
      wall.windows.map((window) => {
        map((displacement1: { x: number; y: number }) => {
          map((displacement2: { x: number; y: number }) => {
            const x1 = offset + scale * window[0].x;
            const y1 = offset + scale * window[0].y;
            const x2 = offset + scale * (window[0].x + displacement1.x);
            const y2 = offset + scale * (window[0].y + displacement1.y);
            const x3 = offset + scale * (window[1].x + displacement2.x);
            const y3 = offset + scale * (window[1].y + displacement2.y);
            const x4 = offset + scale * window[1].x;
            const y4 = offset + scale * window[1].y;

            builder.path({
              d: `M ${x1},${y1} L ${x2},${y2} L ${x3},${y3} L ${x4},${y4} Z`,
              stroke: "#FF4500",
              fill: "grey",
              "stroke-width": 0,
            });
          })(displacements.get(window[1].id));
        })(displacements.get(window[0].id));
      });

      wall.doors.map((door) => {
        map((displacement1: { x: number; y: number }) => {
          map((displacement2: { x: number; y: number }) => {
            const x1 = offset + scale * door[0].x;
            const y1 = offset + scale * door[0].y;
            const x2 = offset + scale * (door[0].x + displacement1.x);
            const y2 = offset + scale * (door[0].y + displacement1.y);
            const x3 = offset + scale * (door[1].x + displacement2.x);
            const y3 = offset + scale * (door[1].y + displacement2.y);
            const x4 = offset + scale * door[1].x;
            const y4 = offset + scale * door[1].y;

            builder.path({
              d: `M ${x1},${y1} L ${x2},${y2} L ${x3},${y3} L ${x4},${y4} Z`,
              stroke: "#FF4500",
              fill: "#333333",
              "stroke-width": 0,
            });
          })(displacements.get(door[1].id));
        })(displacements.get(door[0].id));
      });

      wall.sections.map((section) => {
        map((displacement1: { x: number; y: number }) => {
          map((displacement2: { x: number; y: number }) => {
            const x1 = offset + scale * section[0].x;
            const y1 = offset + scale * section[0].y;
            const x2 = offset + scale * (section[0].x + displacement1.x);
            const y2 = offset + scale * (section[0].y + displacement1.y);
            const x3 = offset + scale * (section[1].x + displacement2.x);
            const y3 = offset + scale * (section[1].y + displacement2.y);
            const x4 = offset + scale * section[1].x;
            const y4 = offset + scale * section[1].y;

            builder.path({
              d: `M ${x1},${y1} L ${x2},${y2} L ${x3},${y3} L ${x4},${y4} Z`,
              stroke: "#FF4500",
              fill: "#FF4500",
              "stroke-width": 0,
            });

            [
              [
                { x: x1, y: y1 },
                { x: x2, y: y2 },
              ],
              [
                { x: x2, y: y2 },
                { x: x3, y: y3 },
              ],
              [
                { x: x3, y: y3 },
                { x: x4, y: y4 },
              ],
              [
                { x: x4, y: y4 },
                { x: x1, y: y1 },
              ],
            ].forEach(
              (
                segment: [{ x: number; y: number }, { x: number; y: number }]
              ) => {
                builder.line({
                  x1: segment[0].x,
                  y1: segment[0].y,
                  x2: segment[1].x,
                  y2: segment[1].y,
                  stroke: "#ff662e",
                  "stroke-width": 1,
                });
              }
            );
          })(displacements.get(section[1].id));
        })(displacements.get(section[0].id));
      });
    });
  };

  private getDirection = (modeller: Model, displacements: OptionMap<string, { x: number, y: number }>):
    ((wall: [IPoint2D, IPoint2D]) => Option<Direction>) => {
    return (wall: [IPoint2D, IPoint2D]) => {
      return modeller.getDirection(wall, displacements);
    }
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
