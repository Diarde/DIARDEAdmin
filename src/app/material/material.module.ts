import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatCardModule,
    MatInputModule, MatDialogModule, MatTableModule, MatListModule, MatSidenavModule,
    MatExpansionModule, MatPaginatorModule, MatIconModule, DragDropModule, MatMenuModule, 
    MatTooltipModule, MatTabsModule],
  exports: [CommonModule, MatToolbarModule, MatButtonModule, MatCardModule,
    MatInputModule, MatDialogModule, MatTableModule, MatListModule, MatSidenavModule,
    MatExpansionModule, MatPaginatorModule, MatIconModule, DragDropModule, MatMenuModule, 
    MatTooltipModule, MatTabsModule],
})
export class CustomMaterialModule { }

