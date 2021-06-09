import { mapNotNone, block, ifblock, accumulateOption } from "src/app/utility/functional";
import { some, none, map, Option, isNone } from "fp-ts/lib/Option";
import { mapToOptionMap, OptionMap } from "src/app/utility/optionmap";
import * as earcut from "earcut";
import { IVertex, IModel, IPoint } from "src/app/services/geometry.service";
import { rotate, zip } from "fp-ts/lib/Array";
import * as BABYLON from "babylonjs";

export class ModelBuilder {
  constructor(private scene: BABYLON.Scene) {}

  public updateModel(model: IModel) {
    this.clearScene();

    model.data.cameras.forEach((camera: ICamera) => {
      this.addCamera(camera);
    });

    const vertexMap = mapToOptionMap<IVertex, string, IPoint>(
      (vertex: IVertex) => [vertex.id, vertex.point]
    )(model.data.model.vertices);
    const ground: Array<{ x: number; y: number }> = mapNotNone((vertexid) => {
      return map((point: any) => {
        return { x: point.x, y: point.z };
      })(vertexMap.get(vertexid));
    })(model.data.model.ground);

    this.addHorizontalPolygon(ground);

    const displacementMap = block<
      Array<{ id: string; point: { x: number; y: number } }>,
      OptionMap<string, BABYLON.Vector2>
    >((points: Array<{ id: string; point: { x: number; y: number } }>) => {
      const outerSign = Math.sign(
        points
          .map(
            (
              node: { id: string; point: { x: number; y: number } },
              index: number
            ) => {
              const point = node.point;
              const previousPoint =
                points[(index - 1 + points.length) % points.length].point;
              const nextPoint =
                points[(index + 1 + points.length) % points.length].point;
              const v1 = new BABYLON.Vector2(
                point.x - previousPoint.x,
                point.y - previousPoint.y
              ).normalize();
              const v2 = new BABYLON.Vector2(
                nextPoint.x - point.x,
                nextPoint.y - point.y
              ).normalize();
              return v1.x * v2.y - v1.y * v2.x;
            }
          )
          .reduce((a, b) => a + b, 0)
      );
      return mapToOptionMap<unknown, string, BABYLON.Vector2>((x) => x)(
        points.map(
          (
            node: { id: string; point: { x: number; y: number } },
            index: number
          ) => {
            const point = node.point;
            const previousPoint =
              points[(index - 1 + points.length) % points.length].point;
            const nextPoint =
              points[(index + 1 + points.length) % points.length].point;
            const v1 = new BABYLON.Vector2(
              point.x - previousPoint.x,
              point.y - previousPoint.y
            ).normalize();
            const v2 = new BABYLON.Vector2(
              nextPoint.x - point.x,
              nextPoint.y - point.y
            ).normalize();
            return ifblock<[string, BABYLON.Vector2]>(
              () => {
                return [
                  node.id,
                  new BABYLON.Vector2(v1.y, -v1.x).scale(0.15 * outerSign),
                ];
              },
              () => {
                const v3 = v1.subtract(v2).normalize();
                const scale = 0.15 / Math.abs(v3.x * v2.y - v3.y * v2.x);
                return [
                  node.id,
                  v3.scale(
                    scale * outerSign * Math.sign(v1.x * v2.y - v1.y * v2.x)
                  ),
                ];
              }
            )(
              v1.x === v2.x && v1.y === v2.y
            );
          }
        )
      );
    })(
      mapNotNone((vertexid: string) => {
        return map((point: IPoint) => {
          return { id: vertexid, point: { x: point.x, y: point.z } };
        })(vertexMap.get(vertexid));
      })(model.data.model.ground)
    );

    //this.errorService.logMessage(`Add ${model.model.faces.length} faces to the WebGL Scene.`);
    model.data.model.faces.forEach((face) => {
      const [node1, node2, node3, node4] = face.vertices as [
        string,
        string,
        string,
        string
      ];

      map((displacement1: BABYLON.Vector2) => {
        map((displacement2: BABYLON.Vector2) => {
          map((point1: IPoint) => {
            map((point2: IPoint) => {
              map((point3: IPoint) => {
                map((point4: IPoint) => {
                  const windows = face.windows.map((window: Array<string>) =>
                    mapNotNone((vertexid: string) => {
                      return vertexMap.get(vertexid);
                    })(window)
                  );

                  const doors = face.doors.map((door: Array<string>) =>
                    mapNotNone((vertexid: string) => {
                      return vertexMap.get(vertexid);
                    })(door)
                  );

                  const getNormalDisplacement = (
                    point1: IPoint,
                    point2: IPoint,
                    displacement: BABYLON.Vector2
                  ): BABYLON.Vector2 => {
                    const retVector = new BABYLON.Vector2(
                      point2.z - point1.z,
                      point1.x - point2.x
                    );
                    retVector.normalize();
                    return retVector.scale(
                      BABYLON.Vector2.Dot(retVector, displacement)
                    );
                  };

                  const displacements = [
                    displacement1,
                    displacement2,
                    getNormalDisplacement(point1, point2, displacement1),
                  ].map(
                    (displacement) =>
                      new BABYLON.Vector3(displacement.x, 0, displacement.y)
                  ) as [BABYLON.Vector3, BABYLON.Vector3, BABYLON.Vector3];
                  //this.errorService.logMessage('Add new wall/face.');
                  this.addWall(
                    face.id,
                    [point1, point2, point3, point4].map(
                      (point: any) =>
                        new BABYLON.Vector3(point.x, point.y, point.z)
                    ) as [
                      BABYLON.Vector3,
                      BABYLON.Vector3,
                      BABYLON.Vector3,
                      BABYLON.Vector3
                    ],
                    windows.map((hole) =>
                      hole.map(
                        (vector) =>
                          new BABYLON.Vector3(vector.x, vector.y, vector.z)
                      )
                    ),
                    doors.map((hole) =>
                      hole.map(
                        (vector) =>
                          new BABYLON.Vector3(vector.x, vector.y, vector.z)
                      )
                    ),
                    displacements
                  );
                })(vertexMap.get(node4));
              })(vertexMap.get(node3));
            })(vertexMap.get(node2));
          })(vertexMap.get(node1));
        })(
          this.errorOnNone<BABYLON.Vector2>(
            `Could not find node ${node2} in displacement map.`
          )(displacementMap.get(node2))
        );
      })(
        this.errorOnNone<BABYLON.Vector2>(
          `Could not find node ${node1} in displacement map.`
        )(displacementMap.get(node1))
      );
    });
  }

  private addCamera(cam: {
    position: IPoint;
    orientation: { trihedral: ITrihedral };
  }) {
    const camera = BABYLON.MeshBuilder.CreateBox(
      "camera",
      {
        depth: 1,
        width: 1,
        height: 1,
      },
      this.scene
    );

    const body = BABYLON.MeshBuilder.CreateBox(
      "body",
      {
        depth: 2 * 0.03,
        width: 2 * 0.15,
        height: 2 * 0.08,
      },
      this.scene
    );

    const lense = BABYLON.MeshBuilder.CreateCylinder(
      "lense",
      {
        diameter: 0.1,
        height: 0.1,
      },
      this.scene
    );

    body.parent = camera;
    lense.parent = camera;

    lense.rotateAround(
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(1, 0, 0),
      Math.PI / 2
    );
    lense.translate(new BABYLON.Vector3(0, 1, 0), 0.05);

    camera.isVisible = false;

    camera.rotationQuaternion = this.getRotationFromTrihedral(
      cam.orientation.trihedral.v1,
      cam.orientation.trihedral.v2,
      cam.orientation.trihedral.v3
    );
    camera.position = new BABYLON.Vector3(
      cam.position.x,
      cam.position.y,
      cam.position.z
    );
  }

  private addWall(
    id: string,
    points: [
      BABYLON.Vector3,
      BABYLON.Vector3,
      BABYLON.Vector3,
      BABYLON.Vector3
    ],
    windows: Array<Array<BABYLON.Vector3>>,
    doors: Array<Array<BABYLON.Vector3>>,
    displacements: [BABYLON.Vector3, BABYLON.Vector3, BABYLON.Vector3]
  ) {
    const [point1, point2, point3, point4] = points;
    const [displacement1, displacement2, displacement3] = displacements;
    const point5 = point1.add(displacement1);
    const point6 = point2.add(displacement2);
    const point7 = point3.add(displacement2);
    const point8 = point4.add(displacement1);

    const v1 = point2.subtract(point1);
    const v2 = point4.subtract(point1);
    const quaternion: BABYLON.Quaternion = this.getRotatation(v1, v2);

    const innerHoles = windows.map((vectors) =>
      vectors.map((vector) => new BABYLON.Vector3(vector.x, vector.y, vector.z))
    );
    const outerHoles = windows.map((vectors) =>
      vectors.map((vector) =>
        new BABYLON.Vector3(vector.x, vector.y, vector.z).add(displacement3)
      )
    );

    const innerPoints = [point1].concat(doors[0], [point2, point3, point4]);
    const outerPoints = [point5].concat(
      doors[0].map((vec) => vec.add(displacement3)),
      [point6, point7, point8]
    );

    this.addFace(id, innerPoints, innerHoles, quaternion);
    this.addFace(id, outerPoints, outerHoles, quaternion);
    this.addPlane(id, [point3, point4, point8, point7]);
    this.addPlane(id, [point1, point2, point6, point5]);
    zip(
      mapNotNone((x) => (x.length > 0 ? some(x) : none))(innerHoles),
      mapNotNone((x) => (x.length > 0 ? some(x) : none))(outerHoles)
    ).forEach((value) => {
      const [[p1, p2, p3, p4], [p5, p6, p7, p8]] = value;
      this.addPlane(id, [p1, p2, p6, p5]);
      this.addPlane(id, [p2, p3, p7, p6]);
      this.addPlane(id, [p3, p4, p8, p7]);
      this.addPlane(id, [p4, p1, p5, p8]);
    });

    block((door: BABYLON.Vector3[]) => {
      zip(door, rotate(1)(door)).forEach((value) => {
        const [p1, p2] = value;
        const p3 = p2.add(displacement3);
        const p4 = p1.add(displacement3);
        this.addPlane(id, [p1, p2, p3, p4]);
      });
      return null;
    })(doors[0]);
  }

  private addFace(
    id: string,
    vectors: Array<BABYLON.Vector3>,
    holes: Array<Array<BABYLON.Vector3>>,
    quaternion: BABYLON.Quaternion
  ) {
    const customMesh2 = new BABYLON.Mesh(id, this.scene);
    const vertexData = new BABYLON.VertexData();
    const pos2d = vectors.concat.apply(vectors, holes).map((vector) => {
      const vec = new BABYLON.Vector3(0, 0, 0);
      vector.rotateByQuaternionToRef(quaternion, vec);
      return vec;
    });
    vertexData.positions = this.flatten(pos2d);
    vertexData.indices =
      holes.length > 0 && holes[0].length > 0
        ? earcut(
            this.flatten2d(pos2d),
            holes
              .map((hole) => hole.length)
              .reduce(
                (a, b) => {
                  const array = (a as Array<number>).splice(0);
                  array.push(
                    (array as Array<number>)[
                      (array as Array<number>).length - 1
                    ] + (b as number)
                  );
                  return array;
                },
                [vectors.length]
              )
              .slice(0, holes.length)
          )
        : earcut(this.flatten2d(pos2d));
    vertexData.uvs = this.flatten2d(pos2d).map((x) => x / 2);

    vertexData.applyToMesh(customMesh2);
    const mat = new BABYLON.StandardMaterial("mat0", this.scene);
    mat.diffuseTexture = new BABYLON.Texture(
      "assets/images/wall.jpg",
      this.scene
    );

    mat.backFaceCulling = false;
    customMesh2.material = mat;
    customMesh2.rotationQuaternion = BABYLON.Quaternion.Inverse(quaternion);
  }

  private addPlane(
    id: string,
    coords: [BABYLON.Vector3, BABYLON.Vector3, BABYLON.Vector3, BABYLON.Vector3]
  ) {
    const customMesh2 = new BABYLON.Mesh(id, this.scene);
    const vertexData = new BABYLON.VertexData();

    vertexData.positions = this.flatten(coords);
    vertexData.indices = [0, 1, 2, 0, 2, 3];

    vertexData.applyToMesh(customMesh2);
    const mat = new BABYLON.StandardMaterial("mat", this.scene);
    mat.backFaceCulling = false;
    customMesh2.material = mat;
  }

  private addHorizontalPolygon(points: Array<{ x: number; y: number }>) {
    const customMesh2 = new BABYLON.Mesh("ground", this.scene);
    const vertexData = new BABYLON.VertexData();

    const pos2d = points.map(
      (point) => new BABYLON.Vector3(point.x, 0, point.y)
    );
    vertexData.positions = this.flatten(pos2d);
    vertexData.indices = earcut(this.flatten2d(pos2d));
    vertexData.uvs = this.flatten2d(pos2d).map((x) => x / 2);

    vertexData.applyToMesh(customMesh2);

    const mat0 = new BABYLON.StandardMaterial("mat0", this.scene);
    mat0.diffuseTexture = new BABYLON.Texture(
      "assets/images/floor.jpg",
      this.scene
    );

    const mat2 = new BABYLON.StandardMaterial("mat", this.scene);
    mat0.backFaceCulling = false;
    customMesh2.material = mat0;
  }

  private clearScene() {
    Array.from(this.scene.meshes).forEach((mesh) => mesh.dispose());
  }

  /// Auxliliary Functions

  private flatten(_input: BABYLON.Vector3[]): number[] {
    const retArray: number[] = [];
    _input.forEach((x) => {
      retArray.push(x.x);
      retArray.push(x.y);
      retArray.push(x.z);
    });
    return retArray;
  }

  private flatten2d(_input: BABYLON.Vector3[]): number[] {
    const retArray: number[] = [];
    _input.forEach((x) => {
      retArray.push(x.x);
      retArray.push(x.z);
    });
    return retArray;
  }

  private getRotatation(
    v1: BABYLON.Vector3,
    v2: BABYLON.Vector3
  ): BABYLON.Quaternion {
    v1.normalize();
    v2.normalize();
    const vn1 = BABYLON.Vector3.Cross(v1, v2).normalize();
    const vn2 = new BABYLON.Vector3(0, 1, 0);
    const angle = Math.acos(BABYLON.Vector3.Dot(vn1, vn2));
    const axis = BABYLON.Vector3.Cross(vn1, vn2);
    const quaternion: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(
      axis,
      angle
    );

    return block<BABYLON.Quaternion, BABYLON.Quaternion>(
      (quaternion) => {
        return block<BABYLON.Vector3, BABYLON.Quaternion>((vector: BABYLON.Vector3) => {
          new BABYLON.Vector3(0, 1, 0).rotateByQuaternionToRef(
            quaternion,
            vector
          );
          const vn1 = vector.normalize();
          const vn2 = new BABYLON.Vector3(0, 0, 1);
          const angle = Math.acos(BABYLON.Vector3.Dot(vn1, vn2));
          const axis = BABYLON.Vector3.Cross(vn1, vn2);
          return BABYLON.Quaternion.RotationAxis(axis, angle).multiply(
            quaternion
          );
        })(new BABYLON.Vector3(0, 0, 0));
      }
    )(quaternion);
  }

  private getRotationFromTrihedral(
    v1: IPoint,
    v2: IPoint,
    v3: IPoint
  ): BABYLON.Quaternion {
    const rotMatrix = BABYLON.Matrix.FromValues(
      v1.x,
      v1.y,
      v1.z,
      0,
      v2.x,
      v2.y,
      v2.z,
      0,
      v3.x,
      v3.y,
      v3.z,
      0,
      0,
      0,
      0,
      1
    );
    return BABYLON.Quaternion.FromRotationMatrix(rotMatrix).conjugate();
  }

  private errorOnNone = <T>(
    message: string
  ): ((value: Option<T>) => Option<T>) => {
    return (value: Option<T>) => {
      if (isNone(value)) {
        console.log(message);
      }
      return value;
    };
  };
}

export interface ICamera {
  position: IPoint;
  orientation: { trihedral: ITrihedral };
  image: {
    url: string;
    format: { x: number; y: number };
  };
  f: number;
}

export interface ITrihedral {
  v1: IPoint;
  v2: IPoint;
  v3: IPoint;
}
