# Análisis de Fallas Potenciales y Sugerencias de Mejora

Este documento detalla los posibles puntos de falla en la arquitectura de orquestación de Zapía IA y propone soluciones para escalar el sistema de manera robusta.

## 1. Análisis de Fallas Potenciales (Riesgos)

### 1.1. Seguridad: Exposición de Credenciales
- **Falla:** Si un agente subordinado es comprometido y posee el `SERVICE_ROLE_KEY`, el atacante tiene acceso total a la base de datos.
- **Impacto:** Crítico. Robo de datos de todos los agentes.
- **Sugerencia:** Implementar **Supabase Auth** para que cada agente se loguee con un par email/password o token único y usar **Row Level Security (RLS)** para que solo puedan leer sus propios comandos y actualizar su propio estado.

### 1.2. Escalabilidad: Cuellos de Botella en Realtime
- **Falla:** Con cientos de agentes escuchando la misma tabla `commands`, el tráfico de websockets puede saturar el cliente o los límites de Supabase Realtime.
- **Impacto:** Medio-Alto. Retraso en la ejecución de comandos.
- **Sugerencia:** Usar filtros en la suscripción (Realtime Quotas) y considerar la partición de tablas si el volumen crece exponencialmente.

### 1.3. Conectividad: Comandos en el "Limbo"
- **Falla:** Si se envía un comando mientras el agente está en estado `red` (desconectado), el comando queda `pending` pero el agente no recibirá la notificación push de Realtime al reconectarse si no se maneja la lógica de "catch-up".
- **Impacto:** Medio. Tareas no ejecutadas.
- **Sugerencia:** Implementar una lógica de "Sincronización Inicial" donde el agente, al pasar a `green`, busque en la tabla `commands` cualquier registro `pending` dirigido a él.

### 1.4. Persistencia: Ruido en Status Logs
- **Falla:** Un agente inestable puede generar miles de registros en `status_logs` en pocos minutos.
- **Impacto:** Bajo-Medio. Consumo innecesario de almacenamiento y lentitud en queries de monitoreo.
- **Sugerencia:** Implementar un **TTL (Time To Live)** en la tabla de logs o una función de limpieza automática (Cron job) en Supabase para borrar logs antiguos.

## 2. Sugerencias de Mejora Arquitectónica

### 2.1. Uso de Supabase Edge Functions
- En lugar de que el Orquestador sea una instancia de Zapía corriendo en un servidor, parte de la lógica de delegación puede residir en **Edge Functions**. Esto reduce la latencia y elimina la necesidad de mantener un proceso "líder" siempre activo para tareas simples.

### 2.2. Implementación de un "Dead Letter Queue" (DLQ)
- Si un comando falla más de 3 veces (indicado por un contador en la tabla `commands`), moverlo a un estado de `error_review` para que un operador humano o el Orquestador Principal tome una decisión manual.

### 2.3. Validación de Metadata Robusta
- No confiar ciegamente en lo que el agente reporta. Por ejemplo, validar el formato del número de WhatsApp y la autenticidad del token de Google antes de actualizar `agent_metadata`.

### 2.4. Dashboard Proactivo
- Agregar un sistema de **Web Push Notifications** al panel administrativo. Si un agente crítico cambia de `green` a `red`, el administrador recibe una notificación en su móvil/escritorio sin necesidad de tener el dashboard abierto.

### 2.5. Versionado de Agentes
- Incluir un campo `version` en la tabla `agents`. Esto permite al Orquestador saber si un Subordinado tiene las capacidades necesarias para ejecutar un comando específico o si requiere una actualización previa (estado `blue`).
