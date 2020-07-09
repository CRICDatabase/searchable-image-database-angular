import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { NgxJsonLdModule } from "@ngx-lite/json-ld";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";

import { AboutComponent } from "./paginas/about/about.component";
import { ClassificarImagemComponent } from "./paginas/classificar-imagem/classificar-imagem.component";
import { ClassificationDatabaseComponent } from "./paginas/classification-database/classification-database.component";
import { DownloadsComponent } from "./paginas/downloads/downloads.component";
import { IndexComponent } from "./paginas/index/index.component";
import { PaginaDeErroComponent } from "./paginas/pagina_de_erro/pagina-de-erro.component";
import { PrivacyComponent } from "./paginas/privacy/privacy.component";
import { SegmentarImagemComponent } from "./paginas/segmentar-imagem/segmentar-imagem.component";
import { SegmentationDatabaseComponent } from "./paginas/segmentation-database/segmentation-database.component";
import { TermsComponent } from "./paginas/terms/terms.component";
import { UploadImageComponent } from "./paginas/upload-image/upload-image.component";
import { UsuarioComponent } from "./paginas/usuario/usuario.component";

import { AnimacaoCarregamentoComponent } from "./components/sistema/animacao-carregamento/animacao-carregamento.component";
import { CadastroVisitanteComponent } from "./components/usuario/cadastro-visitante/cadastro-visitante.component";
import { CiteUsComponent } from "./components/sistema/cite-us/cite-us.component";
import { FooterComponent } from "./components/footer/footer.component";
import { HeaderComponent } from "./components/header/header.component";
import { ImageInfoComponent } from "./components/imagem/image-info/image-info.component";
import { ListarCardsImagemComponent } from "./components/imagem/listar-cards-imagem/listar-cards-imagem.component";
import { LoginComponent } from "./components/login/login.component";

import { GuardaAutenticacao } from "./guardas/guarda-autenticacao";

import { ChartModule } from "angular-highcharts";

// Services
import { UsuarioService } from "src/app/services/usuarios/usuarios.service";
import { AutenticacaoService } from "./services/login/autenticacao.service";
import { SignUpService } from "./services/login/sign_up.service";
import { ImagemService } from "./services/imagens_service/imagens.service";
import { ConexaoService } from "./services/conexao/conexao.service";

@NgModule({
    declarations: [
        AppComponent,
        PrivacyComponent,
        TermsComponent,
        HeaderComponent,
        FooterComponent,
        AboutComponent,
        SegmentationDatabaseComponent,
        ClassificationDatabaseComponent,
        DownloadsComponent,
        IndexComponent,
        ListarCardsImagemComponent,
        PaginaDeErroComponent,
        SegmentarImagemComponent,
        ClassificarImagemComponent,
        UsuarioComponent,
        LoginComponent,
        CadastroVisitanteComponent,
        TesteComponent,
        AnimacaoCarregamentoComponent,
        CiteUsComponent,
        ImageInfoComponent,
        UploadImageComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        ChartModule,
        NgxJsonLdModule
    ],
    providers: [
        ImagemService,
        UsuarioService,
        AutenticacaoService,
        SignUpService,
        GuardaAutenticacao,
        ConexaoService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
