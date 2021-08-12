import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { AddCustomerComponent } from './customers/add-customer/add-customer.component';
import { CustomerInformationComponent } from './customers/customer-information/customer-information.component';
import { CustomersListComponent } from './customers/customers-list/customers-list.component';
import { AddDiscoundDialogComponent } from './dialogs/add-discound-dialog/add-discound-dialog.component';
import { CheckAuthDialogComponent } from './dialogs/check-auth-dialog/check-auth-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete-dialog/delete-dialog.component';
import { DoneDialogComponent } from './dialogs/done-dialog/done-dialog.component';
import { DynamicInputDialogComponent } from './dialogs/dynamic-input-dialog/dynamic-input-dialog.component';
import { FilterByDateDialogComponent } from './dialogs/filter-by-date-dialog/filter-by-date-dialog.component';
import { SearchInvoiceDialogComponent } from './dialogs/search-invoice-dialog/search-invoice-dialog.component';
import { FixesComponent } from './fixes/fixes.component';
import { HomeComponent } from './home/home.component';
import { LogInComponent } from './log-in/log-in.component';
import { AddOtherAccComponent } from './otherAcc/add-other-acc/add-other-acc.component';
import { OtherAccInformationComponent } from './otherAcc/other-acc-information/other-acc-information.component';
import { ProductProfitsComponent } from './profits/product-profits/product-profits.component';
import { AddNewSafeComponent } from './safe/add-new-safe/add-new-safe.component';
import { AddSafeReceiptComponent } from './safe/add-safe-receipt/add-safe-receipt.component';
import { SafeInformationComponent } from './safe/safe-information/safe-information.component';
import { UserSettingsComponent } from './settings/user-settings/user-settings.component';
import { SafeComponent } from './safe/safe.component';
import { StocksComponent } from './stocks/stocks.component';
import { AddProductComponent } from './stocks/add-product/add-product.component';
import { InvoicesReportComponent } from './stocks/invoices-report/invoices-report.component';
import { ProductsComponent } from './stocks/products/products.component';
import { StockInformationComponent } from './stocks/stock-information/stock-information.component';
import { StockInvoiceComponent } from './stocks/stock-invoice/stock-invoice.component';
import { StockingComponent } from './stocks/stocking/stocking.component';
import { UnitesComponent } from './unites/unites.component';
import { WorkersComponent } from './workers/workers.component';
import { WorkerInformationComponent } from './workers/worker-information/worker-information.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AuthService } from './services/auth.service';
import { CustomersGuard } from './guards/customers.guard';
import { WorkerGuard } from './guards/worker.guard';
import { UnitesGuard } from './guards/unites.guard';
import { ClientsGuard } from './guards/clients.guard';
import { StocksGuard } from './guards/stocks.guard';
import { SafesGuard } from './guards/safes.guard';
import { DevelopmentGuard } from './guards/development.guard';
import { ClientsComponent } from './clients/clients.component';
import { AddClientComponent } from './clients/add-client/add-client.component';
import { ClientInformationComponent } from './clients/client-information/client-information.component';
import { OtherAccComponent } from './other-acc/other-acc.component';
import { InvoiceChangesReportComponent } from './reports/invoice-changes-report/invoice-changes-report.component';
import { StockingListComponent } from './stocks/stocking/stocking-list/stocking-list.component';
import { RouterModule } from '@angular/router';
import { DateInDaysPipe } from './pipes/date-in-days.pipe';
import { ReceiptChangesListComponent } from './reports/receipt-changes-list/receipt-changes-list.component';
import { CasherDialogComponent } from './dialogs/casher-dialog/casher-dialog.component';
import { CheckListComponent } from './check/check-list/check-list.component';
import { AddCheckComponent } from './check/add-check/add-check.component';
import { TryDevComponent } from './other/try-dev/try-dev.component';
import { AddTruckComponent } from './trucks/add-truck/add-truck.component';
import { TrucksListComponent } from './trucks/trucks-list/trucks-list.component';
import { AddtruckOrderComponent } from './trucks/addtruck-order/addtruck-order.component';
import { TruckOrdetListComponent } from './trucks/truck-ordet-list/truck-ordet-list.component';
import { TruckInformationComponent } from './trucks/truck-information/truck-information.component';
import { AddConcreteComponent } from './industry/concrete/add-concrete/add-concrete.component';
import { ConcreteListComponent } from './industry/concrete/concrete-list/concrete-list.component';
import { AddConcreteReceiptComponent } from './industry/receipt/add-concrete-receipt/add-concrete-receipt.component';
import { ConcreteReceiptListComponent } from './industry/receipt/concrete-receipt-list/concrete-receipt-list.component';
import { AddConcreteCustomerComponent } from './industry/concreteCustomers/add-concrete-customer/add-concrete-customer.component';
import { ConcreteCustomerListComponent } from './industry/concreteCustomers/concrete-customer-list/concrete-customer-list.component';
import { ConcreteCustomerInformationComponent } from './industry/concreteCustomers/concrete-customer-information/concrete-customer-information.component';
import { TruckCustomersListComponent } from './trucks/truckCustomers/truck-customers-list/truck-customers-list.component';
import { AddTruckCustomerComponent } from './trucks/truckCustomers/add-truck-customer/add-truck-customer.component';
import { TruckCustomerInformationComponent } from './trucks/truckCustomers/truck-customer-information/truck-customer-information.component';
import { TaxesListComponent } from './taxes/taxes-list/taxes-list.component';
import { AddConcreteBonComponent } from './industry/bon/add-concrete-bon/add-concrete-bon.component';
import { ConcreteBonListComponent } from './industry/bon/concrete-bon-list/concrete-bon-list.component';
import { AddWorkerComponent } from './workers/add-worker/add-worker.component';
import { ConcreteFinancialComponent } from './industry/concrete-financial/concrete-financial.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { AddTaxesListComponent } from './taxes/add-taxes-list/add-taxes-list.component';
import { ConcreteProfitsComponent } from './industry/concrete-profits/concrete-profits.component';

@NgModule({
  declarations: [
    AppComponent,
    AddCustomerComponent,
    CustomerInformationComponent,
    CustomersListComponent,
    AddDiscoundDialogComponent,
    CheckAuthDialogComponent,
    DeleteDialogComponent,
    DoneDialogComponent,
    DynamicInputDialogComponent,
    FilterByDateDialogComponent,
    SearchInvoiceDialogComponent,
    FixesComponent,
    HomeComponent,
    LogInComponent,
    AddOtherAccComponent,
    OtherAccInformationComponent,
    ProductProfitsComponent,
    AddNewSafeComponent,
    AddSafeReceiptComponent,
    SafeInformationComponent,
    UserSettingsComponent,
    SafeComponent,
    StocksComponent,
    AddProductComponent,
    InvoicesReportComponent,
    ProductsComponent,
    StockInformationComponent,
    StockInvoiceComponent,
    StockingComponent,
    UnitesComponent,
    WorkersComponent,
    WorkerInformationComponent,
    ClientsComponent,
    AddClientComponent,
    ClientInformationComponent,
    OtherAccComponent,
    InvoiceChangesReportComponent,
    StockingListComponent,
    DateInDaysPipe,
    ReceiptChangesListComponent,
    CasherDialogComponent,
    CheckListComponent,
    AddCheckComponent,
    TryDevComponent,
    AddTruckComponent,
    TrucksListComponent,
    AddtruckOrderComponent,
    TruckOrdetListComponent,
    TruckInformationComponent,
    AddConcreteComponent,
    ConcreteListComponent,
    AddConcreteReceiptComponent,
    ConcreteReceiptListComponent,
    AddConcreteCustomerComponent,
    ConcreteCustomerListComponent,
    ConcreteCustomerInformationComponent,
    TruckCustomersListComponent,
    AddTruckCustomerComponent,
    TruckCustomerInformationComponent,
    TaxesListComponent,
    AddConcreteBonComponent,
    ConcreteBonListComponent,
    AddWorkerComponent,
    ConcreteFinancialComponent,
    InstructionsComponent,
    AddTaxesListComponent,
    ConcreteProfitsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule
  ],
  entryComponents: [
    DoneDialogComponent,
    SearchInvoiceDialogComponent,
    DeleteDialogComponent,
    FilterByDateDialogComponent,
    AddDiscoundDialogComponent,
    DynamicInputDialogComponent,
    CasherDialogComponent
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    /* guards */
    AuthService,
    WorkerGuard,
    UnitesGuard,
    ClientsGuard,
    CustomersGuard,
    StocksGuard,
    SafesGuard,
    DevelopmentGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
