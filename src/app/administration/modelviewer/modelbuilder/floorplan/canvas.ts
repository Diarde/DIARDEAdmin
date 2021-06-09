import { fabric } from 'fabric';
import { IPoint2D } from './floorplan';
import { Model, Direction, IFLoorplan } from './model';
import { OptionMap } from 'src/app/utility/optionmap';
import { Option, map, getOrElse } from 'fp-ts/lib/Option';
import { flatten } from 'fp-ts/lib/Array';
import { NonEmptyArray, max, min, fromArray } from 'fp-ts/lib/NonEmptyArray';
import { fromCompare } from 'fp-ts/lib/Ord';
import { IModel } from 'src/app/services/geometry.service';


export class CanvasFloorplanBuilder {

    private scale = 60;
    private offset = 350;

    constructor(private canvas: fabric.Canvas) {
        canvas.clear();

    }

    public build = (model: IModel) => {
        const modeller = new Model();
        const floorplan: IFLoorplan = modeller.getFloorplan(model);
        const displacements = modeller.getDisplacementMap(floorplan);

        this.makeDimensions(floorplan, this.getDirection(modeller, displacements));
        this.makeStructure(floorplan, displacements);

    };

    private makeDimensions = (floorplan: IFLoorplan, getDirection: ((wall: [IPoint2D, IPoint2D]) => Option<Direction>)) => {
        const offset = this.offset;
        const scale = this.scale;

        const line = (x1: number, y1: number, x2: number, y2: number) => {
            this.canvas.add(new fabric.Line([offset + scale * x1,
            offset + scale * y1,
            offset + scale * x2,
            offset + scale * y2],
                {
                    fill: '#FF4500',
                    stroke: '#FF4500',
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                }));
        };

        const text = (value: number, x: number, y: number, angle: number) => {
            const text = new fabric.IText((value).toFixed(2), {
                fontSize: 10,
                fill: '#FF4500',
                strokeWidth: .5,
                originX: 'center',
                originY: 'bottom',
            });
            text.set({ left: offset + scale * x, top: offset + scale * y });
            text.set({ angle: angle })
            this.canvas.add(text);
        }

        const compareX = fromCompare<IPoint2D>((a, b) => (a.x > b.x ? 1 : -1));
        const compareY = fromCompare<IPoint2D>((a, b) => (a.y > b.y ? 1 : -1));
        const compareArray = fromArray(
            flatten(floorplan.walls.map((wall) => {
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
                    line(minX, (start + step * (_offset)), maxX, (start + step * (_offset)));
                    walls.forEach(wall => {
                        flatten(wall.sections).forEach(section => {
                            line(section.x, (start + step * (_offset + 0.1)), section.x, (start + step * (_offset - 0.1)))
                        });
                        wall.sections.concat(wall.doors, wall.windows).forEach(section => {
                            text(Math.abs(section[0].x - section[1].x), (section[0].x + section[1].x) / 2,
                                (start + step * (_offset + 0.1)),
                                rotation);
                        });
                    });
                    _offset += 0.5;
                }

                if (hasMultipleWalls) {
                    line(minX, (start + step * (_offset)), maxX, (start + step * (_offset)));
                    walls.forEach(wall => {
                        wall.wall.forEach(point =>
                            line(point.x, (start + step * (_offset + 0.1)), point.x, (start + step * (_offset - 0.1))));

                        text(Math.abs(wall.wall[0].x - wall.wall[1].x), (wall.wall[0].x + wall.wall[1].x) / 2,
                            (start + step * (_offset + 0.1)),
                            rotation);

                    });
                    _offset += 0.5;
                }

                line(minX, (start + step * (_offset)), maxX, (start + step * (_offset)));
                line(minX, (start + step * (_offset + 0.1)), minX, (start + step * (_offset - 0.1)));
                line(maxX, (start + step * (_offset + 0.1)), maxX, (start + step * (_offset - 0.1)));

                text(Math.abs(maxX - minX), (minX + maxX) / 2,
                    (start + step * (_offset + 0.1)),
                    rotation);

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
                    line((start + step * (_offset)), minY, (start + step * (_offset)), maxY);
                    walls.forEach(wall => {
                        flatten(wall.sections).forEach(section => {
                            line((start + step * (_offset + 0.1)), section.y, (start + step * (_offset - 0.1)), section.y);
                        });
                        wall.sections.concat(wall.doors, wall.windows).forEach(section => {
                            text(Math.abs(section[0].y - section[1].y), (start + step * (_offset + 0.1)),
                                (section[0].y + section[1].y) / 2,
                                rotation);
                        });
                    });
                    _offset += 0.5;
                }

                if (hasMultipleWalls) {
                    line((start + step * (_offset)), minY, (start + step * (_offset)), maxY);
                    walls.forEach(wall => {
                        wall.wall.forEach(point =>
                            line((start + step * (_offset + 0.1)), point.y, (start + step * (_offset - 0.1)), point.y));

                        text(Math.abs(wall.wall[0].y - wall.wall[1].y), (start + step * (_offset + 0.1)),
                            (wall.wall[0].y + wall.wall[1].y) / 2,
                            rotation);
                    });
                    _offset += 0.5;
                }

                line((start + step * (_offset)), minY, (start + step * (_offset)), maxY);
                line((start + step * (_offset + 0.1)), minY, (start + step * (_offset - 0.1)), minY);
                line((start + step * (_offset + 0.1)), maxY, (start + step * (_offset - 0.1)), maxY);

                text(Math.abs(maxY - minY), (start + step * (_offset + 0.1)),
                    (minY + maxY) / 2,
                    rotation);
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

        const offset = this.offset;
        const scale = this.scale;

        const drawDoor = (x1: number, y1: number, x2: number, y2: number,
            x3: number, y3: number, x4: number, y4: number) => {

            const points = [
                { x: offset + scale * x1, y: offset + scale * y1 },
                { x: offset + scale * x2, y: offset + scale * y2 },
                { x: offset + scale * x3, y: offset + scale * y3 },
                { x: offset + scale * x4, y: offset + scale * y4 }];

            this.canvas.add(new fabric.Polygon(points, {
                originX: 'left',
                originY: 'top',
                selectable: false,
                objectCaching: false,
                perPixelTargetFind: false,
                fill: '#333333'
            }));

        };

        const drawWindow = (x1: number, y1: number, x2: number, y2: number,
            x3: number, y3: number, x4: number, y4: number) => {

            const points = [
                { x: offset + scale * x1, y: offset + scale * y1 },
                { x: offset + scale * x2, y: offset + scale * y2 },
                { x: offset + scale * x3, y: offset + scale * y3 },
                { x: offset + scale * x4, y: offset + scale * y4 }];

            this.canvas.add(new fabric.Polygon(points, {
                originX: 'left',
                originY: 'top',
                selectable: false,
                objectCaching: false,
                perPixelTargetFind: false,
                fill: 'gray'
            }));

        };

        const drawWall = (x1: number, y1: number, x2: number, y2: number,
            x3: number, y3: number, x4: number, y4: number) => {

            const points = [
                { x: offset + scale * x1, y: offset + scale * y1 },
                { x: offset + scale * x2, y: offset + scale * y2 },
                { x: offset + scale * x3, y: offset + scale * y3 },
                { x: offset + scale * x4, y: offset + scale * y4 }];

            this.canvas.add(new fabric.Polygon(points, {
                originX: 'left',
                originY: 'top',
                selectable: false,
                objectCaching: false,
                perPixelTargetFind: false,
                fill: '#FF4500',
                stroke: "#ff662e"
            }));

        };

        floorplan.walls.forEach((wall) => {
            wall.windows.map((window) => {
                map((displacement1: { x: number; y: number }) => {
                    map((displacement2: { x: number; y: number }) => {
                        const x1 = window[0].x;
                        const y1 = window[0].y;
                        const x2 = (window[0].x + displacement1.x);
                        const y2 = (window[0].y + displacement1.y);
                        const x3 = (window[1].x + displacement2.x);
                        const y3 = (window[1].y + displacement2.y);
                        const x4 = window[1].x;
                        const y4 = window[1].y;

                        drawWindow(x1, y1, x2, y2, x3, y3, x4, y4);
                    })(displacements.get(window[1].id));
                })(displacements.get(window[0].id));
            });

            wall.doors.map((door) => {
                map((displacement1: { x: number; y: number }) => {
                    map((displacement2: { x: number; y: number }) => {
                        const x1 = door[0].x;
                        const y1 = door[0].y;
                        const x2 = (door[0].x + displacement1.x);
                        const y2 = (door[0].y + displacement1.y);
                        const x3 = (door[1].x + displacement2.x);
                        const y3 = (door[1].y + displacement2.y);
                        const x4 = door[1].x;
                        const y4 = door[1].y;

                        drawDoor(x1, y1, x2, y2, x3, y3, x4, y4);
                    })(displacements.get(door[1].id));
                })(displacements.get(door[0].id));
            });

            wall.sections.map((section) => {
                map((displacement1: { x: number; y: number }) => {
                    map((displacement2: { x: number; y: number }) => {
                        const x1 = section[0].x;
                        const y1 = section[0].y;
                        const x2 = (section[0].x + displacement1.x);
                        const y2 = (section[0].y + displacement1.y);
                        const x3 = (section[1].x + displacement2.x);
                        const y3 = (section[1].y + displacement2.y);
                        const x4 = section[1].x;
                        const y4 = section[1].y;

                        drawWall(x1, y1, x2, y2, x3, y3, x4, y4);
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