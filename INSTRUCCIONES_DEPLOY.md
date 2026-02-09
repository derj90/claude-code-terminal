# Instrucciones para Completar el Deploy

## Pasos en el Panel Dokploy

1. **Accede al panel**: http://103.199.184.102:3000

2. **Navega al proyecto**: claude-code-terminal

3. **En la aplicación claude-terminal-mzwqje**, configura:
   - **Build Type**: Cambia de "Nixpacks" a **"Dockerfile"**
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context Path**: `.`
   
4. **En la sección Environment Variables**, agrega:
   ```
   NODE_ENV=production
   PORT=3001
   ```

5. **Haz click en "Save"** para guardar los cambios

6. **Haz click en "Deploy"** para iniciar el nuevo despliegue

## Verificación

Una vez desplegado exitosamente:

1. El build debería mostrar "✅ Docker build successful"
2. La aplicación estará disponible en el puerto configurado
3. Puedes verificar el health check en: `http://[IP]:3001/health`

## Solución de Problemas

Si el build falla nuevamente:

### Opción 1: Usar una imagen más simple sin node-pty
Podemos reemplazar node-pty con una solución basada en exec que no requiere compilación nativa.

### Opción 2: Usar Docker Hub
1. Construir la imagen localmente: `docker build -t derj90/claude-terminal:latest .`
2. Push a Docker Hub: `docker push derj90/claude-terminal:latest`
3. En Dokploy, cambiar Source Type a "Docker Image"
4. Usar imagen: `derj90/claude-terminal:latest`

## Estado Actual

- ✅ Código actualizado con Dockerfile corregido
- ✅ Configuración dokploy.yaml agregada
- ✅ .nixpacksignore agregado para evitar Nixpacks
- ✅ Repositorio GitHub actualizado
- ⏳ Pendiente: Configuración manual en Dokploy