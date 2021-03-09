import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

import { ComunicacaoApi } from "src/app/api_cric_database/comunicacao_api";
import { IImagemModelResultado } from "src/app/models/imagem/imagem.model";
import { ArmazenamentoBrowser } from "src/app/utils/browser_storage/browser_storage";
import { ChavesArmazenamentoBrowser } from "src/app/utils/chaves_armazenamento_browser";
import { ILesaoModelResultado } from "src/app/models/imagem/lesao.model";
import { IDescricaoModelResultado } from "src/app/models/imagem/descricao.model";
import { ICelulaClassificadaModelResultado } from "src/app/models/classificacao/celula_classificada.model";
import { IClassificacaoCelulaModelResultado } from "src/app/models/classificacao/classificacao_celula.model";
import { ISegmentacaoCelulaModelResultado } from "src/app/models/segmentacao/segmentacao_celula.model";
import { IObjetoSessaoModel } from "src/app/models/autenticacao/objeto_sessao.model";
import { IEstatisticaCelulasDoentesModelResultado } from "src/app/models/imagem/estatistica_celulas_doentes.model";

@Injectable()
export class ImagemService {

    private armazenamentoBrowser: ArmazenamentoBrowser;
    private objetoSessao: IObjetoSessaoModel;
    private headerApplicationJson: HttpHeaders;
    private headerMultipartFormData: HttpHeaders;
    private headerDownloadArquivo: HttpHeaders;
    private api: ComunicacaoApi;

    constructor(private httpClient: HttpClient) { }

    inicializarServicos() {

        this.armazenamentoBrowser = new ArmazenamentoBrowser();
        this.objetoSessao = JSON.parse(this.armazenamentoBrowser.obterDadoSessao(ChavesArmazenamentoBrowser.CHAVE_USUARIO_LOGADO));
        this.api = new ComunicacaoApi();

        if (this.objetoSessao) {
            this.headerApplicationJson = new HttpHeaders({
                "content-type": "application/json; charset=utf-8",
                Authorization: this.objetoSessao.Authorization
            });

            this.headerMultipartFormData = new HttpHeaders({
                Authorization: this.objetoSessao.Authorization
            });

            this.headerDownloadArquivo = new HttpHeaders({
                Authorization: this.objetoSessao.Authorization,
                responseType: "blob"
            });
        }
        else {
            this.headerApplicationJson = new HttpHeaders({
                "content-type": "application/json; charset=utf-8"
            });

            this.headerMultipartFormData = new HttpHeaders({
            });

            this.headerDownloadArquivo = new HttpHeaders({
                responseType: "blob"
            });
        }
    }

    cadastrarImagem(formulario: FormData): Observable<any> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens`;

        return this.httpClient.post<any>(url, formulario, {
            headers: this.headerMultipartFormData
        });
    }

    obterContagemNucleosDoentes(): Observable<IEstatisticaCelulasDoentesModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/contagem/lesoes/descricoes`;

        return this.httpClient.get<IEstatisticaCelulasDoentesModelResultado>(url, {
            headers: this.headerApplicationJson
        });
    }

    listarTodasImagens(id_usuario: number): Observable<IImagemModelResultado[]> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens`;

        return this.httpClient.get<IImagemModelResultado[]>(url, {
            headers: this.headerApplicationJson,
            params: {
                id_usuario: id_usuario.toString()
            }
        });
    }

    obterImagem(id_imagem: number): Observable<IImagemModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}`;

        return this.httpClient.get<IImagemModelResultado>(url, {
            headers: this.headerApplicationJson
        });
    }

    listarDescricoes(): Observable<IDescricaoModelResultado[]> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens-descricoes`;

        return this.httpClient.get<IDescricaoModelResultado[]>(url, {
            headers: this.headerApplicationJson
        });
    }

    listarClassificacoesCelula(id_imagem: number, id_analista: number): Observable<ICelulaClassificadaModelResultado[]> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}/listar-classificacao-celula/${id_analista}`;

        return this.httpClient.get<ICelulaClassificadaModelResultado[]>(url, {
            headers: this.headerApplicationJson
        });
    }

    listarSegmentacoesCelula(id_imagem: number, id_analista: number): Observable<ISegmentacaoCelulaModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}/listar-segmentacao-celula/${id_analista}`;

        return this.httpClient.get<ISegmentacaoCelulaModelResultado>(url, {
            headers: this.headerApplicationJson
        });
    }

    cadastrarClassificacao(id_imagem: number, id_analista: number, body: any): Observable<IImagemModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}/classificacao-celula/${id_analista}`;

        return this.httpClient.post<IImagemModelResultado>(url, body, {
            headers: this.headerApplicationJson
        });
    }

    cadastrarSegmentacao(id_imagem: number, id_analista: number, body: any): Observable<any> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}/segmentacao-celula/${id_analista}`;

        return this.httpClient.post(url, body, {
            headers: this.headerApplicationJson
        });
    }

    export_collection(
        collection2download: number,
        download_images: boolean,
        download_classifications: boolean,
        download_segmentations: boolean
    ): Observable<any> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/export`;

        return this.httpClient.get(url, {
            headers: this.headerDownloadArquivo,
            params: new HttpParams()
                .set('collection', collection2download.toString())
                .set('images', Number(download_images).toString())
                .set('classifications', Number(download_classifications).toString())
                .set('segmentations', Number(download_segmentations).toString()),
            responseType: "blob"
        });
    }

    excluirRegistroDeClassificacao(requisicao: any): Observable<IImagemModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${requisicao.id_imagem}/classificacao-celula/${requisicao.id_celula}`;

        return this.httpClient.delete<IImagemModelResultado>(url, {
            headers: this.headerApplicationJson
        });
    }

    excluirRegistroDeSegmentacao(requisicao: any): Observable<ISegmentacaoCelulaModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${requisicao.id_imagem}/segmentacao-celula/${requisicao.id_celula}`;

        return this.httpClient.delete<ISegmentacaoCelulaModelResultado>(url, {
            headers: this.headerApplicationJson
        });
    }

    delete_image(id_imagem: number): Observable<IImagemModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}`;

        return this.httpClient.delete<IImagemModelResultado>(url, {
            headers: this.headerApplicationJson
        });
    }

    approve_image(id_imagem: number): Observable<IImagemModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}/aprovada`;

        return this.httpClient.post<IImagemModelResultado>(url, {
            headers: this.headerApplicationJson
        });
    }

    unapprove_image(id_imagem: number): Observable<IImagemModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}/aprovada`;

        return this.httpClient.delete<IImagemModelResultado>(url, {
            headers: this.headerApplicationJson
        });
    }

    atualizarImagem(id_imagem: number, id_usuario: number, body: any): Observable<IImagemModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}`;

        return this.httpClient.put<IImagemModelResultado>(url, body, {
            headers: this.headerApplicationJson
        });
    }

    atualizarClassificacao(id_imagem: number, id_classificacao: number, body: any): Observable<IImagemModelResultado> {

        this.inicializarServicos();
        const url = `${this.api.obterUrlBaseApi()}/api/v1/imagens/${id_imagem}/classificacao-celula/${id_classificacao}`;
        return this.httpClient.put<IImagemModelResultado>(url, body, {
            headers: this.headerApplicationJson
        });
    }
}
