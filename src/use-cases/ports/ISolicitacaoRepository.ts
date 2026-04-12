/**
 * Port de persistência/HTTP para os Use Cases de Solicitação de Serviço.
 * Implementado pelo framework (Redux/HTTP adapter) e mockado nos testes.
 */
export interface ISolicitacaoRepository {
  findBetweenDates(inicio: string, fim: string): Promise<any[]>;
  criar(rota: string, payload: any, anexo?: File): Promise<any>;
  aprovar(id: string | number, payload: any): Promise<any>;
  reprovar(id: string | number, payload: any): Promise<any>;
  alterarSetor(id: string | number, setorDestino: string): Promise<any>;
  verificarRecursos(): Promise<any[]>;
}
