import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerRequest } from '@services/authService';
import logo from '@assets/logo.png';
import bgImage from '@assets/fondo.png';

export const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    lastName: '',
    role: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined })); // limpia error de ese campo al escribir
    setServerError(''); // limpia error general
  };

  // --- Validaciones de cliente ---
  const validate = (values) => {
    const e = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[0-9+\s()-]{6,}$/;

    if (!values.name.trim()) e.name = 'Nombre es obligatorio.';
    if (!values.lastName.trim()) e.lastName = 'Apellido es obligatorio.';
    if (!values.role.trim()) e.role = 'Rol es obligatorio.';
    if (!values.username.trim()) e.username = 'Nombre de usuario es obligatorio.';

    if (!values.email.trim()) e.email = 'Correo es obligatorio.';
    else if (!emailRe.test(values.email)) e.email = 'Correo no es válido.';

    if (!values.phone.trim()) e.phone = 'Teléfono es obligatorio.';
    else if (!phoneRe.test(values.phone)) e.phone = 'Teléfono no es válido.';

    if (!values.password) e.password = 'Contraseña es obligatoria.';
    else if (values.password.length < 6) e.password = 'Mínimo 6 caracteres.';

    if (!values.confirmPassword) e.confirmPassword = 'Confirma tu contraseña.';
    else if (values.password !== values.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden.';

    if (!values.acceptedTerms) e.acceptedTerms = 'Debes aceptar los términos y condiciones.';

    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === 'checkbox' ? checked : value);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const fieldErrors = validate(form);
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  // Mapear errores del backend (400) a mensajes claros
  const handleServerError = (axiosError) => {
    // axiosError?.response?.status, axiosError?.response?.data
    const res = axiosError?.response;
    if (!res) {
      setServerError(axiosError?.message || 'Ocurrió un error inesperado.');
      return;
    }

    const { status, data } = res;
    // Intentar mensajes por campo
    const newFieldErrors = { ...errors };

    // Algunos backends envían { message: "..."} o { error: "..."} o { errors: { email:"...", username:"..." } } o array
    const message = data?.message || data?.error;

    if (status === 400) {
      // Si viene objeto de errores por campo
      if (data?.errors && typeof data.errors === 'object') {
        // puede ser objeto { email: 'ya existe', username: '...' } o array de objetos
        if (!Array.isArray(data.errors)) {
          for (const k of Object.keys(data.errors)) {
            newFieldErrors[k] = data.errors[k];
          }
        } else {
          data.errors.forEach((it) => {
            // soporta formatos { field:'email', message:'...' } o { msg:'...', param:'email' }
            const field = it.field || it.param;
            const msg = it.message || it.msg || it.error || 'Dato inválido.';
            if (field) newFieldErrors[field] = msg;
          });
        }
      }

      // Si el backend solo manda un mensaje genérico, intentamos inferir campo
      if (message) {
        const lower = String(message).toLowerCase();
        if (lower.includes('correo') || lower.includes('email')) {
          newFieldErrors.email = message;
        } else if (lower.includes('usuario') || lower.includes('username')) {
          newFieldErrors.username = message;
        } else if (lower.includes('tel') || lower.includes('phone')) {
          newFieldErrors.phone = message;
        } else {
          setServerError(message);
        }
      }

      setErrors(prev => ({ ...prev, ...newFieldErrors }));
      if (!message && Object.keys(newFieldErrors).length === 0) {
        setServerError('Datos inválidos. Revisa los campos.');
      }
      return;
    }

    // Otros códigos
    if (status === 409) {
      setServerError(data?.message || 'Conflicto: datos ya existentes.');
      return;
    }
    if (status >= 500) {
      setServerError('Servidor no disponible. Intenta de nuevo.');
      return;
    }
    setServerError(message || 'No se pudo completar el registro.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      // Enviar datos "limpios"
      const payload = {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        role: form.role.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      };
      await registerRequest(payload);
      alert('✅ Cuenta creada con éxito');
      navigate('/');
    } catch (err) {
      handleServerError(err);
    } finally {
      setLoading(false);
    }
  };

  // helper CSS para inputs con error
  const inputBase =
    'w-full bg-white/10 px-4 py-2 rounded placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400/60 transition';
  const inputWithError = 'ring-2 ring-red-400 focus:ring-red-400';

  const hasError = (name) => Boolean(errors[name]);

  const isSubmitDisabled = loading;

  return (
    <div className="min-h-screen w-full flex text-white bg-gradient-to-r from-[#3e0b5f] to-[#12002e]">
      {/* Panel izquierdo - Formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-start px-10 py-12 relative bg-[#4B0D69] rounded-r-[30px] shadow-lg">
        <div className="absolute top-0 left-0 w-full h-full bg-[#2b0c4a]/30 rounded-r-[30px] pointer-events-none" />

        <div className="z-10 w-full max-w-md">
          <h1 className="text-4xl font-bold mb-2">Bienvenido</h1>
          <p className="mb-6 text-white/80">Nos alegra verte por aquí</p>

          <h2 className="text-2xl font-bold mb-4">
            Crea tu cuenta <span className="text-[#a58fff]">Shain</span>
          </h2>

          {/* Error global del servidor */}
          {serverError && (
            <div className="mb-4 rounded bg-red-500/15 border border-red-500/30 text-red-200 px-3 py-2 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos */}
            <div className="flex gap-2">
              <div className="w-1/2">
                <input
                  name="name"
                  placeholder="Nombre"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBase} ${hasError('name') ? inputWithError : ''}`}
                  aria-invalid={hasError('name')}
                  aria-describedby={hasError('name') ? 'err-name' : undefined}
                />
                {hasError('name') && <p id="err-name" className="text-red-300 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="w-1/2">
                <input
                  name="lastName"
                  placeholder="Apellido"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBase} ${hasError('lastName') ? inputWithError : ''}`}
                  aria-invalid={hasError('lastName')}
                  aria-describedby={hasError('lastName') ? 'err-lastName' : undefined}
                />
                {hasError('lastName') && <p id="err-lastName" className="text-red-300 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <input
              name="role"
              placeholder="Rol"
              value={form.role}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputBase} ${hasError('role') ? inputWithError : ''}`}
              aria-invalid={hasError('role')}
              aria-describedby={hasError('role') ? 'err-role' : undefined}
            />
            {hasError('role') && <p id="err-role" className="text-red-300 text-xs -mt-2">{errors.role}</p>}

            <input
              name="username"
              placeholder="Nombre de usuario"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputBase} ${hasError('username') ? inputWithError : ''}`}
              aria-invalid={hasError('username')}
              aria-describedby={hasError('username') ? 'err-username' : undefined}
            />
            {hasError('username') && <p id="err-username" className="text-red-300 text-xs -mt-2">{errors.username}</p>}

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputBase} ${hasError('email') ? inputWithError : ''}`}
              aria-invalid={hasError('email')}
              aria-describedby={hasError('email') ? 'err-email' : undefined}
            />
            {hasError('email') && <p id="err-email" className="text-red-300 text-xs -mt-2">{errors.email}</p>}

            <input
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputBase} ${hasError('phone') ? inputWithError : ''}`}
              aria-invalid={hasError('phone')}
              aria-describedby={hasError('phone') ? 'err-phone' : undefined}
            />
            {hasError('phone') && <p id="err-phone" className="text-red-300 text-xs -mt-2">{errors.phone}</p>}

            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputBase} ${hasError('password') ? inputWithError : ''}`}
              aria-invalid={hasError('password')}
              aria-describedby={hasError('password') ? 'err-password' : undefined}
            />
            {hasError('password') && <p id="err-password" className="text-red-300 text-xs -mt-2">{errors.password}</p>}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputBase} ${hasError('confirmPassword') ? inputWithError : ''}`}
              aria-invalid={hasError('confirmPassword')}
              aria-describedby={hasError('confirmPassword') ? 'err-confirmPassword' : undefined}
            />
            {hasError('confirmPassword') && (
              <p id="err-confirmPassword" className="text-red-300 text-xs -mt-2">{errors.confirmPassword}</p>
            )}

            {/* Checkbox */}
            <label className="flex items-center gap-2 text-sm mt-2">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={form.acceptedTerms}
                onChange={handleChange}
                onBlur={handleBlur}
                className="accent-pink-500"
              />
              <span>
                Acepto los{' '}
                <a href="#" className="underline text-pink-400">
                  Términos y Condiciones
                </a>
              </span>
            </label>
            {hasError('acceptedTerms') && (
              <p className="text-red-300 text-xs -mt-2">{errors.acceptedTerms}</p>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 px-6 py-2 rounded font-semibold w-full mt-2 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-sm mt-6">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/" className="underline text-pink-400">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Panel derecho con imagen */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute top-0 right-0 p-6">
          <img src={logo} alt="Shain logo" className="h-10" />
        </div>
      </div>
    </div>
  );
};
