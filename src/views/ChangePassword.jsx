import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { changePasswordService } from '@services/authService'; // ⬅️ deberás tener este servicio creado
import { useState } from 'react';

// 📌 Esquema Zod
const schema = z.object({
  currentPassword: z.string().min(6, 'La contraseña actual es obligatoria'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmNewPassword: z.string().min(6, 'Debes confirmar tu nueva contraseña'),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword'],
});

export const ChangePassword = () => {
  const navigate = useNavigate();
  const [serverMessage, setServerMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const userId = JSON.parse(localStorage.getItem('user'))?.id;

    try {
      await changePasswordService(userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      alert('Contraseña actualizada con éxito');
      navigate('/dashboard/profile');
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Error al cambiar la contraseña');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-[#2c003e] text-white">
      <div className="w-full max-w-md bg-[#4a0e68] p-8 rounded-xl space-y-6 border border-white/10">
        <h2 className="text-2xl font-bold text-center">Cambiar contraseña</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Contraseña actual</label>
            <input
              type="password"
              {...register('currentPassword')}
              className="w-full px-4 py-2 rounded bg-white/10 placeholder-white/70"
              placeholder="********"
            />
            {errors.currentPassword && (
              <p className="text-red-400 text-sm">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Nueva contraseña</label>
            <input
              type="password"
              {...register('newPassword')}
              className="w-full px-4 py-2 rounded bg-white/10 placeholder-white/70"
              placeholder="********"
            />
            {errors.newPassword && (
              <p className="text-red-400 text-sm">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              {...register('confirmNewPassword')}
              className="w-full px-4 py-2 rounded bg-white/10 placeholder-white/70"
              placeholder="********"
            />
            {errors.confirmNewPassword && (
              <p className="text-red-400 text-sm">{errors.confirmNewPassword.message}</p>
            )}
          </div>

          {serverMessage && (
            <p className="text-sm text-red-400">{serverMessage}</p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded font-semibold mt-2"
          >
            Guardar nueva contraseña
          </button>
        </form>
      </div>
    </div>
  );
};
