import { createClient } from '@supabase/supabase-js';
import { User, Service, Appointment, UserRole, TimeSlot } from '../types';

/* 
  --- INSTRUÇÕES SQL PARA O SUPABASE ---
  Execute este script no SQL Editor do seu projeto Supabase para criar as tabelas necessárias:

  create table services (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    price numeric not null,
    duration_minutes integer not null,
    image_url text
  );

  create table users (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    phone text unique not null,
    password text not null, 
    role text default 'client'
  );

  create table appointments (
    id uuid default gen_random_uuid() primary key,
    service_id uuid references services(id),
    user_id uuid references users(id),
    date text not null, -- formato YYYY-MM-DD
    time text not null, -- formato HH:mm
    status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now())
  );
*/

// Configuração do Cliente Supabase
// As variáveis de ambiente devem ser configuradas na Vercel com o prefixo VITE_
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || 'https://vkbqzsttibsebztksnki.supabase.co';
const SUPABASE_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_59_Ag8eGLmWsDiRXre5x0w_KsvCse7g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helpers de Mapeamento (Snake Case DB -> Camel Case App)
const mapService = (data: any): Service => ({
  id: data.id,
  title: data.title,
  description: data.description,
  price: Number(data.price),
  durationMinutes: data.duration_minutes,
  imageUrl: data.image_url
});

const mapUser = (data: any): User => ({
  id: data.id,
  name: data.name,
  phone: data.phone,
  role: data.role as UserRole,
  password: data.password // Em um app real, nunca retorne a senha
});

// API Implementation
export const api = {
  // --- Serviços ---
  getServices: async (): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('price', { ascending: true }); // Ordenar ou filtrar conforme necessidade
    
    if (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
    return data.map(mapService);
  },

  addService: async (service: Omit<Service, 'id'>): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        title: service.title,
        description: service.description,
        price: service.price,
        duration_minutes: service.durationMinutes,
        image_url: service.imageUrl
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapService(data);
  },

  updateService: async (id: string, service: Partial<Service>): Promise<void> => {
    const payload: any = {};
    if (service.title) payload.title = service.title;
    if (service.description) payload.description = service.description;
    if (service.price) payload.price = service.price;
    if (service.durationMinutes) payload.duration_minutes = service.durationMinutes;
    if (service.imageUrl) payload.image_url = service.imageUrl;

    const { error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error('Erro ao atualizar serviço: ' + error.message);
  },

  deleteService: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Erro ao excluir serviço: ' + error.message);
  },

  // --- Agendamentos ---
  getAppointments: async (): Promise<Appointment[]> => {
    // Busca agendamentos com dados relacionados (join)
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services (title),
        users (name, phone)
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }

    // Mapeamento manual do retorno do join
    return data.map((item: any) => ({
      id: item.id,
      serviceId: item.service_id,
      userId: item.user_id,
      date: item.date,
      time: item.time,
      status: item.status,
      serviceTitle: item.services?.title || 'Serviço Removido',
      userName: item.users?.name || 'Cliente Desconhecido',
      userPhone: item.users?.phone || ''
    }));
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> => {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        service_id: appointment.serviceId,
        user_id: appointment.userId,
        date: appointment.date,
        time: appointment.time,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw new Error('Erro ao criar agendamento: ' + error.message);
    
    // Retorno simples sem os joins (será recarregado na listagem se necessário)
    return {
      id: data.id,
      serviceId: data.service_id,
      userId: data.user_id,
      date: data.date,
      time: data.time,
      status: data.status
    };
  },

  updateAppointment: async (id: string, updates: Partial<Appointment>): Promise<void> => {
    const payload: any = {};
    // Mapeia os campos do app para o banco de dados se existirem no objeto updates
    if (updates.serviceId) payload.service_id = updates.serviceId;
    if (updates.date) payload.date = updates.date;
    if (updates.time) payload.time = updates.time;
    if (updates.status) payload.status = updates.status;

    const { error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error('Erro ao atualizar agendamento: ' + error.message);
  },

  getAvailableSlots: async (date: string): Promise<TimeSlot[]> => {
    // Busca horários já ocupados para a data
    const { data, error } = await supabase
      .from('appointments')
      .select('time')
      .eq('date', date)
      .neq('status', 'cancelled'); // Ignora cancelados

    if (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return [];
    }

    const bookedTimes = data.map((a: any) => a.time);
    
    // Definição dinâmica dos horários baseada no dia da semana
    // date vem no formato YYYY-MM-DD
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 6 = Sábado

    let allSlots: string[] = [];

    if (dayOfWeek === 6) { // Sábado: 10:00 às 15:00
      allSlots = ['10:00', '11:00', '12:00', '13:00', '14:00'];
    } else if (dayOfWeek === 0) { // Domingo: Fechado
      allSlots = [];
    } else { // Segunda a Sexta: 10:00 às 20:00
      allSlots = [
        '10:00', '11:00', '12:00', '13:00', '14:00', 
        '15:00', '16:00', '17:00', '18:00', '19:00'
      ];
    }

    // Regra: Mínimo 2 horas de antecedência
    const now = new Date();
    // Cria um objeto Date representando 2 horas no futuro
    const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return allSlots.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const slotDate = new Date(year, month - 1, day, hours, minutes);
      
      const isBooked = bookedTimes.includes(time);
      
      // Verifica se o slot é no passado ou muito próximo (menos de 2h), 
      // mas APENAS se o slotDate for hoje ou passado. 
      // Como year/month/day vêm da seleção, precisamos garantir que a comparação é válida.
      // O slotDate < minTime funciona bem: se for amanhã, será maior que agora+2h. Se for hoje, compara hora.
      const isTooSoon = slotDate < minTime;

      return {
        time,
        available: !isBooked && !isTooSoon
      };
    });
  },

  // --- Autenticação (Tabela Users Customizada & Supabase Auth) ---
  login: async (identifier: string, password: string): Promise<User | null> => {
    // 1. Tenta Login como Admin (se for email) usando Supabase Auth
    if (identifier.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password
      });

      if (error || !data.user) {
        // Se falhar no Auth oficial, cai no retorno null
        console.error('Falha login admin:', error?.message);
        return null;
      }

      // Retorna estrutura de User Admin
      return {
        id: data.user.id,
        name: 'Administradora',
        phone: '', // Admin não precisa de telefone no contexto atual
        role: UserRole.ADMIN
      };
    }

    // 2. Tenta Login como Cliente (tabela customizada)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', identifier)
      .eq('password', password) // Comparação simples de texto (demo)
      .single();

    if (error || !data) return null;
    return mapUser(data);
  },

  register: async (userData: Omit<User, 'id' | 'role'>): Promise<User> => {
    // Verifica se já existe na tabela customizada
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', userData.phone)
      .single();

    if (existing) throw new Error('Este telefone já está cadastrado.');

    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        role: 'client'
      })
      .select()
      .single();

    if (error) throw new Error('Erro ao cadastrar usuário: ' + error.message);
    return mapUser(data);
  }
};