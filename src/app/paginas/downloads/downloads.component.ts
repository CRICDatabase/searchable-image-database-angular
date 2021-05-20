import { Component, OnInit, OnDestroy } from "@angular/core";

import { Subscription } from "rxjs";

import { saveAs } from "file-saver";

import { environment } from "src/environments/environment";

import { ImagemService } from "src/app/services/imagens.service";
import { IImagemModelResultado } from "src/app/models/imagem/imagem.model";
import { ArmazenamentoBrowser } from "src/app/utils/browser_storage/browser_storage";
import { ChavesArmazenamentoBrowser } from "src/app/utils/chaves_armazenamento_browser";
import { IObjetoSessaoModel } from "src/app/models/autenticacao/objeto_sessao.model";
import { ObjetoErro } from "src/app/utils/tratamento_erro/ObjetoErro";
import { HttpStatusCode } from "src/app/utils/tratamento_erro/Http_Status_Code";
import { ComunicacaoApi } from "src/app/api_cric_database/comunicacao_api";
import { Mensagens } from "src/app/utils/mensagens";

@Component({
    selector: "cr-downloads",
    templateUrl: "./downloads.component.html",
    styleUrls: ["./downloads.component.scss"]
})
export class DownloadsComponent implements OnInit, OnDestroy {

    public schema = {
        "@context": "http://schema.org",
        "@type": "WebPage",
        "name": "Download",
        "license": "https://creativecommons.org/licenses/by/4.0/"
    };

    public todasImagens: IImagemModelResultado[];
    public total_imagens: number;
    private comunicacaoApi: ComunicacaoApi;
    private listarImagensSubscription: Subscription;
    private armazenamentoBrowser: ArmazenamentoBrowser;
    public objetoSessao: IObjetoSessaoModel;
    private objetoErro: ObjetoErro;
    private export_collection_subscription: Subscription;
    public carregando: boolean;
    public collection2download: number;
    public download_images: boolean;
    public download_classifications: boolean;
    public download_segmentations: boolean;
    public playground: boolean;

    constructor(private imagemServico: ImagemService) {
        this.playground = environment.playground === "true";
        this.armazenamentoBrowser = new ArmazenamentoBrowser();
        this.comunicacaoApi = new ComunicacaoApi();
        this.objetoErro = new ObjetoErro();
        this.objetoSessao = JSON.parse(this.armazenamentoBrowser.obterDadoSessao(ChavesArmazenamentoBrowser.CHAVE_USUARIO_LOGADO));
        this.collection2download = 1; // Cervix collection
        this.carregando = false;
        this.download_images = true;
        this.download_classifications = true;
        this.download_segmentations = false; // Until release segmentation
        this.todasImagens = null;
        this.total_imagens = null;
    }

    ngOnInit() {
        this.listarImagens();
        //this.total_imagens = this.todasImagens.length; 
        //console.log(this.todasImagens);
        //console.log(this.total_imagens);
    }

    ngOnDestroy() {
        if (this.listarImagensSubscription) {
            this.listarImagensSubscription.unsubscribe();
        }

        if (this.export_collection_subscription) {
            this.export_collection_subscription.unsubscribe();
        }
    }

    listarImagens() {

        const user_id = 1;

        this.todasImagens = null;
        this.carregando = true;
        this.listarImagensSubscription =
        this.imagemServico.listarTodasImagens(user_id)
            .subscribe(
                (retorno) => {
                    this.todasImagens = this.construirUrlCaminhoImagem(retorno);
                    this.total_imagens = this.todasImagens.length; 
                    this.carregando = false;
                    
                    console.log(this.todasImagens);
                    console.log(this.total_imagens);
                },
                (erro) => {
                    this.carregando = false;
                    this.objetoErro = erro.error;

                    switch (this.objetoErro.status) {
                        case HttpStatusCode.UNAUTHORIZED: {
                            console.log(this.objetoErro.mensagem);
                            break;
                        }

                        case HttpStatusCode.NOT_FOUND: {
                            console.log(this.objetoErro.mensagem);
                            break;
                        }

                        case HttpStatusCode.INTERNAL_SERVER_ERROR: {
                            console.log(this.objetoErro.mensagem);
                            break;
                        }

                        default: {
                            console.log(erro);
                            break;
                        }
                    }
                }
            );
    }

    construirUrlCaminhoImagem(listaImagens: IImagemModelResultado[]) {

        listaImagens.forEach((imagem) => {
            const urlImg = `${this.comunicacaoApi.getThumbnailURL()}/${imagem.nome}`;
            imagem.caminho_imagem = urlImg;
        });

        return listaImagens;
    }

    solicitarDownloadImagens() {

        this.carregando = true;
        this.export_collection_subscription =
        this.imagemServico.export_collection(
            this.collection2download,
            this.download_images,
            this.download_classifications,
            this.download_segmentations
        )
            .subscribe(
                (retorno) => {
                    saveAs(retorno, "base.zip");
                    this.carregando = false;
                },
                (erro) => {

                    this.carregando = false;
                    /*O erro volta como blob, pois o tipo de responsetType é blob, acredito que deve-se converter o lob p json, para tratar o erro */

                    this.objetoErro = erro.error;

                    switch (this.objetoErro.status) {

                    case HttpStatusCode.UNAUTHORIZED: {
                        console.log(this.objetoErro.mensagem);
                        break;
                    }

                    case HttpStatusCode.BAD_REQUEST: {
                        console.log(this.objetoErro.mensagem);
                        break;
                    }

                    case HttpStatusCode.NOT_FOUND: {
                        console.log(this.objetoErro.mensagem);
                        break;
                    }

                    case HttpStatusCode.INTERNAL_SERVER_ERROR: {
                        console.log(this.objetoErro.mensagem);
                        break;
                    }

                    default: {
                        console.log(erro);
                        break;
                    }
                    }
                }
            );
    }
}

