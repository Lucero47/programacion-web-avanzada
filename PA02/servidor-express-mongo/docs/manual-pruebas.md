# Guía de pruebas manuales

Usa una base de datos local de pruebas o un clúster aislado. No ejecutes los casos de registro y cambios de rol en la base con datos reales.

1. Configura `ADMIN_EMAIL`; intenta registrar otro correo primero y confirma que el servidor lo rechace. Registra la cuenta configurada con una contraseña de al menos ocho caracteres y confirma el rol `admin`. Con `ADMIN_EMAIL` vacío, la primera cuenta será administradora.
2. Registra otra cuenta y confirma que recibe rol `viewer`.
3. Inicia sesión con credenciales válidas y confirma que aparece el usuario y su rol; una contraseña incorrecta debe responder con `401`.
4. Solicita `GET /api/productos` sin token y confirma `401`; repite con una cuenta iniciada y confirma que lista el catálogo.
5. Como `viewer`, intenta `POST /api/productos` y confirma `403`. Como `editor` o `admin`, crea, edita y elimina un producto.
6. Como `admin`, consulta `GET /api/auth/usuarios` y cambia el rol de otra cuenta. No debe permitir quitar el propio rol de administrador.
7. Cierra sesión y reutiliza el token anterior: las solicitudes protegidas deben responder `401`.
8. Prueba Angular en `http://localhost:4200` y React en `http://localhost:5174`; ambos deben mostrar los mismos datos de MongoDB.
9. Verifica que `/panel` y las rutas internas de React carguen al usar el servidor de producción.

Las pruebas automatizadas sin base de datos están en `tests/security.test.js` y se ejecutan con `npm test`.
