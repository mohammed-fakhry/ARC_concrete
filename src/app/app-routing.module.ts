import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuard } from './guards/auth.guard';
import { ClientsGuard } from './guards/clients.guard';
import { UnitesGuard } from './guards/unites.guard';
import { WorkerGuard } from './guards/worker.guard';

import { HomeComponent } from './home/home.component';
import { LogInComponent } from './log-in/log-in.component';
import { UnitesComponent } from './unites/unites.component';
import { WorkerInformationComponent } from './workers/worker-information/worker-information.component';
import { WorkersComponent } from './workers/workers.component';
import { ClientInformationComponent } from './clients/client-information/client-information.component';
import { AddClientComponent } from './clients/add-client/add-client.component';
import { CustomersListComponent } from './customers/customers-list/customers-list.component';
import { CustomersGuard } from './guards/customers.guard';
import { AddCustomerComponent } from './customers/add-customer/add-customer.component';
import { CustomerInformationComponent } from './customers/customer-information/customer-information.component';
import { OtherAccInformationComponent } from './otherAcc/other-acc-information/other-acc-information.component';
import { OtherAccComponent } from './other-acc/other-acc.component';
import { AddOtherAccComponent } from './otherAcc/add-other-acc/add-other-acc.component';
import { StocksComponent } from './stocks/stocks.component';
import { StockingComponent } from './stocks/stocking/stocking.component';
import { StocksGuard } from './guards/stocks.guard';
import { StockInformationComponent } from './stocks/stock-information/stock-information.component';
import { StockInvoiceComponent } from './stocks/stock-invoice/stock-invoice.component';
import { InvoicesReportComponent } from './stocks/invoices-report/invoices-report.component';
import { AddProductComponent } from './stocks/add-product/add-product.component';
import { ProductProfitsComponent } from './profits/product-profits/product-profits.component';
import { MasterGuard } from './guards/master.guard';
import { SafeComponent } from './safe/safe.component';
import { SafesGuard } from './guards/safes.guard';
import { AddNewSafeComponent } from './safe/add-new-safe/add-new-safe.component';
import { AddSafeReceiptComponent } from './safe/add-safe-receipt/add-safe-receipt.component';
import { SafeInformationComponent } from './safe/safe-information/safe-information.component';
import { UserSettingsComponent } from './settings/user-settings/user-settings.component';
import { FixesComponent } from './fixes/fixes.component';
import { DevelopmentGuard } from './guards/development.guard';
import { InvoiceChangesReportComponent } from './reports/invoice-changes-report/invoice-changes-report.component';
import { StockingListComponent } from './stocks/stocking/stocking-list/stocking-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReceiptChangesListComponent } from './reports/receipt-changes-list/receipt-changes-list.component';
import { CheckListComponent } from './check/check-list/check-list.component';
import { AddCheckComponent } from './check/add-check/add-check.component';
import { TryDevComponent } from './other/try-dev/try-dev.component';
import { AddTruckComponent } from './trucks/add-truck/add-truck.component';
import { TrucksListComponent } from './trucks/trucks-list/trucks-list.component';
import { AddtruckOrderComponent } from './trucks/addtruck-order/addtruck-order.component';
import { TruckOrdetListComponent } from './trucks/truck-ordet-list/truck-ordet-list.component';
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
import { OwnerGuard } from './guards/owner.guard';
import { AddConcreteBonComponent } from './industry/bon/add-concrete-bon/add-concrete-bon.component';
import { ConcreteBonListComponent } from './industry/bon/concrete-bon-list/concrete-bon-list.component';
import { TruckInformationComponent } from './trucks/truck-information/truck-information.component';

const routes: Routes = [
  // defult path
  { path: '', redirectTo: 'LogIn', pathMatch: 'full' },
  { path: 'LogIn', component: LogInComponent },

  // home
  { path: 'Home', component: HomeComponent, canActivate: [AuthGuard], },

  // workers
  { path: 'Workers', component: WorkersComponent, canActivate: [WorkerGuard], },
  { path: 'WorkerInformation/:id', component: WorkerInformationComponent, canActivate: [WorkerGuard], },

  // unites
  { path: 'Unites', component: UnitesComponent, canActivate: [UnitesGuard] },

  // clients
  { path: 'Clients', component: LogInComponent, canActivate: [ClientsGuard] },
  { path: 'ClientInformation/:id', component: ClientInformationComponent, canActivate: [ClientsGuard] },
  { path: 'AddClient', component: AddClientComponent, canActivate: [ClientsGuard] },
  { path: 'AddClient/:id', component: AddClientComponent, canActivate: [ClientsGuard] },

  // customers
  { path: 'CustomerList', component: CustomersListComponent, canActivate: [CustomersGuard] },
  { path: 'CustomerList/:searchFor', component: CustomersListComponent, canActivate: [CustomersGuard] },
  { path: 'addCustomer', component: AddCustomerComponent, canActivate: [CustomersGuard] },
  { path: 'addCustomer/:id', component: AddCustomerComponent, canActivate: [CustomersGuard] },
  { path: 'customerInformation/:id', component: CustomerInformationComponent, canActivate: [CustomersGuard] },

  // acc !! with customer guard AddOtherAcc
  { path: 'otherAcc', component: OtherAccComponent, canActivate: [CustomersGuard] },
  { path: 'OtherAccInformation/:id', component: OtherAccInformationComponent, canActivate: [CustomersGuard] },
  { path: 'AddOtherAcc', component: AddOtherAccComponent, canActivate: [CustomersGuard] },
  { path: 'AddOtherAcc/:id', component: AddOtherAccComponent, canActivate: [CustomersGuard] },

  // check
  { path: 'checkList', component: CheckListComponent, canActivate: [CustomersGuard] },
  { path: 'addCheck', component: AddCheckComponent, canActivate: [CustomersGuard] },
  { path: 'editCheck/:id', component: AddCheckComponent, canActivate: [CustomersGuard] },

  // stockes
  { path: 'Stokes', component: StocksComponent, canActivate: [StocksGuard] },
  { path: 'Stocking', component: StockingComponent, canActivate: [StocksGuard] },
  { path: 'Stocking/:id', component: StockingComponent, canActivate: [StocksGuard] },
  { path: 'StockingList', component: StockingListComponent, canActivate: [StocksGuard] },
  { path: 'StockInformation/:id', component: StockInformationComponent, canActivate: [StocksGuard] },
  { path: 'StockInvoice', component: StockInvoiceComponent, canActivate: [StocksGuard] },
  { path: 'StockInvoice/:id', component: StockInvoiceComponent, canActivate: [StocksGuard] },
  { path: 'CaherReceipt', component: StockInvoiceComponent, canActivate: [StocksGuard] },
  { path: 'invoiceReport/:searchFor/:invDirection/:id', component: InvoicesReportComponent, canActivate: [AuthGuard] },
  { path: 'AddProduct', component: AddProductComponent, canActivate: [StocksGuard] },
  { path: 'AddProduct/:id', component: AddProductComponent, canActivate: [StocksGuard] },
  { path: 'ProductsProfits/:id', component: ProductProfitsComponent, canActivate: [OwnerGuard] },

  // trucks
  { path: 'AddTruck', component: AddTruckComponent, canActivate: [MasterGuard] },
  { path: 'UpdateTruck/:id', component: AddTruckComponent, canActivate: [MasterGuard] },
  { path: 'TrucksList', component: TrucksListComponent, canActivate: [MasterGuard] },
  { path: 'TrucksList/:searchFor', component: TrucksListComponent, canActivate: [MasterGuard] },
  { path: 'AddTruckorder', component: AddtruckOrderComponent, canActivate: [MasterGuard] },
  { path: 'UpdateTruckorder/:id', component: AddtruckOrderComponent, canActivate: [MasterGuard] },
  { path: 'trucksOrderLog', component: TruckOrdetListComponent, canActivate: [MasterGuard] },
  { path: 'truckLog/:id', component: TruckOrdetListComponent, canActivate: [MasterGuard] },
  { path: 'ourTrucks', component: TruckInformationComponent, canActivate: [OwnerGuard] },

  // truckCustomers
  { path: 'TruckCustomerList', component: TruckCustomersListComponent, canActivate: [MasterGuard] },
  { path: 'AddTruckCustomer', component: AddTruckCustomerComponent, canActivate: [MasterGuard] },
  { path: 'UpdateTruckCustomer/:id', component: AddTruckCustomerComponent, canActivate: [MasterGuard] },
  { path: 'TruckCustomerInformation/:id', component: TruckCustomerInformationComponent, canActivate: [MasterGuard] },

  // /* industry */
  // concrete
  { path: 'AddConcrete', component: AddConcreteComponent, canActivate: [MasterGuard] },
  { path: 'UpdateConcrete/:id', component: AddConcreteComponent, canActivate: [MasterGuard] },
  { path: 'ConcreteList', component: ConcreteListComponent, canActivate: [MasterGuard] },
  // ConcreteReceipt
  { path: 'ConcreteReceipt', component: AddConcreteReceiptComponent, canActivate: [MasterGuard] },
  { path: 'UpdateConcreteReceipt/:id', component: AddConcreteReceiptComponent, canActivate: [MasterGuard] },
  { path: 'AddConcreteBYBon/:date/:customerId/:customerProject', component: AddConcreteReceiptComponent, canActivate: [MasterGuard] },
  { path: 'concreteReceiptList', component: ConcreteReceiptListComponent, canActivate: [MasterGuard] },
  // ConcreteBone
  { path: 'AddConcreteBon', component: AddConcreteBonComponent, canActivate: [MasterGuard] },
  { path: 'UpdateConcreteBon/:id', component: AddConcreteBonComponent, canActivate: [MasterGuard] },
  { path: 'ConcreteBonList', component: ConcreteBonListComponent, canActivate: [MasterGuard] },
  // concreteCustomer
  { path: 'AddConcreteCustomer', component: AddConcreteCustomerComponent, canActivate: [MasterGuard] },
  { path: 'UpdateConcreteCustomer/:id', component: AddConcreteCustomerComponent, canActivate: [MasterGuard] },
  { path: 'ConcreteCustomerList', component: ConcreteCustomerListComponent, canActivate: [MasterGuard] },
  { path: 'ConcreteCustomerInformation/:id', component: ConcreteCustomerInformationComponent, canActivate: [MasterGuard] },

  // safe
  { path: 'Safe', component: SafeComponent, canActivate: [SafesGuard] },
  { path: 'AddSafe', component: AddNewSafeComponent, canActivate: [SafesGuard] },
  { path: 'AddSafe/:id', component: AddNewSafeComponent, canActivate: [SafesGuard] },
  { path: 'SafeReceipt', component: AddSafeReceiptComponent, canActivate: [SafesGuard] },
  { path: 'SafeReceipt/:id', component: AddSafeReceiptComponent, canActivate: [SafesGuard] },
  { path: 'SafeInformation/:id', component: SafeInformationComponent, canActivate: [SafesGuard] },

  // main settings
  { path: 'UserSettings', component: UserSettingsComponent, canActivate: [OwnerGuard] },
  { path: 'UserSettings/:id', component: UserSettingsComponent, canActivate: [OwnerGuard] },

  // reports
  { path: 'InvoiceChangesReport', component: InvoiceChangesReportComponent, canActivate: [MasterGuard] },
  { path: 'InvoiceChangesReport/:searchFor', component: InvoiceChangesReportComponent, canActivate: [MasterGuard] },
  { path: 'ReceiptsChangesReport', component: ReceiptChangesListComponent, canActivate: [MasterGuard] },
  { path: 'ReceiptsChangesReport/:searchFor', component: ReceiptChangesListComponent, canActivate: [MasterGuard] },

  // fixes, canActivate: [DevelopmentGuard]
  { path: 'FixesComponent', component: FixesComponent, canActivate: [DevelopmentGuard] },
  { path: 'tryDev', component: TryDevComponent }
];

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
