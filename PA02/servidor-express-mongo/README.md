# NexoTech — catálogo electrónico

Aplicación para administrar productos electrónicos con registro e inicio de sesión, permisos por rol y dos interfaces web: Angular 16 y un panel alternativo React. Las interfaces comparten la API Express y la misma base MongoDB.

## Requisitos

- Node.js 20.19 o posterior y npm.
- MongoDB local o un clúster de MongoDB Atlas.

## Instalación y ejecución

Desde la raíz del repositorio:

```powershell
npm run setup
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edita `.env` y configura `MONGO_URI` y un `JWT_SECRET` aleatorio de al menos 32 caracteres. No subas `.env` al repositorio. Inicia MongoDB y ejecuta:

```powershell
npm start
```

El comando compila Angular y React y levanta Express en `http://localhost:3001`. Angular se sirve en `/` y React en `/panel`.

Para desarrollo, abre tres terminales en la raíz:

```powershell
npm run api:dev
npm run frontend:dev
npm run panel:dev
```

Abre Angular en `http://localhost:4200` o React en `http://localhost:5174`. Ambos se conectan a la API del puerto 3001. `npm run build` compila las dos interfaces; `npm run start:server` inicia el servidor usando las compilaciones existentes.

## Cuentas y roles

Regístrate desde `/registro` en cualquiera de las interfaces. Configura `ADMIN_EMAIL` antes del primer registro: esa cuenta recibe el rol `admin` y las siguientes comienzan como `viewer`. Si `ADMIN_EMAIL` está vacío, la primera cuenta obtiene el rol administrador. Un administrador puede cambiar los roles desde **Usuarios**.

| Rol | Acceso |
| --- | --- |
| `admin` | Consulta y administra productos, usuarios y roles |
| `editor` | Consulta, crea, edita y elimina productos |
| `viewer` | Consulta productos |

Las contraseñas se guardan con bcrypt. La API emite JWT con vencimiento y versión de sesión; el cierre de sesión invalida el token en el servidor. Ambas interfaces envían el token y llevan al acceso cuando la sesión vence.

## API REST

Las rutas de autenticación son públicas salvo `/logout`, `/me` y administración de usuarios. El CRUD de productos requiere token.

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/api/auth/registro` | Público; limitado por intentos |
| POST | `/api/auth/login` | Público; limitado por intentos |
| POST | `/api/auth/logout` | Usuario autenticado |
| GET | `/api/auth/me` | Usuario autenticado |
| GET | `/api/auth/usuarios` | `admin` |
| PATCH | `/api/auth/usuarios/:id/rol` | `admin` |
| GET | `/api/productos` | Usuario autenticado |
| GET | `/api/productos/:id` | Usuario autenticado |
| POST | `/api/productos` | `admin`, `editor` |
| PUT | `/api/productos/:id` | `admin`, `editor` |
| DELETE | `/api/productos/:id` | `admin`, `editor` |

Los datos de muestra están en `docs/test-data.json`. `npm run seed` carga o actualiza los productos electrónicos de demostración conservando los registros no relacionados.

## Pruebas

```powershell
npm test
```

Las pruebas automatizadas validan configuración de roles, selección del hash de contraseña, bcrypt y claims/secretos de JWT sin conectarse a MongoDB. Los flujos completos de roles e interfaces se describen en [docs/manual-pruebas.md](docs/manual-pruebas.md).

## Arquitectura

```text
Angular 16 ─┐
            ├─ HTTP + JWT ─> Express ─> controladores ─> modelos Mongoose ─> MongoDB
React ──────┘                  ├─ auth y roles
                               └─ archivos estáticos Angular y React
```

El backend conserva la estructura MVC existente en `backend/src`: `routes`, `controllers`, `models`, `middleware` y `config`. Angular usa interceptores y guards funcionales; React usa React Router, Hooks, Context y Axios. Consulta [docs/arquitectura.md](docs/arquitectura.md) para el detalle.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `MONGO_URI` | Conexión a MongoDB |
| `PORT` | Puerto de Express, por defecto `3001` |
| `JWT_SECRET` | Secreto aleatorio de al menos 32 caracteres |
| `JWT_EXPIRES_IN` | Duración JWT, por defecto `8h` |
| `ADMIN_EMAIL` | Correo que recibe rol admin al registrarse |
| `CORS_ORIGINS` | Orígenes separados por coma para desarrollo |

## Despliegue

`render.yaml` prepara un servicio web de Render. Añade una URI de MongoDB Atlas en el entorno del servicio y completa el despliegue desde una cuenta con acceso a Render. Este repositorio no contiene una URL publicada.
