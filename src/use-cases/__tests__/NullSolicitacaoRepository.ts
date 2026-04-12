import { ISolicitacaoRepository } from '../ports/ISolicitacaoRepository';

/**
 * Null Object Pattern — implementação vazia do port para uso nos testes.
 * Pode ser estendida por mocks específicos sobrescrevendo os métodos.
 */
export class NullSolicitacaoRepository implements ISolicitacaoRepository {
  async findBetweenDates(_inicio: string, _fim: string): Promise<any[]> {
    return [];
  }
  async criar(_rota: string, _payload: any, _anexo?: File): Promise<any> {
    return {};
  }
  async aprovar(_id: string | number, _payload: any): Promise<any> {
    return {};
  }
  async reprovar(_id: string | number, _payload: any): Promise<any> {
    return {};
  }
  async alterarSetor(_id: string | number, _setorDestino: string): Promise<any> {
    return {};
  }
  async verificarRecursos(): Promise<any[]> {
    return [];
  }
}
