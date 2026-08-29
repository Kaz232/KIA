import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Users,
  Video,
  Sparkles,
  X,
  Trash2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CalendarEvent, EventType, TaskPriority } from "../types";

export const CalendarView: React.FC = () => {
  const { events, createEvent, deleteEvent, tasks, agents } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: EventType;
    startDate: string;
    priority: TaskPriority;
    relatedTaskId?: string;
  }>({
    title: "",
    description: "",
    type: "MILESTONE",
    startDate: new Date().toISOString().slice(0, 10),
    priority: "HIGH",
  });

  const eventTypes: { id: EventType; label: string; color: string }[] = [
    { id: "TASK_DEADLINE", label: "Prazo de Tarefa", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { id: "MILESTONE", label: "Marco Estratégico", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    { id: "MEETING", label: "Reunião / Sessão", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    { id: "RELEASE", label: "Lançamento", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    { id: "REMINDER", label: "Lembrete", color: "bg-slate-800 text-slate-300 border-slate-700" },
  ];

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    createEvent({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: new Date(formData.startDate).toISOString(),
      allDay: true,
      priority: formData.priority,
      relatedTaskId: formData.relatedTaskId,
      status: "CONFIRMED",
    });

    setIsModalOpen(false);
  };

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const checkDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.startDate.startsWith(checkDateStr));
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090c14] border border-amber-500/20 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">Calendário Operacional</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {events.length} Eventos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Planeamento de marcos, prazos de entrega automáticos, lançamentos e reuniões estratégicas da GAG Visual.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: "",
              description: "",
              type: "MILESTONE",
              startDate: new Date().toISOString().slice(0, 10),
              priority: "HIGH",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Evento / Marco</span>
        </button>
      </div>

      {/* Month Navigation & Legend */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
        <div className="flex items-center space-x-3">
          <h2 className="text-base font-extrabold text-white">
            {monthNames[month]} <span className="text-amber-400 font-light">{year}</span>
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white text-slate-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white text-slate-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          {eventTypes.map((t) => (
            <span key={t.id} className={`px-2 py-0.5 rounded-md font-semibold border ${t.color}`}>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-[#07090e] text-center text-xs font-bold text-slate-400 py-3">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr gap-[1px] bg-slate-800/80">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-[#090c14]/40 min-h-[90px] p-2" />
          ))}

          {/* Days in current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNumber = i + 1;
            const dayEvents = getEventsForDay(dayNumber);
            const isToday =
              new Date().getDate() === dayNumber &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${dayNumber}`}
                onClick={() => {
                  if (dayEvents.length > 0) setSelectedDayEvents(dayEvents);
                }}
                className={`bg-[#0b0f19] min-h-[105px] p-2 transition-colors flex flex-col justify-between ${
                  dayEvents.length > 0 ? "cursor-pointer hover:bg-slate-900/90" : ""
                } ${isToday ? "ring-1 ring-amber-400/60 bg-amber-500/[0.03]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                        : "text-slate-300"
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-amber-400 font-bold">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event Tags inside Cell */}
                <div className="space-y-1 mt-1.5 flex-1">
                  {dayEvents.slice(0, 2).map((ev, idx) => (
                    <div
                      key={`cal-ev-${ev.id}-${idx}`}
                      className="p-1 rounded bg-slate-900/90 border border-slate-800 text-[10px] text-slate-200 font-medium truncate flex items-center space-x-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-slate-400 pl-1 block">
                      +{dayEvents.length - 2} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events Inspector Drawer */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                <span>Eventos Agendados</span>
              </h2>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {selectedDayEvents.map((ev, idx) => (
                <div
                  key={`drawer-ev-${ev.id}-${idx}`}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {ev.type}
                      </span>
                      <span className="text-xs font-bold text-white">{ev.title}</span>
                    </div>
                    {ev.description && (
                      <p className="text-xs text-slate-400 mt-1">{ev.description}</p>
                    )}
                    <div className="mt-2 text-[10px] text-slate-500">
                      Data: {new Date(ev.startDate).toLocaleDateString("pt-PT")}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      deleteEvent(ev.id);
                      setSelectedDayEvents((prev) => prev?.filter((e) => e.id !== ev.id) || null);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded"
                    title="Remover Evento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Agendar Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-amber-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Agendar Novo Evento ou Marco</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título do Evento</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ex: Lançamento Campanha Outono/Inverno"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Objetivos do marco ou pauta da sessão..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Evento</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="MILESTONE">Marco Estratégico (MILESTONE)</option>
                    <option value="TASK_DEADLINE">Prazo de Tarefa (DEADLINE)</option>
                    <option value="MEETING">Reunião / Alinhamento (MEETING)</option>
                    <option value="RELEASE">Lançamento (RELEASE)</option>
                    <option value="REMINDER">Lembrete (REMINDER)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as TaskPriority })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vincular a Tarefa (Opcional)</label>
                  <select
                    value={formData.relatedTaskId || ""}
                    onChange={(e) => setFormData({ ...formData, relatedTaskId: e.target.value || undefined })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">Sem vínculo direto</option>
                    {tasks.map((t, idx) => (
                      <option key={`cal-opt-task-${t.id}-${idx}`} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-bold rounded-xl text-xs"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
