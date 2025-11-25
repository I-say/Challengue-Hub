

````markdown
# 🎓 Challengue Estadística 2025

Sistema web para la **evaluación, clasificación y gestión de proyectos académicos**, desarrollado para el evento *Challengue Estadística 2025* del **Centro Universitario de Guadalajara (CUGDL – Universidad de Guadalajara)**.

Creado por el equipo **Los Científicos**, este sistema permite administrar jueces, capturar evaluaciones, visualizar rankings en tiempo real y generar reportes automáticos.

---

## 🚀 Características principales

### 🔹 Evaluación en tiempo real
Los jueces registran calificaciones desde cualquier dispositivo, y el ranking se actualiza automáticamente.

### 🔹 Panel administrativo
Permite:
- Registrar jueces  
- Gestionar proyectos  
- Revisar calificaciones  
- Restablecer la feria  
- Monitorear el estado del sistema  

### 🔹 Panel juez
Interfaz simple, rápida y optimizada para evaluar sin distracciones.

### 🔹 Ranking público
Página accesible sin login con posiciones en tiempo real.

### 🔹 Generación de reportes
Vista especial para impresión y exportación en PDF.

### 🔹 Diseño moderno
Construido con **TailwindCSS**, diseño oscuro profesional y responsivo.

---

## 🧠 Tecnologías Utilizadas

| Tecnología | Descripción |
|-----------|-------------|
| **React + TypeScript** | UI dinámica y tipada |
| **Vite** | Bundler ultrarrápido |
| **Supabase** | Base de datos, APIs y autenticación |
| **TailwindCSS** | Estilos y layout |
| **Lucide Icons** | Iconos modernos |
| **Vercel** | Hosting y despliegue continuo |

---

## 📦 Instalación y ejecución local

Clona el repositorio:

```bash
git clone https://github.com/I-say/Challengue-Hub.git
cd Challengue-Hub
````

Instala dependencias:

```bash
npm install
```

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Vista previa de producción:

```bash
npm run build
npm run preview
```

---

## 🌐 Variables de entorno (Supabase)

Crear archivo:

```
.env
```

Agregar:

```env
VITE_SUPABASE_URL="https://TUPROYECTO.supabase.co"
VITE_SUPABASE_ANON_KEY="TU_ANON_KEY"
```

> Si estos valores no existen, la app muestra una pantalla para configurarlos manualmente.

---

## 🗂 Estructura del Proyecto

```plaintext
src/
 ├── components/      # Botones, Inputs, UI Reusable
 ├── pages/           # AdminPanel, JudgePanel, Ranking, PrintView
 ├── services/        # StorageService, integración Supabase
 ├── types/           # Tipado general
 ├── App.tsx          # Lógica principal y router por hash
 └── index.tsx        # Punto de entrada
public/
 ├── CUGDL.png        # Imagen institucional
 └── logo-equipo.png  # Logo de Los Científicos
```

---

## 🖼 Capturas (Screenshots)

> Agrega imágenes aquí cuando las tengas.

### 🏠 Pantalla principal (Landing)

![Landing](./screenshots/landing.png)

### 🔧 Panel Admin

![Admin](./screenshots/admin.png)

### 🧮 Panel de Juez

![Juez](./screenshots/juez.png)

### 📊 Ranking en vivo

![Ranking](./screenshots/ranking.png)

---

## 🌍 Deploy



---

## 👨‍💻 Equipo de desarrollo

**Los Científicos · CUGDL**

* Autor principal: **Isay Morales**
* Colaboradores: Los cientificos

---

## 📄 Licencia

Este proyecto se distribuye bajo licencia **MIT**.
Puedes usarlo, modificarlo y adaptarlo libremente.

---

¡Gracias por visitar este proyecto! 🚀
Si tienes sugerencias o quieres colaborar, abre un issue o un pull request.

