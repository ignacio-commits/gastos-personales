// Script para cargar los gastos de Abril a Supabase
// Ejecutar con: node seed-abril.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mdraftlibpuvqsuqndup.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcmFmdGxpYnB1dnFzdXFuZHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ4MzMzNCwiZXhwIjoyMDkwMDU5MzM0fQ.pH4qWxRdj53LMNsap9vLvipZuoaUIgszpUeUPVzy3Qg';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Gastos de Abril desde la planilla con tarjetas asignadas
const gastosAbril = [
  { concepto: 'Arriendo', categoria: 'Casa', monto: 400000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-01' },
  { concepto: 'Comida', categoria: 'Comida', monto: 200000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-01' },
  { concepto: 'Estacionamiento', categoria: 'Transporte', monto: 25000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-02' },
  { concepto: 'Bencina', categoria: 'Transporte', monto: 25000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-02' },
  { concepto: 'Peluquería', categoria: 'Cuidado personal', monto: 25000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-03' },
  { concepto: 'Plan Celular', categoria: 'Suscripciones', monto: 16000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-04' },
  { concepto: 'CMR Costo Fijo', categoria: 'Suscripciones', monto: 14000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-04' },
  { concepto: 'Apple Pay', categoria: 'Suscripciones', monto: 3800, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-05' },
  { concepto: 'Papá 1/6', categoria: 'Deudas', monto: 122000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-06' },
  { concepto: 'Atakama Outdoor 3/6', categoria: 'Deudas', monto: 8400, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-07' },
  { concepto: 'Atakama Outdoor 1/1', categoria: 'Deudas', monto: 15990, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-08' },
  { concepto: 'Mercado libre 2/3', categoria: 'Deudas', monto: 2800, metodo_pago: 'Tarjeta', tarjeta: 'Rappicard', fecha: '2026-04-09' },
  { concepto: 'Mercado libre 2/3 (2)', categoria: 'Deudas', monto: 5300, metodo_pago: 'Tarjeta', tarjeta: 'Rappicard', fecha: '2026-04-09' },
  { concepto: 'Mercado libre 4/9', categoria: 'Deudas', monto: 25300, metodo_pago: 'Tarjeta', tarjeta: 'Rappicard', fecha: '2026-04-10' },
  { concepto: 'Paris Alto Las Condes 2/3 (zapatos)', categoria: 'Deudas', monto: 14500, metodo_pago: 'Tarjeta', tarjeta: 'Falabella', fecha: '2026-04-10' },
  { concepto: 'Fabrics 4/6', categoria: 'Deudas', monto: 4415, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-11' },
  { concepto: 'Avance 4/12', categoria: 'Deudas', monto: 86500, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-12' },
  { concepto: 'Travel Duty 2/6', categoria: 'Deudas', monto: 41300, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-13' },
  { concepto: 'Cama Rosen 6/6', categoria: 'Deudas', monto: 48500, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-14' },
  { concepto: 'Sodimac Terraza 4/6', categoria: 'Deudas', monto: 17600, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-15' },
  { concepto: 'Sodimac Veladores 4/6', categoria: 'Deudas', monto: 10600, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-15' },
  { concepto: 'Mercado Pago 6/6', categoria: 'Deudas', monto: 160300, metodo_pago: 'Tarjeta', tarjeta: 'Rappicard', fecha: '2026-04-16' },
  { concepto: 'Mercadopago 5/12', categoria: 'Deudas', monto: 22063, metodo_pago: 'Tarjeta', tarjeta: 'Rappicard', fecha: '2026-04-17' },
  { concepto: 'Oasis 3/6', categoria: 'Deudas', monto: 34300, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-18' },
  { concepto: 'Mercadopago 3/6', categoria: 'Deudas', monto: 9700, metodo_pago: 'Tarjeta', tarjeta: 'Rappicard', fecha: '2026-04-19' },
  { concepto: 'Mercadopago 3/3', categoria: 'Deudas', monto: 6630, metodo_pago: 'Tarjeta', tarjeta: 'Rappicard', fecha: '2026-04-19' },
  { concepto: 'The Line 3/3', categoria: 'Deudas', monto: 30000, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-20' },
  { concepto: 'Decathlon 2/6', categoria: 'Deudas', monto: 18500, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-21' },
  { concepto: 'Mercadopago 2/6', categoria: 'Deudas', monto: 37500, metodo_pago: 'Tarjeta', tarjeta: 'Rappicard', fecha: '2026-04-22' },
  { concepto: 'Falabella 1/6', categoria: 'Deudas', monto: 32300, metodo_pago: 'Tarjeta', tarjeta: 'Falabella', fecha: '2026-04-23' },
  { concepto: 'Starbucks 1/1', categoria: 'Comida', monto: 14410, metodo_pago: 'Tarjeta', tarjeta: 'Banco de Chile', fecha: '2026-04-24' },
  { concepto: 'Gastos Básicos', categoria: 'Casa', monto: 50000, metodo_pago: 'Transferencia', tarjeta: null, fecha: '2026-04-25' },
];

async function seedData() {
  try {
    // Obtener el usuario actual (la que creaste en Supabase)
    const { data: { users } } = await supabase.auth.admin.listUsers();

    if (users.length === 0) {
      console.error('❌ No hay usuarios en Supabase. Crea uno primero.');
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`✅ Usando usuario: ${users[0].email}`);

    // Primero, eliminar los gastos antiguos de abril
    await supabase
      .from('gastos')
      .delete()
      .eq('user_id', userId)
      .gte('fecha', '2026-04-01')
      .lte('fecha', '2026-04-30');

    // Insertar gastos
    const { data, error } = await supabase
      .from('gastos')
      .insert(
        gastosAbril.map(gasto => ({
          ...gasto,
          user_id: userId,
        }))
      );

    if (error) {
      console.error('❌ Error al insertar gastos:', error);
      process.exit(1);
    }

    console.log(`✅ ${gastosAbril.length} gastos cargados exitosamente en Abril 2026`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seedData();
