import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Instructions } from '../classes/instructions';
import { GlobalVarsService } from '../services/global-vars.service';
import { MainService } from '../services/main.service';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.scss'],
})
export class InstructionsComponent implements OnInit {
  searchFor: string | null = null;
  instructions: Instructions = new Instructions();

  constructor(
    public activeRoute: ActivatedRoute,
    public _router: Router,
    public _glopal: GlobalVarsService,
    public _mainService: MainService
  ) {
    this._glopal.loading = true;
    this._glopal.currentHeader = ''
  }

  ngOnInit(): void {
    this.onStart();

    let observUrlChange = this._router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        this._router.url.includes('instructions')
      ) {
        this.onStart();
      }

      if (
        val instanceof NavigationEnd &&
        !this._router.url.includes('instructions')
      ) {
        observUrlChange.unsubscribe();
      }
    });
  }

  onStart() {
    if (!this._glopal.loading) this._glopal.loading = true;
    this.searchFor = this.activeRoute.snapshot.paramMap.get('searchFor');
    if (this.searchFor) {
      // 'assets/jsons/egy.json'
      this.getLocalJson(`assets/jsons/instructions/${this.searchFor}.json`).then(
        (data: any) => {
          this.instructions = data;
          this._glopal.currentHeader = this.instructions.header
          this._glopal.loading = false;
        }
      );
    }
  }

  getLocalJson(local_url: string) {
    return new Promise((res) => {
      this._mainService.getLocalJson(local_url).subscribe((data: any[]) => {
        res(data);
      });
    });
  }
}
