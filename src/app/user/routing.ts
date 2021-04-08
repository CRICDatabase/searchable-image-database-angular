import { Routes } from "@angular/router";

import { GuardaAutenticacao } from "../guardas/guarda-autenticacao";

import { UserHomeComponent } from './home/user-home.component';
import { UserClassificationDatabaseComponent } from './classfication-database/user-classification-database.component';
import { UserSegmentationDatabaseComponent } from './segmentation-database/user-segmentation-database.component';

const user_routes: Routes = [
    {path: "user", component: UserHomeComponent, canActivate: [GuardaAutenticacao]},
    {path: "user/classification", component: UserClassificationDatabaseComponent, canActivate: [GuardaAutenticacao]},
    {path: "user/segmentation", component: UserSegmentationDatabaseComponent, canActivate: [GuardaAutenticacao]},
];


export default user_routes;
