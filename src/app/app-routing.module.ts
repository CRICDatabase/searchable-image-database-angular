import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { GuardaAutenticacao } from "./guardas/guarda-autenticacao";

import { AboutComponent } from "./paginas/about/about.component";
import { SegmentationDatabaseComponent } from "./paginas/segmentation-database/segmentation-database.component";
import { ClassificationDatabaseComponent } from "./paginas/classification-database/classification-database.component";
import { DownloadsComponent } from "./paginas/downloads/downloads.component";
import { IndexComponent } from "./paginas/index/index.component";
import { PaginaDeErroComponent } from "./paginas/pagina_de_erro/pagina-de-erro.component";
import { SegmentarImagemComponent } from "./paginas/segmentar-imagem/segmentar-imagem.component";
import { ListarCardsImagemComponent } from "./components/imagem/listar-cards-imagem/listar-cards-imagem.component";
import { ClassificarImagemComponent } from "./paginas/classificar-imagem/classificar-imagem.component";
import { PrivacyComponent } from "./paginas/privacy/privacy.component";
import { TermsComponent } from "./paginas/terms/terms.component";
import { UploadImageComponent } from "./paginas/upload-image/upload-image.component";
import { TutorialComponent } from "./paginas/tutorial/tutorial.component";

import user_routes from "./user/routing";
import admin_routes from "./admin/routing";

const routes: Routes = [
    {path: "", component: IndexComponent},
    {path: "privacy", component: PrivacyComponent},
    {path: "terms", component: TermsComponent},
    {path: "about", component: AboutComponent},
    {path: "tutorial", component: TutorialComponent},
    {path: "segmentation", component: SegmentationDatabaseComponent},
    {path: "segmentation/image/:id", component: SegmentarImagemComponent},
    {path: "classification", component: ClassificationDatabaseComponent},
    {path: "classification/image/:id", component: ClassificarImagemComponent},
    {path: "downloads", component: DownloadsComponent},
    {path: "image", component: ListarCardsImagemComponent},
    {path: "image/upload", component: UploadImageComponent},
    {path: "erro", component: PaginaDeErroComponent},
    ...user_routes,
    ...admin_routes,
    {path: "**", component: PaginaDeErroComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {anchorScrolling:"enabled"})],
    exports: [RouterModule]
})

export class AppRoutingModule { }
