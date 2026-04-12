import type { AnexoPersistido, AnexoLocal } from 'teraprox-core-sdk';

export interface ISolicitacaoFormViewModel {
  form: any;
  companyId: string | undefined;

  emergencial: string | null;
  setEmergencial(value: string | null): void;
  setores: any[];
  disabled: boolean;

  // Anexos (delegados ao useAnexoManager)
  anexos: {
    persistidos: AnexoPersistido[];
    locais: AnexoLocal[];
    addFiles: (files: File[]) => void;
    removeLocal: (localId: string) => void;
    removePersistido: (anexoId: string | number) => Promise<void>;
    getUrl: (anexoId: string | number) => Promise<string>;
  };

  setRecursos(list: any[]): void;
  setDataAbertura(iso: string): void;
  setDescricaoDoProblema(texto: string): void;
  setSetorDestino(nome: string): void;

  handleSave(): Promise<void>;
  handleCancel(): void;
  handleRemove(): void;
}
