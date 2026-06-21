# 🚀 Inicio Rápido - HomeForge Frontend

## Pre-requisitos

- ✅ Node.js 20+ instalado
- ✅ Backend corriendo en http://localhost:8080

## Instalación en 3 Pasos

### 1️⃣ Instalar Dependencias

```bash
npm install
```

### 2️⃣ Configurar Variables de Entorno

```bash
cp .env.example .env
```

El archivo `.env` por defecto apunta a `http://localhost:8080` (no necesitas cambiarlo).

### 3️⃣ Iniciar el Frontend

```bash
npm run dev
```

## ✅ Listo!

La aplicación está corriendo en **http://localhost:5174**

Abre http://localhost:5174 en tu navegador.

## Siguiente Paso

1. Crea una cuenta (Registro)
2. Inicia sesión
3. Comienza a usar el CRM

## Problemas?

### Backend no responde

Verifica que esté corriendo:
```bash
curl http://localhost:8080/actuator/health
```

### Puerto ocupado

Cambia el puerto en `vite.config.ts` o usa:
```bash
npm run dev -- --port 5175
```

Ver [README.md](README.md) para más detalles.
