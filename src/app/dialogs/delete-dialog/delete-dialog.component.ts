import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss'],
})
export class DeleteDialogComponent implements OnInit {
  canDel: boolean = false;
  delBtnVal: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _auth: AuthService
  ) {}

  ngOnInit(): void {
    let sessionGet = sessionStorage.getItem('y');
    //let check: any;
    //if (sessionGet) check = JSON.parse(sessionGet);
    if (sessionGet) {
      let check = JSON.parse(sessionGet);
      this.canDel = check.del ? true : false;
      this.delBtnVal = check.del ? 'حذف' : 'لا توجد صلاحية للحذف';
      if (check.prem && check.del) {
        if (this.data.btn) {
          this.delBtnVal = this.data.btn;
        }
      }
    }

    this.playAlert()
  }

  playAlert() {
    const sound = document.getElementById('alertAudio') as HTMLAudioElement;
    if (sound) sound.play();
  }

  playLongPop() {
    const longPop = document.getElementById('longPop') as HTMLAudioElement;
    if (longPop) longPop.play();
  }
}
