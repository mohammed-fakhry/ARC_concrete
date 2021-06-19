import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-done-dialog',
  templateUrl: './done-dialog.component.html',
  styleUrls: ['./done-dialog.component.scss']
})
export class DoneDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
  }

}
