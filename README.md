# Mis Gastos — Control de gastos personales

App personal para registrar y visualizar gastos mensuales en pesos chilenos (CLP).

## Stack

- Next.js 15 (App Router) + TypeScript
- Supabase (auth + base de datos)
- Tailwind CSS
- Recharts (gráfico donut)
- PWA-ready (instalable en celular)

## Configuración

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. Ve a **Authentication > Users** y crea tu usuario manualmente, o activa el registro en **Auth > Settings**

### 2. Variables de entorno

Copia el archivo de ejemplo y completa con tus credenciales:

```bash
cp .env.local.example .env.local
```

Luego edita `.env.local` con tus valores de Supabase (los encuentras en **Project Settings > API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3. Instalar dependencias y correr

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Uso

1. Inicia sesión con tu email y contraseña de Supabase
2. La app te lleva automáticamente al mes actual
3. Usa el botón **+** para agregar gastos
4. Navega entre meses con las flechas
5. Haz clic en el ícono de lápiz junto al presupuesto para editarlo
6. El presupuesto por defecto es **$950.000 CLP**

## Instalar como PWA (en iPhone/Android)

### iPhone (Safari):
1. Abre la app en Safari
2. Toca el botón de compartir (cuadrado con flecha)
3. Selecciona **"Agregar a pantalla de inicio"**

### Android (Chrome):
1. Abre la app en Chrome
2. Toca el menú (tres puntos)
3. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**

## Categorías

| Categoría | Ícono |
|-----------|-------|
| Casa | 🏠 |
| Comida | 🍎 |
| Familia | ❤️ |
| Transporte | 🚗 |
| Viajes | ✈️ |
| Deudas | 🏦 |
| Salud | 🏥 |
| Suscripciones | 📱 |
| Gastos anuales | 📅 |
| Cuidado personal | 💆 |
| Entretenimiento | 🎮 |
| Otros | 💰 |

## Métodos de pago

- Transferencia
- Tarjeta
- Efectivo
