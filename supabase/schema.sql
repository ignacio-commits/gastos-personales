-- Tabla de gastos
create table gastos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  fecha date not null,
  concepto text not null,
  categoria text not null,
  monto integer not null,
  metodo_pago text not null,
  created_at timestamptz default now()
);

alter table gastos enable row level security;

create policy "Users can manage their own gastos"
  on gastos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tabla de presupuestos mensuales
create table presupuestos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mes integer not null,
  anio integer not null,
  monto integer not null default 950000,
  unique(user_id, mes, anio)
);

alter table presupuestos enable row level security;

create policy "Users can manage their own presupuestos"
  on presupuestos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índices para rendimiento
create index gastos_user_fecha on gastos(user_id, fecha);
create index presupuestos_user_mes on presupuestos(user_id, mes, anio);
