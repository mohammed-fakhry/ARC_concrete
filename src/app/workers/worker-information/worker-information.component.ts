import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalVarsService } from 'src/app/services/global-vars.service';
import { MainService } from 'src/app/services/main.service';
import { WorkerService } from 'src/app/services/worker.service';
import { Worker } from '../../classes/worker';

@Component({
  selector: 'app-worker-information',
  templateUrl: './worker-information.component.html',
  styleUrls: ['./worker-information.component.scss'],
})
export class WorkerInformationComponent implements OnInit {
  worker: Worker = new Worker();
  id!: string | null;

  constructor(
    public _workerService: WorkerService,
    public _mainService: MainService,
    public activeRoute: ActivatedRoute,
    public _glopal: GlobalVarsService
  ) {
    this._glopal.currentHeader = 'معلومات شخصية لموظف';
  }

  ngOnInit(): void {
    this.id = this.activeRoute.snapshot.paramMap.get('id');
    this.worker = new Worker();

    this.getWorkerInfo();
  }

  getWorkersPromice() {
    return new Promise((res) => {
      if (this.id)
        this._workerService
          .getWorker(this.id)
          .subscribe((data: Worker[]) => res(data));
    });
  }

  getWorkerInfo() {
    this._glopal.loading = true;
    this.getWorkersPromice().then((data: any) => {
      this.worker = data[0];
      this._glopal.loading = false;
    });
  }
}
