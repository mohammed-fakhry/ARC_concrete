import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-dynamic-input-dialog',
  templateUrl: './dynamic-input-dialog.component.html',
  styleUrls: ['./dynamic-input-dialog.component.scss']
})
export class DynamicInputDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
  }

}
