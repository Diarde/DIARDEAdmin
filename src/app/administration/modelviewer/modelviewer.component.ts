import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from "@angular/core";
import * as BABYLON from "babylonjs";
import { Option, none, some, map } from 'fp-ts/lib/Option';
import { ModelBuilder } from "./modelbuilder/model";
import { ModelviewerService } from './modelviewer.service';
import { Subscription } from 'rxjs';
import { IModel } from 'src/app/services/geometry.service';
import { FloorplanBuilder } from './modelbuilder/floorplan/floorplan';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { fabric } from 'fabric';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Async } from 'src/app/utility/async';
import { CanvasFloorplanBuilder } from './modelbuilder/floorplan/canvas';

@Component({
  selector: "app-modelviewer",
  templateUrl: "./modelviewer.component.html",
  styleUrls: ["./modelviewer.component.scss"],
})
export class ModelviewerComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild("canvas", { static: false }) element;
  private scene: Option<BABYLON.Scene> = none;
  private engine: Option<BABYLON.Engine> = none;
  private modelBuilder: Option<ModelBuilder> = none;

  private subscription: Option<Subscription> = none;

  public svg: SafeHtml = 'SVG';

  private asyncCanvasBuilder = new Async<fabric.Canvas>();

  constructor(private modelService: ModelviewerService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  ngAfterViewInit() {

    //const canvas = document.getElementById('babylon-canvas');
    // load the 3D engine
    setTimeout(() => {
      //const canvas = this.element.nativeElement;

      const canvas = document.getElementById('babylon-canvas') as HTMLCanvasElement;
      const engine = new BABYLON.Engine(canvas, true);
      this.engine = some(engine);

      const scene: BABYLON.Scene = new BABYLON.Scene(engine);
      scene.clearColor = BABYLON.Color3.Black as any;
      this.scene = some(scene);

      const camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI / 3, 75, new BABYLON.Vector3(0, 0, 4.5), scene);
      camera.attachControl(canvas, false);

      camera.setTarget(BABYLON.Vector3.Zero());
      //camera.attachControl(canvas, true);

      const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(5, 10, 0), scene);
      const light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, 10, 5), scene);
      light1.intensity = 0.7;
      light2.intensity = 0.5;

      this.modelBuilder = some(new ModelBuilder(scene));

      engine.runRenderLoop(() => {
        scene.render();
      });

      //window.addEventListener('resize', () => {
      //  engine.resize();
      //});

      setTimeout(() => {
        engine.resize();
      }, 100)

      this.subscription = some(this.modelService.renderModelSubject.subscribe((model: IModel) => {
        map((modelBuilder: ModelBuilder) => {
          modelBuilder.updateModel(model);
        })(this.modelBuilder);
        const str = new FloorplanBuilder().build(model);
        this.svg = this.sanitizer.bypassSecurityTrustHtml(str);

        this.asyncCanvasBuilder.let((canvas => {
          new CanvasFloorplanBuilder(canvas).build(model);
        }));

      }));
    });

  }

  ngOnDestroy() {
    map((subscription: Subscription) => { subscription.unsubscribe() })(this.subscription);
    map((scene: BABYLON.Scene) => scene.dispose())(this.scene);
    map((engine: BABYLON.Engine) => {
      //engine.stopRenderLoop();
      engine.dispose()
    })(this.engine);
  }

  tabClick(tab: MatTabChangeEvent) {
    if (tab.tab.textLabel === 'Canvas' && !this.asyncCanvasBuilder.hasValue) {
      const canvas = new fabric.Canvas("fabric-canvas");
      this.asyncCanvasBuilder.value = canvas;
      canvas.setHeight(700);
      canvas.setWidth(1400);
      canvas.on('mouse:wheel', function (opt) {
        const delta = ((opt.e) as any).deltaY > 0 ? 10 : -10;
        let zoom = canvas.getZoom();
        zoom = zoom * Math.exp(delta / 20);
        if (zoom > 20) {
          zoom = 20;
        }
        if (zoom < 0.01) {
          zoom = 0.01;
        }
        canvas.zoomToPoint({ x: (opt.e as any).offsetX, y: (opt.e as any).offsetY } as any, zoom);
        opt.e.preventDefault();
        canvas.requestRenderAll();
      });

    }
  }


}
