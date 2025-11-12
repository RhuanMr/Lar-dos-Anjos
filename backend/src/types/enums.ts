// Enums para o sistema PawHub

export enum Role {
  SUPER_ADMIN = 'SuperAdmin',
  ADMINISTRADOR = 'Administrador',
  FUNCIONARIO = 'Funcionario',
  VOLUNTARIO = 'Voluntario',
  ADOTANTE = 'Adotante',
  DOADOR = 'Doador',
}

export enum Frequencia {
  MENSAL = 'mensal',
  PONTUAL = 'pontual',
  EVENTUAL = 'eventual',
}

export enum StatusAdocao {
  PENDENTE = 'Pendente',
  EM_ANALISE = 'Em Analise',
  APROVADA = 'Aprovada',
  REJEITADA = 'Rejeitada',
  CONCLUIDA = 'Concluida',
  CANCELADA = 'Cancelada',
}

export enum UF {
  AC = 'AC',
  AL = 'AL',
  AP = 'AP',
  AM = 'AM',
  BA = 'BA',
  CE = 'CE',
  DF = 'DF',
  ES = 'ES',
  GO = 'GO',
  MA = 'MA',
  MT = 'MT',
  MS = 'MS',
  MG = 'MG',
  PA = 'PA',
  PB = 'PB',
  PR = 'PR',
  PE = 'PE',
  PI = 'PI',
  RJ = 'RJ',
  RN = 'RN',
  RS = 'RS',
  RO = 'RO',
  RR = 'RR',
  SC = 'SC',
  SP = 'SP',
  SE = 'SE',
  TO = 'TO',
}

export enum TipoAnimal {
  CACHORRO = 'Cachorro',
  GATO = 'Gato',
  PASSARO = 'Passaro',
  ROEDOR = 'Roedor',
  REPTIL = 'Reptil',
  OUTRO = 'Outro',
}

export enum StatusAnimal {
  DISPONIVEL = 'Disponivel',
  ADOTADO = 'Adotado',
  FALECIDO = 'Falecido',
  RESGATADO = 'Resgatado',
  EM_TRATAMENTO = 'Em Tratamento',
}

export enum StatusAtualizacaoAdocao {
  PENDENTE = 'Pendente',
  OK = 'Ok',
  PROBLEMA = 'Problema',
}

export enum TipoAjuda {
  FINANCEIRA = 'Financeira',
  ITENS = 'Itens',
  OUTRO = 'Outro',
}

export enum TipoPagamento {
  PIX = 'Pix',
  DINHEIRO = 'Dinheiro',
  TRANSFERENCIA = 'Transferencia',
  OUTRO = 'Outro',
}

export enum Identificacao {
  MICROCHIP = 'microchip',
  COLETRA = 'coleira',
}

export enum Vacinado {
  SIM = 'Sim',
  NAO = 'Nao',
  PARCIAL = 'Parcial',
}

export enum StatusAdocaoEnum {
  OK = 'ok',
  PENDENTE = 'pendente',
  VISITA_AGENDADA = 'visita_agendada',
  SEM_RESPOSTA = 'sem_resposta',
}
