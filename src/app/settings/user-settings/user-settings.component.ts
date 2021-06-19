import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserData } from 'src/app/classes/user-data';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { Location } from '@angular/common';
import { DoneDialogComponent } from 'src/app/dialogs/done-dialog/done-dialog.component';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  id: string | null = null;
  user: UserData = new UserData();
  reAuth: string | null = null;
  checkedStatue = {
    all: false,
  };
  submitBtn = { val: 'تسجيل' };

  formValid = true;
  authCond: boolean = true;

  selectedFile!: File;
  imgName: string = '';
  img = document.querySelector('#profilPic') as HTMLImageElement;

  constructor(
    public _mainService: MainService,
    public activeRoute: ActivatedRoute,
    public _glopal: GlobalVarsService,
    private _auth: AuthService,
    public _router: Router,
    public _dialog: MatDialog,
    public _location: Location
  ) {
    this._glopal.loading = true;
  }

  ngOnInit(): void {
    this.user = new UserData();

    this.img = document.querySelector('#profilPic') as HTMLImageElement;

    setTimeout(() => this.onStart(), 0);

    this._router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        this._router.url.includes('UserSettings')
      ) {
        this.onStart();
      }
    });
  }

  onStart() {
    this.formValid = true;
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    this._glopal.loading = true;
    if (this.id) {
      this.user = new UserData();
      this.getUsers(this.id).then((data: any) => {
        this.submitBtn = { val: 'تعديل' };
        this.user = data[0];

        console.log(data[0])
        this.reAuth = null;
        this.user.auth = null;
        this._glopal.loading = false;
        this._glopal.currentHeader = `تعديل بيانات المستخدم | ${this.user.realName}`;
      });
    } else {
      this.user = new UserData();
      this._glopal.loading = false;
      this._glopal.currentHeader = 'اضافة بيانات مستخدم جديد';
    }
  }

  // genAuths() { this.user.del = false }

  getUsers(id?: string) {
    return new Promise((res) => {
      this._auth.getUsers(id).subscribe((data: UserData[]) => res(data));
    });
  }

  checkStatu() {
    this.user.dev = false;
    if (this.user.prem) {
      this.user.unites = false;
      this.user.workers = true;
      this.user.stockes = true;
      this.user.safes = true;
      this.user.edi = true;
      this.user.del = false;
      this.user.customers = true;
      this.user.clients = true;
    } else {
      this.user.unites = false;
      this.user.workers = false;
      this.user.stockes = false;
      this.user.safes = false;
      this.user.edi = false;
      this.user.del = false;
      this.user.customers = false;
      this.user.clients = false;
    }
    //this.user.del = false
  }

  openDialog = () => {
    let dialogRef = this._dialog.open(DoneDialogComponent, {
      data: {
        header: 'تم اضافة بيانات المستخدم',
        info: `الاسم | ${this.user.realName}`,
        discription: [`المستخدم | ${this.user.name}`],
        btns: {
          addNew: "اضافة بيانات جديدة",
          goHome: "الرئيسية"
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'addNew' && this.id) {
        this._router.navigate(['/UserSettings']);
      } else if (result == 'addNew') {
        this.onStart();
      } else if (result == 'back') {
        this._location.back();
      } else {
        this._router.navigate(['/Home']);
      }
    });
  };

  onFileSelect = (event: any) => {
    this.selectedFile = event.target.files[0];
    let ind = this.selectedFile.name.lastIndexOf(".");
    let ext = this.selectedFile.name.slice(ind);
    this.imgName = `${Date.now().toString()}${ext}`

    let reader = new FileReader();

    let imgToShow = event.target.files.item(0)

    reader.onload = (e: any) => {
      this.img.src = e.target.result;
    }
    reader.readAsDataURL(imgToShow)
  };

  uploadImg = () => {
    if (this.selectedFile) {
      const uploadData = new FormData();
      uploadData.append('myFile', this.selectedFile, this.imgName /* this.selectedFile.name */);
      this._mainService.uploadImg(uploadData, 'uploadBackUpImg').subscribe();
      this._mainService.uploadImg(uploadData, 'uploadImg').subscribe();
    };
  };

  onSubmit(addUserForm: NgForm) {
    if (addUserForm.valid && this.reAuth === this.user.auth) {
      if (this._auth.uName.i === this.user.id) {
        let prems = {
          clients: this.user.clients,
          customers: this.user.customers,
          del: this.user.del,
          edi: this.user.edi,
          prem: this.user.prem,
          safes: this.user.safes,
          stockes: this.user.stockes,
          unites: this.user.unites,
          workers: this.user.workers,
          userPic: this.user.userPic
        };
        sessionStorage.setItem('y', `${JSON.stringify(prems)}`);
        this._auth.check = sessionStorage.getItem('y');
        this._glopal.check = sessionStorage.getItem('y');
      }

      if (this.id) {
        this._auth.updateUser(this.user).subscribe(() => {
          this.openDialog();
        });
      } else {
        this._auth.creatUser(this.user).subscribe(
          () => {
            this.openDialog();
          },
          (error) => {
            if (error.status == '201') {
              this.openDialog();
            }
          }
        );
      }
    } else {
      if (this.reAuth !== this.user.auth) {
        this.authCond = true;
        addUserForm.form.controls['reAuth'].setErrors({ incorrect: true });
        addUserForm.form.controls['auth'].setErrors({ incorrect: true });
      }
      this.formValid = false;
    }
  }
}
