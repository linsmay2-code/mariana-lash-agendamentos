export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  password?: string; // Simplificado para demo
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  userId: string;
  date: string; // ISO String YYYY-MM-DD
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  userName?: string; // Para facilitar exibição
  userPhone?: string; // Para facilitar exibição
  serviceTitle?: string; // Para facilitar exibição
}

export interface TimeSlot {
  time: string;
  available: boolean;
}