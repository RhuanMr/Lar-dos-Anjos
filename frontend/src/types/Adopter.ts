import { User } from './User';

export interface Adopter extends User {
  // Adotante é um User com role ADOTANTE
  // Não há campos adicionais específicos
}

export interface AdopterCreate {
  id_usuario: string;
}

