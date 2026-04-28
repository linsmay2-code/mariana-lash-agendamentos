import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { api } from './services/api';
import { Service, User, Appointment, UserRole, TimeSlot } from './types';
import { 
  Calendar, Clock, ChevronRight, CheckCircle2, 
  Plus, Trash2, Scissors, User as UserIcon, Loader2, X, AlertCircle, Pencil
} from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Sub-components (Inline for single file constraints compliance where possible) ---

// Componente: Card de Serviço
const ServiceCard: React.FC<{ service: Service; selected: boolean; onClick: () => void }> = ({ service, selected, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      cursor-pointer group relative overflow-hidden rounded-2xl border-2 transition-all duration-300
      ${selected 
        ? 'border-brand-500 shadow-xl bg-white scale-[1.02]' 
        : 'border-transparent bg-white shadow-md hover:shadow-xl hover:-translate-y-1'
      }
    `}
  >
    <div className="aspect-w-16 aspect-h-9 h-48 w-full overflow-hidden">
      <img 
        src={service.imageUrl} 
        alt={service.title} 
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      {selected && (
        <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
          <div className="bg-white rounded-full p-2 text-brand-600 shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>
      )}
    </div>
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-serif text-xl font-bold text-gray-900 leading-tight">{service.title}</h3>
        <span className="font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full text-sm whitespace-nowrap">
          R$ {service.price.toFixed(2)}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
      <div className="flex items-center text-gray-400 text-xs font-medium uppercase tracking-wide">
        <Clock className="w-3 h-3 mr-1" />
        {service.durationMinutes} minutos
      </div>
    </div>
  </div>
);

// Componente: Modal de Login/Cadastro
const AuthModal = ({ isOpen, onClose, onLogin, onRegister }: any) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!formData.name || !formData.phone || !formData.password) {
          throw new Error('Preencha todos os campos');
        }
        await onRegister(formData);
      } else {
        if (!formData.phone || !formData.password) {
          throw new Error('Preencha login e senha');
        }
        await onLogin(formData.phone, formData.password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 overflow-hidden">
        <h2 className="font-serif text-2xl font-bold mb-6 text-center text-brand-dark">
          {isRegistering ? 'Criar Conta' : 'Bem-vindo de volta'}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                placeholder="Seu nome"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isRegistering ? 'WhatsApp / Telefone' : 'WhatsApp ou E-mail (Admin)'}
            </label>
            <input 
              type={isRegistering ? "tel" : "text"} 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              placeholder={isRegistering ? "(00) 00000-0000" : "Seu telefone ou e-mail de acesso"}
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              placeholder="******"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg shadow-lg shadow-brand-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isRegistering ? 'Cadastrar e Continuar' : 'Entrar')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-brand-600 font-medium hover:underline"
          >
            {isRegistering ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente: Modal de Edição de Agendamento
const EditAppointmentModal = ({ isOpen, onClose, appointment, services, onSave, onCancelAppointment }: any) => {
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: ''
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inicializa dados quando abre
  useEffect(() => {
    if (appointment) {
      setFormData({
        serviceId: appointment.serviceId,
        date: appointment.date,
        time: appointment.time
      });
    }
  }, [appointment]);

  // Busca slots quando a data muda
  useEffect(() => {
    if (formData.date) {
      setLoadingSlots(true);
      api.getAvailableSlots(formData.date)
        .then(slots => {
           setAvailableSlots(slots);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [formData.date]);

  if (!isOpen || !appointment) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(appointment.id, formData);
      onClose();
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      setSaving(true);
      try {
        await onCancelAppointment(appointment.id);
        onClose();
      } catch (error) {
        alert('Erro ao cancelar');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-serif text-xl font-bold text-gray-800">Gerenciar Agendamento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Info Cliente */}
          <div className="bg-brand-50 p-4 rounded-lg flex items-start gap-3">
            <UserIcon className="w-5 h-5 text-brand-600 mt-1" />
            <div>
              <p className="font-bold text-brand-900">{appointment.userName}</p>
              <p className="text-sm text-brand-700">{appointment.userPhone}</p>
            </div>
          </div>

          {/* Seleção de Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Procedimento</label>
            <select
              value={formData.serviceId}
              onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none"
            >
              {services.map((s: Service) => (
                <option key={s.id} value={s.id}>{s.title} - R$ {s.price}</option>
              ))}
            </select>
          </div>

          {/* Seleção de Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={formData.date}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setFormData({...formData, date: e.target.value, time: ''})} // Limpa hora ao mudar data
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-200 outline-none"
            />
          </div>

          {/* Seleção de Horário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
            {loadingSlots ? (
               <div className="flex items-center text-sm text-gray-500"><Loader2 className="animate-spin w-4 h-4 mr-2"/> Buscando horários...</div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map(slot => {
                  // Se o slot é o do próprio agendamento atual, permitimos selecionar mesmo que "available" seja false (pq ele que está ocupando)
                  const isCurrentAppointmentTime = appointment && appointment.date === formData.date && appointment.time === slot.time;
                  const isSelectable = slot.available || isCurrentAppointmentTime;

                  return (
                    <button
                      key={slot.time}
                      disabled={!isSelectable}
                      onClick={() => setFormData({...formData, time: slot.time})}
                      className={`text-sm py-2 px-1 rounded border transition-colors 
                        ${formData.time === slot.time 
                          ? 'bg-brand-600 text-white border-brand-600' 
                          : isSelectable
                            ? 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                        }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
                {availableSlots.length === 0 && <p className="col-span-4 text-sm text-red-500">Sem horários para esta data.</p>}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between">
          <button 
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Cancelar
          </button>
          
          <div className="flex gap-3">
             <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">Fechar</button>
             <button 
               onClick={handleSave}
               disabled={saving || !formData.time}
               className="bg-brand-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center"
             >
               {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : null}
               Salvar Alterações
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente: Modal de Edição de Serviço
const EditServiceModal = ({ isOpen, service, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    image: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description,
        price: service.price.toString(),
        duration: service.durationMinutes.toString(),
        image: service.imageUrl
      });
    }
  }, [service]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(service.id, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        durationMinutes: parseInt(formData.duration),
        imageUrl: formData.image
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar serviço.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-serif text-xl font-bold text-gray-800">Editar Serviço</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 outline-none text-sm"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 outline-none text-sm"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                required
                type="number"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 outline-none text-sm"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
              <input
                required
                type="number"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 outline-none text-sm"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="h-20 w-auto mx-auto mb-2 rounded" />
              )}
              <div className="text-gray-500 text-xs">
                {formData.image ? 'Clique para alterar' : 'Clique para enviar foto'}
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
             <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancelar</button>
             <button 
               type="submit"
               disabled={saving}
               className="bg-brand-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center"
             >
               {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : null}
               Salvar
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // State: Core
  const [view, setView] = useState<'home' | 'booking' | 'admin'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // State: Data
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // State: Booking Flow
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // State: Admin
  const [adminTab, setAdminTab] = useState<'appointments' | 'services'>('appointments');
  const [newService, setNewService] = useState({ title: '', description: '', price: '', duration: '', image: '' });
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Effects
  useEffect(() => {
    loadServices();
    // Check session
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') loadAdminData();
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      api.getAvailableSlots(format(selectedDate, 'yyyy-MM-dd'))
        .then(setAvailableSlots)
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate]);

  // Actions
  const loadServices = async () => {
    const data = await api.getServices();
    setServices(data);
  };

  const loadAdminData = async () => {
    setLoadingData(true);
    const appts = await api.getAppointments();
    setAppointments(appts);
    setLoadingData(false);
  };

  // Função centralizada de submissão do agendamento
  const handleBookingSubmit = async (timeOverride?: string, userOverride?: User) => {
    const finalTime = timeOverride || selectedTime;
    const currentUser = userOverride || user; // Permite usar o usuário recém-logado mesmo que o state ainda não tenha atualizado

    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    if (!selectedService || !selectedDate || !finalTime) return;

    setIsBookingLoading(true);
    try {
      await api.createAppointment({
        serviceId: selectedService.id,
        userId: currentUser.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: finalTime,
      });

      setBookingStep(4); // Success screen
    } catch (error) {
      console.error(error);
      alert("Erro ao realizar agendamento. Tente novamente.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleLogin = async (p: string, pw: string) => {
    const u = await api.login(p, pw);
    if (!u) throw new Error('Credenciais inválidas');
    
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));

    // Se estivermos na etapa final de agendamento (escolha de horário), confirma automaticamente
    if (view === 'booking' && bookingStep === 3 && selectedTime) {
      await handleBookingSubmit(selectedTime, u);
    }
  };

  const handleRegister = async (data: any) => {
    const u = await api.register(data);
    
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));

    // Se estivermos na etapa final de agendamento (escolha de horário), confirma automaticamente
    if (view === 'booking' && bookingStep === 3 && selectedTime) {
      await handleBookingSubmit(selectedTime, u);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setView('home');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addService({
      title: newService.title,
      description: newService.description,
      price: parseFloat(newService.price),
      durationMinutes: parseInt(newService.duration),
      imageUrl: newService.image || 'https://picsum.photos/400/300' // Fallback
    });
    setNewService({ title: '', description: '', price: '', duration: '', image: '' });
    loadServices();
  };

  const handleUpdateAppointment = async (id: string, updates: any) => {
    await api.updateAppointment(id, updates);
    await loadAdminData(); // Reload list
  };

  const handleCancelAppointment = async (id: string) => {
    await api.updateAppointment(id, { status: 'cancelled' });
    await loadAdminData(); // Reload list
  };

  const handleUpdateService = async (id: string, updates: any) => {
    await api.updateService(id, updates);
    await loadServices();
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço? Essa ação não pode ser desfeita.')) {
      try {
        await api.deleteService(id);
        await loadServices();
      } catch (error: any) {
        alert('Erro ao excluir: verifique se não há agendamentos vinculados a este serviço.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewService({ ...newService, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Views Renders ---

  const renderHome = () => (
    <div className="relative isolate">
      {/* Hero Section */}
      <div className="relative pt-14 lg:pt-20 pb-20 sm:pb-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Realce sua beleza,<br />
            <span className="text-brand-600 italic">revele seu olhar.</span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto mb-10">
            Especialistas em extensão de cílios e estética facial. 
            Agende seu procedimento exclusivo e desfrute de uma experiência transformadora.
          </p>
          <button
            onClick={() => {
              setView('booking');
              setBookingStep(1);
            }}
            className="rounded-full bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all transform hover:-translate-y-1"
          >
            Agendar Procedimento
          </button>
        </div>
      </div>

      {/* Featured Services Mini-Gallery */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <h2 className="text-2xl font-serif font-bold text-center mb-12">Nossos Procedimentos Mais Amados</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.slice(0, 3).map(s => (
            <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <img src={s.imageUrl} alt={s.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{s.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-brand-600">R$ {s.price.toFixed(2)}</span>
                  <button 
                    onClick={() => {
                      setSelectedService(s);
                      setView('booking');
                      setBookingStep(2); // Vai para data direto
                    }}
                    className="text-sm font-semibold text-gray-900 hover:text-brand-600 flex items-center"
                  >
                    Agendar <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookingWizard = () => (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-2">
          {['Serviço', 'Data', 'Horário', 'Confirmação'].map((step, idx) => (
            <span key={step} className={`text-sm font-medium ${bookingStep > idx ? 'text-brand-600' : 'text-gray-400'}`}>
              {step}
            </span>
          ))}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-500 ease-out"
            style={{ width: `${(bookingStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps Content */}
      <div className="min-h-[400px]">
        {bookingStep === 1 && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            {services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                selected={selectedService?.id === service.id}
                onClick={() => {
                  setSelectedService(service);
                  setBookingStep(2); // Avança automaticamente para Data
                }}
              />
            ))}
          </div>
        )}

        {bookingStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <h3 className="text-2xl font-serif font-bold mb-6">Escolha a melhor data</h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-4 max-w-2xl mx-auto">
              {Array.from({ length: 14 }).map((_, i) => {
                const date = addDays(startOfToday(), i);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDate(date);
                      setBookingStep(3); // Avança automaticamente para Horário
                    }}
                    className={`
                      p-3 rounded-xl flex flex-col items-center justify-center transition-all
                      ${isSelected 
                        ? 'bg-brand-600 text-white shadow-lg scale-105' 
                        : 'bg-gray-50 text-gray-700 hover:bg-brand-50 hover:text-brand-600'
                      }
                    `}
                  >
                    <span className="text-xs uppercase font-semibold opacity-70 mb-1">
                      {format(date, 'EEE', { locale: ptBR })}
                    </span>
                    <span className="text-xl font-bold">
                      {format(date, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {bookingStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-bold mb-2">Horários Disponíveis</h3>
            <p className="text-gray-500 mb-8">
              Para {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </p>
            
            {loadingSlots || isBookingLoading ? (
              <div className="flex justify-center py-12 flex-col items-center">
                <Loader2 className="animate-spin text-brand-500 w-10 h-10 mb-4" />
                {isBookingLoading && <p className="text-brand-600 font-medium">Confirmando seu agendamento...</p>}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {availableSlots.length > 0 ? availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => {
                      setSelectedTime(slot.time);
                      if (user) {
                        handleBookingSubmit(slot.time); // Se logado, já submete
                      } else {
                        setIsAuthOpen(true); // Se não, abre login
                      }
                    }}
                    className={`
                      py-3 px-4 rounded-lg font-medium transition-all
                      ${selectedTime === slot.time 
                        ? 'bg-brand-600 text-white shadow-md' 
                        : slot.available 
                          ? 'bg-white border border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-600'
                          : 'bg-gray-100 text-gray-400 border border-gray-100 cursor-not-allowed opacity-60'
                      }
                    `}
                  >
                    {slot.time}
                  </button>
                )) : (
                  <div className="col-span-full text-gray-400 py-8">Nenhum horário disponível nesta data.</div>
                )}
              </div>
            )}
          </div>
        )}

        {bookingStep === 4 && (
          <div className="text-center max-w-lg mx-auto bg-white p-10 rounded-3xl shadow-xl border border-green-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Agendamento Confirmado!</h2>
            <p className="text-gray-600 mb-8">
              Parabéns, {user?.name.split(' ')[0]}! Seu procedimento foi agendado com sucesso.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Serviço:</span>
                <span className="font-semibold">{selectedService?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data:</span>
                <span className="font-semibold">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Horário:</span>
                <span className="font-semibold">{selectedTime}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setBookingStep(1);
                setView('home');
                setSelectedService(null);
                setSelectedDate(null);
                setSelectedTime(null);
              }}
              className="w-full bg-brand-900 text-white py-3 rounded-xl font-medium hover:bg-black transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons (Somente Voltar, já que a seleção avança) */}
      {bookingStep < 4 && (
        <div className="flex justify-between mt-12 border-t pt-8">
          <button
            onClick={() => bookingStep === 1 ? setView('home') : setBookingStep(s => s - 1)}
            className="text-gray-500 font-medium hover:text-gray-900 px-6 py-2 flex items-center"
          >
            Voltar
          </button>
          
          {/* Botão invisível apenas para manter layout se necessário, ou removido para limpar a UI */}
        </div>
      )}
    </div>
  );

  const renderAdmin = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Painel de Gestão</h2>
          <p className="text-gray-500">Gerencie seus atendimentos e serviços.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setAdminTab('appointments')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${adminTab === 'appointments' ? 'bg-brand-100 text-brand-800' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Agendamentos
          </button>
          <button
            onClick={() => setAdminTab('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${adminTab === 'services' ? 'bg-brand-100 text-brand-800' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Serviços
          </button>
        </div>
      </div>

      {adminTab === 'appointments' ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map(appt => (
                <tr 
                  key={appt.id} 
                  onClick={() => setEditingAppointment(appt)}
                  className="hover:bg-brand-50 cursor-pointer transition-colors"
                  title="Clique para editar"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appt.userName}</div>
                        <div className="text-sm text-gray-500">{appt.userPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appt.serviceTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{format(new Date(appt.date), 'dd/MM/yyyy')}</div>
                    <div className="text-sm text-gray-500">{appt.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appt.status === 'cancelled' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Cancelado
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
            Clique em um agendamento para editar ou cancelar.
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* List Services */}
          <div className="lg:col-span-2 grid gap-6">
            {services.map(s => (
              <div key={s.id} className="flex bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
                <img src={s.imageUrl} alt={s.title} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-grow">
                  <h4 className="font-bold text-lg">{s.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{s.description}</p>
                  <div className="flex gap-4 text-sm font-medium text-gray-600">
                    <span>R$ {s.price.toFixed(2)}</span>
                    <span>{s.durationMinutes} min</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setEditingService(s)}
                    className="text-gray-400 hover:text-brand-600 p-2 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(s.id)}
                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Form */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" /> Novo Procedimento
            </h3>
            <form onSubmit={handleAddService} className="space-y-4">
              <input
                required
                placeholder="Título do serviço"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 outline-none text-sm"
                value={newService.title}
                onChange={e => setNewService({...newService, title: e.target.value})}
              />
              <textarea
                required
                placeholder="Descrição breve"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 outline-none text-sm"
                value={newService.description}
                onChange={e => setNewService({...newService, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="number"
                  placeholder="Preço (R$)"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 outline-none text-sm"
                  value={newService.price}
                  onChange={e => setNewService({...newService, price: e.target.value})}
                />
                <input
                  required
                  type="number"
                  placeholder="Minutos"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-brand-500 outline-none text-sm"
                  value={newService.duration}
                  onChange={e => setNewService({...newService, duration: e.target.value})}
                />
              </div>
              
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-gray-500 text-xs">
                  {newService.image ? 'Imagem selecionada!' : 'Clique para enviar foto'}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-900 text-white py-2 rounded-lg font-medium hover:bg-black transition-colors"
              >
                Cadastrar Serviço
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout 
      user={user}
      onLoginClick={() => setIsAuthOpen(true)}
      onLogoutClick={handleLogout}
      onAdminClick={() => setView('admin')}
      onHomeClick={() => setView('home')}
    >
      {view === 'home' && renderHome()}
      {view === 'booking' && renderBookingWizard()}
      {view === 'admin' && renderAdmin()}

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
      
      <EditAppointmentModal 
        isOpen={!!editingAppointment}
        appointment={editingAppointment}
        services={services}
        onClose={() => setEditingAppointment(null)}
        onSave={handleUpdateAppointment}
        onCancelAppointment={handleCancelAppointment}
      />

      <EditServiceModal
        isOpen={!!editingService}
        service={editingService}
        onClose={() => setEditingService(null)}
        onSave={handleUpdateService}
      />
    </Layout>
  );
};

export default App;