import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from '../login.service';
import { CasePickerModalComponent } from '../case-picker-modal/case-picker-modal.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-serve',
  templateUrl: './serve.component.html',
  styleUrls: ['./serve.component.css']
})
export class ServeComponent implements OnInit, OnDestroy {

  constructor(private loginService: LoginService, public dialog: MatDialog) { }
  objectKeys = Object.keys;
  users;
  user;

  timer;
  cases = [];

  number = null;

  status = 'start';

  ngOnInit() {
    this.loginService.getUsers().subscribe(a => {
      this.users = a;
      const uid = JSON.parse(atob(localStorage.token.split('.')[1])).sub;
      this.user = a.filter(x => uid === x._id)[0];
      this.loginService.getCases(this.user.org).subscribe(x => {
        this.cases = x;
      });
    });

    this.timer = setInterval(_ => {
      // serve
      if (this.status === 'serving' && !this.number) {
        this.loginService.getNextNumber(this.user.org, this.cases.filter(x => x.selected).map(x => x.case)).subscribe(x => {
          if (x) {
            this.number = x;
          }
        });
      }
    }, 1000);
  }

  start() {
    const dialogRef = this.dialog.open(CasePickerModalComponent, {
      width: '80%',
      maxWidth: '500px',
      data: {cases: this.cases}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.some(x => x.selected)) {
        this.cases = result;
        this.status = 'serving';
      }
    });

  }

  pause() {
    this.status = 'pause';
    this.number = null;
  }

  next() {
    this.loginService.cancelNumber(this.number._id).subscribe(x => {
      this.number = null;
    });
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

}
